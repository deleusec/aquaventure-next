import { NextResponse } from "next/server";
import { logout } from "@/lib/auth";

export async function POST() {
    await logout(); // Supprime le cookie JWT
    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
}
