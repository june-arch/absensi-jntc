export type Role = "admin" | "employee";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  employee_id: string;
  department: string;
  position: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AttendanceType = "check_in" | "check_out";
export type AttendanceStatus = "present" | "late" | "absent";

export interface Attendance {
  id: string;
  user_id: string;
  type: AttendanceType;
  status: AttendanceStatus;
  selfie_url: string;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  created_at: string;
  profile?: Profile;
}
