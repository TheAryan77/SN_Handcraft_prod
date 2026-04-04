import { cookies } from "next/headers";

export async function getServerSession(...args: any[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const userStr = cookieStore.get("user")?.value;
  
  if (!token) return null;
  
  return {
    accessToken: token,
    user: userStr ? JSON.parse(userStr) : null
  };
}
