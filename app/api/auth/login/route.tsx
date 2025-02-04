import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { loginSchema } from "@/schemas/authSchemas";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body); // Validation des inputs

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    await createSession({ id: user.id, email: user.email, role: user.role });

    return NextResponse.json({ message: "Login successful" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid data" },
      { status: 400 }
    );
  }
}
