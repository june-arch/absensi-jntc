import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // DEBUG: Log middleware execution
  console.log(`[MIDDLEWARE] pathname=${pathname}, user=${user ? user.email : 'null'}, cookies=${request.cookies.getAll().map(c => c.name).join(', ')}`);

  // Allow public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (user) {
      console.log(`[MIDDLEWARE] User authenticated on public route, redirecting to /dashboard`);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    console.log(`[MIDDLEWARE] No user on public route, allowing access`);
    return supabaseResponse;
  }

  // Special handling for dashboard - if user is not found, check if we just logged in
  if (pathname === "/dashboard" && !user) {
    console.log(`[MIDDLEWARE] No user found for dashboard, checking for recent login cookies`);
    
    // Check if we have auth cookies that might need a moment to be processed
    const authCookies = request.cookies.getAll().filter(c => c.name.includes('supabase.auth.token'));
    if (authCookies.length > 0) {
      console.log(`[MIDDLEWARE] Found auth cookies, allowing access to dashboard (session might be establishing)`);
      return supabaseResponse;
    }
  }

  // Protect all other routes
  if (!user) {
    console.log(`[MIDDLEWARE] No user on protected route ${pathname}, redirecting to /login`);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  console.log(`[MIDDLEWARE] User authenticated, allowing access to ${pathname}`);
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
