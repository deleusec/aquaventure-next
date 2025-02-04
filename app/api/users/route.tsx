import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
        select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true }
    });

    return NextResponse.json(users, { status: 200 });
}
