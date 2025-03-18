import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

// CSC309 Lecture 4 Code
export function hashPassword(password) {
  const bcrypt = require("bcrypt");
  return bcrypt.hashSync(password, parseInt(process.env.BCRYPT_ROUNDS));
}

// CSC309 Lecture 4 Code
export function comparePassword(password, hash) {
  const bcrypt = require("bcrypt");
  return bcrypt.compareSync(password, hash);
}

// CSC309 Lecture 4 Code (with minor changes)
export function generateToken(object, type = "access") {
  // Define expiration times based on token type
  const expiration = type === "access" ? process.env.JWT_EXPIRY_TIME : process.env.JWT_REFRESH_EXPIRY_TIME;
  const secret = type === "access" ? process.env.JWT_SECRET : process.env.JWT_REFRESH_SECRET;

  // Include token type in the payload
  const payload = { ...object, type };
  
  // Generate token with the given expiration and secret
  return jwt.sign(payload, secret, {
    expiresIn: expiration,
  });
}

export async function verifyToken(request) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const token = authorization.replace("Bearer ", "");

  // OpenAI. (2025). ChatGPT (Version 4). Retrieved from https://openai.com/
  try {
    
    // Get JWT secret
    const secret = process.env.JWT_SECRET;

    // Create payload
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

    // Return payload
    return payload;

  } catch (err) { // Catch errors (invalid token, expired token, etc.)
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

export async function verifyRefresh(refreshToken) {
  
  // Check refresh token is provided
  if (!refreshToken) {
    return NextResponse.json(
      { error: "Unauthorized: Refresh token required" },
      { status: 401 }
    );
  }

  try {
    // Verify the refresh token using the refresh secret
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // If valid, return the decoded token (user's info)
    return decoded;

  } catch (err) { // Catch errors
    return NextResponse.json(
      { error: "Invalid or expired refresh token" },
      { status: 401 }
    );
  }
}
