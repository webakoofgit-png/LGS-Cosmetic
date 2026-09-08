const ADMIN_TOKEN_KEY = "lgs-admin-token";
const ADMIN_PROFILE_KEY = "lgs-admin-profile";

export type AdminProfile = {
  id: number;
  name: string;
  email: string;
  role: string;
  status?: string;
};

export function getAdminToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getAdminProfile() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ADMIN_PROFILE_KEY);
  return raw ? (JSON.parse(raw) as AdminProfile) : null;
}

export function setAdminSession(token: string, profile: AdminProfile) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(profile));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_PROFILE_KEY);
}
