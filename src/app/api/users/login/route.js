import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { comparePassword, generateToken } from "@utils/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate the input
    if (
      !email ||
      !password ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 400 },
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Check if user exists and password is correct
    if (!user || !comparePassword(password, user.password)) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Create the payload for the JWT
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
    };

    // Generate the access and refresh tokens
    const accessToken = generateToken(payload, "access");
    const refreshToken = generateToken(payload, "refresh");

    // Return the tokens in the response
    return NextResponse.json(
      { accessToken, refreshToken },
      { status: 200 }
    );
  }
  catch (error) { // Catch any errors
    return NextResponse.json({ message: "Error logging in user" }, { status: 400 });
  }
}
