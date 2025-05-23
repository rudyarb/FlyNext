import { verifyRefresh} from "@utils/auth";
import { generateToken } from "@utils/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Extract the refresh token from the request body
    const { refreshToken } = await req.json();

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
    const { id, email, role } = decoded;

    // Generate new access token
    const newAccessToken = generateToken({ id, email, role }, "access");

    // Return the new access token in the response
    return NextResponse.json(
      { accessToken: newAccessToken },
      { status: 200 }
    );
  }
  catch{
    // Handle any unexpected errors
    return NextResponse.json({ message: "Error refreshing token" }, { status: 400 });
  }
}
