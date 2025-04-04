import { hashPassword } from "@utils/auth";
import { prisma } from "@utils/db";
import { writeFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

// Define interfaces
interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'USER';
  profilePic: string | null;
}

interface ApiResponse {
  message: string;
  user?: UserResponse;
}

export async function POST(req: Request): Promise<NextResponse<ApiResponse>> {
  try {
    // Parse form data instead of JSON
    const formData = await req.formData();

    // Extract fields from form data
    const firstName = formData.get("firstName") as string | null;
    const lastName = formData.get("lastName") as string | null;
    const email = formData.get("email") as string | null;
    const password = formData.get("password") as string | null;
    const phone = formData.get("phone") as string | null;
    const role = formData.get("role") as "ADMIN" | "USER" | null;
    const profilePicture = formData.get("profilePicture") as File | null;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json({ message: "All required fields must be filled." }, { status: 400 });
    }

    // Validate role
    const allowedRoles = ["ADMIN", "USER"] as const;
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ message: "Invalid role. Allowed roles: ADMIN, USER." }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email already in use" }, { status: 400 });
    }

    // Save profile picture (if provided)
    let profilePicUrl: string | null = null;
    if (profilePicture && profilePicture.name) {
      const fileBuffer = await profilePicture.arrayBuffer();
      const filePath = join(process.cwd(), "public/uploads", profilePicture.name);
      await writeFile(filePath, Buffer.from(fileBuffer));
      profilePicUrl = `/uploads/${profilePicture.name}`; // Publicly accessible path
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashPassword(password),
        phone,
        profilePic: profilePicUrl,
        role,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        profilePic: true,
      },
    }) as UserResponse;

    // If ADMIN, create hotel owner entry
    if (role === "ADMIN") {
      await prisma.hotelOwner.create({
        data: { userId: user.id },
      });
    }

    return NextResponse.json({ message: "User registered successfully", user }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error registering user" }, { status: 500 });
  }
}
