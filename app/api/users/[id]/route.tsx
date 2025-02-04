import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateUserSchema } from "@/schemas/usersSchemas";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(params.id) },
        select: { id: true, email: true, firstName: true, lastName: true, role: true }
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await request.json();
    const validatedData = updateUserSchema.safeParse(data);

    if (!validatedData.success) {
        return NextResponse.json({ error: validatedData.error }, { status: 400 });
    }

    const newUser = await prisma.user.create({
        data: {
            firstName: validatedData.data.firstName,
            lastName: validatedData.data.lastName,
            email: validatedData.data.email,
            role: validatedData.data.role,
            password: "password",
        }
    });

    return NextResponse.json({ message: "User created", user: newUser });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await request.json();
    const validatedData = updateUserSchema.safeParse(data);

    if (!validatedData.success) {
        return NextResponse.json({ error: validatedData.error }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
        where: { id: Number(params.id) },
        data: {
            ...validatedData.data,
            role: session.role === "ADMIN" ? validatedData.data.role : "USER",
        }
    });

    return NextResponse.json({ message: "User updated", user: updatedUser });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.user.delete({
        where: { id: Number(params.id) },
    });

    return NextResponse.json({ message: "User deleted" });
}
