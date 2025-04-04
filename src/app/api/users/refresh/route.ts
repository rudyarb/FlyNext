import { verifyRefresh} from "@utils/auth";
import { generateToken } from "@utils/auth";
import { NextResponse } from "next/server";

// Define interfaces for the decoded token payload
interface DecodedToken {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

// Define interface for the request body
interface RefreshRequestBody {
  refreshToken: string;
}

// Define interface for the response
interface TokenResponse {
  accessToken: string;
}

export async function POST(req: Request): Promise<NextResponse<TokenResponse | { message: string }>> {
  try {
    // Extract the refresh token from the request body
    const { refreshToken } = await req.json() as RefreshRequestBody;

    // Check is refresh token is included
    if (!refreshToken) {
      return NextResponse.json({ message: "Refresh token is required" }, { status: 400 });
    }

    // Verify the refresh token
    const decoded = await verifyRefresh(refreshToken);

    // OpenAI. (2025). ChatGPT (Version 4). Retrieved from https://openai.com/
    // Check if refresh token is invalid
    if (decoded instanceof NextResponse) {
      return decoded;  // Return the error response from verifyRefresh
    }

    // Create a new access token using the same payload
    const { id, email, role } = decoded as DecodedToken;

    // Generate new access token
    const newAccessToken = generateToken({ id, email, role }, "access");

    // Return the new access token in the response
    return NextResponse.json(
      { accessToken: newAccessToken },
      { status: 200 }
    );
  }
  catch {
    // Handle any unexpected errors
    return NextResponse.json({ message: "Error refreshing token" }, { status: 400 });
  }
}
