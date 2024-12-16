export interface AdminUser {
  email: string;
  avatarUrl: string;
  isAdmin: boolean;
}

export function getUserFromCookie(): AdminUser | null {
  const cookies = document.cookie;
  if (!cookies) {
    console.error("No cookies found");
    return null;
  }

  const userCookie = cookies.split("; ").find((row) => row.startsWith("user="));
  if (!userCookie) {
    console.error("User cookie not found");
    return null;
  }

  const cookieParts = userCookie.split("=");
  const cookieValue = cookieParts[1];
  if (!cookieValue) {
    console.error("Cookie value is missing");
    return null;
  }

  try {
    const userData = JSON.parse(decodeURIComponent(cookieValue));
    return userData;
  } catch (error) {
    console.error("Failed to parse user cookie:", error);
    return null;
  }
}
