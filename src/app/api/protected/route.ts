import { verifyToken } from "@utils/auth";

// Define interfaces for better type organization
interface ProtectedResponse {
  message?: string;
  error?: string;
}

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export async function GET(req: Request): Promise<Response> {
  const result = await verifyToken(req);
  
  if ('error' in result) {
    return new Response(JSON.stringify({ error: "Unauthorized access" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = result as unknown as TokenPayload;
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized access" } as ProtectedResponse), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  console.log(user);
  return new Response(JSON.stringify({ message: "Protected content accessed!" } as ProtectedResponse), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}