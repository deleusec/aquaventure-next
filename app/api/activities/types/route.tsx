import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const types = await prisma.activityType.findMany();
    return NextResponse.json(types);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur de récupération" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const type = await prisma.activityType.create({
      data: { name: data.name },
    });
    return NextResponse.json(type);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de création" }, { status: 500 });
  }
}
