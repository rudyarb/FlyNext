import { verifyToken } from "@utils/auth";

interface UserPayload {
  role: string;
}

export async function GET(req: Request): Promise<Response> {
  // Verify the token and get the payload
  const payload = await verifyToken(req);
  const user: UserPayload | null = payload && 'role' in payload ? payload as unknown as UserPayload : null;

  // If the token is invalid or missing, it will return null
  if (!user || user.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
      status: 403,  // Forbidden for non-admins
      headers: { "Content-Type": "application/json" },
    });
  }

  // If the user is an admin, return the protected resource
  return new Response(JSON.stringify({ message: "Welcome, Admin!" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}