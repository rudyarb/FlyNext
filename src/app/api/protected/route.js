import { verifyToken } from "@utils/auth";

export async function GET(req) {
  const user = verifyToken(req);

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized access" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  console.log(user)
  return new Response(JSON.stringify({ message: "Protected content accessed!" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}