import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateUserSchema } from "@/schemas/usersSchemas";

// Schéma de validation pour la mise à jour
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session || session.role !== "admin") {
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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session || session.role !== "admin") {
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
            role: "USER",
        }
    });

    return NextResponse.json({ message: "User updated", user: updatedUser });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session || session.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.user.delete({
        where: { id: Number(params.id) },
    });

    return NextResponse.json({ message: "User deleted" });
}
