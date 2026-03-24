import ImageKit from "imagekit";

export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function uploadSelfie(
  base64Image: string,
  fileName: string
): Promise<string> {
  // Remove data URL prefix if present
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const response = await imagekit.upload({
    file: base64Data,
    fileName: fileName,
    folder: "/absensi/selfies",
    useUniqueFileName: true,
  });

  return response.url;
}
