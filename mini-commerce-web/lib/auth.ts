import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  role?: string;
  exp?: number;
  [key: string]: unknown;
};

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}

export function getUserRole() {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    const role =
      decoded.role ||
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (typeof role === "string") {
      return role;
    }

    return null;
  } catch {
    return null;
  }
}

export function isAdmin() {
  return getUserRole() === "Admin";
}