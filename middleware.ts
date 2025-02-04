import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const { pathname, origin } = request.nextUrl;

    const publicPaths = ["/login", "/register", "/unauthorized"];

    if (publicPaths.includes(pathname)) {
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(`${origin}/login`);
    }
    
    const session = await verifyJWT(token);
    if (!session) {
        return NextResponse.redirect(`${origin}/login`);
    }

    
    if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
        return NextResponse.redirect(`${origin}/unauthorized`);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin", "/"],
};
