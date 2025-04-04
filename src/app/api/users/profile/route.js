import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { hashPassword } from "@utils/auth";

export async function PUT(req) {
  try {
    // Extract user object from headers
    const userHeader = req.headers.get("x-user");

    // Check if the userHeader is missing or invalid
    if (!userHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized or Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    let validatedUser;
    try {
      validatedUser = JSON.parse(userHeader); // Try to parse the header
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Invalid user data" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const userId = validatedUser.id; // Get userId

    // Ensure userId is valid
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized or Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract profile information from request body
    const { firstName, lastName, email, password, phone, profilePic, role } = await req.json();

    // Ensure at least one field is specified to edit the profile
    if (!firstName && !lastName && !email && !password && !phone && !profilePic && !role) {
      return NextResponse.json(
        { error: "At least one field is required" },
        { status: 400 }
      );
    }

    // Check if the email is already in use by another user
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { message: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Allowed roles
    const allowedRoles = ["ADMIN", "USER"];
    if (role && !allowedRoles.includes(role)) {
      return NextResponse.json(
        { message: "Invalid role. Allowed roles: ADMIN, USER." },
        { status: 400 }
      );
    }

    // Build the update data object dynamically
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (password) updateData.password = hashPassword(password); // Hash the password if provided
    if (phone) updateData.phone = phone;
    if (profilePic) updateData.profilePic = profilePic;
    if (role) updateData.role = role;

    // Update user profile in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Return success message
    return NextResponse.json(
      { message: "Profile updated successfully", updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Something went wrong, could not update profile" },
      { status: 400 }
    );
  }
}