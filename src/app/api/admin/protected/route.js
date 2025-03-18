import { verifyToken } from "@utils/auth";

export async function GET(req) {
  // Verify the token and get the payload
  const user = verifyToken(req);

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