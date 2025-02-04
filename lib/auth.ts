"use server";

import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const secretKey = process.env.JWT_SECRET!;
const key = new TextEncoder().encode(secretKey);

// Crée le JWT
export async function createJWT(payload: object) {
    return new SignJWT(payload as JWTPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(key);
}

// Vérifie le JWT
export async function verifyJWT(token: string) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch {
        return null;
    }
}

// Gère la session (cookie HTTP-only)
export async function createSession(user: { id: number; email: string; role: string }) {
    const cookie = await cookies();
    const token = await createJWT(user);
    cookie.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
    });
}

export async function getSession() {
    const cookie = await cookies();
    const token = cookie.get("token")?.value;
    if (!token) return null;
    return await verifyJWT(token);
}

export async function logout() {
    const cookie = await cookies();
    cookie.set("token", "", { expires: new Date(0) });
}

export async function requireAuth() {
    const session = await getSession();
    if (!session) {
        return NextResponse.redirect("/login");
    }
}

export async function requireAdmin() {
    const session = await getSession();
    if (!session || session.role !== "admin") {
        return NextResponse.redirect("/login");
    }
}

export async function requireRole(role: string) {
    const session = await getSession();
    if (!session || session.role !== role) {
        return NextResponse.redirect("/login");
    }
}

