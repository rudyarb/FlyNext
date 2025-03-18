import { hashPassword } from "@utils/auth";
import { prisma } from "@utils/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Get user info from input
    const { firstName, lastName, email, password, phone, profilePic, role } = await req.json();

    // Enforce required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json({ message:
        "All required fields must be filled (everything except for phone number and profile picture)." }, 
        { status: 400 });
    }

    // Allowed roles
    const allowedRoles = ["ADMIN", "USER"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ message:
        "Invalid role. Allowed roles: ADMIN, USER." }, 
        { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message:
        "Email already in use" }, 
        { status: 400 });
    }

    // Create the new user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashPassword(password),
        phone,
        profilePic,
        role,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });


    // If the role is ADMIN, add them as a hotel owner
    if (role === "ADMIN") {
      await prisma.hotelOwner.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Return success response with the user details
    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) { // Catch any errors
      return NextResponse.json({ message: "Error registering user" }, { status: 400 });
  }
}
