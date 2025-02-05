// app/api/activities/types/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Vérifier s'il y a des activités liées
    const type = await prisma.activityType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            activities: true,
          },
        },
      },
    });

    if (type?._count?.activities && type._count.activities > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer un type utilisé par des activités" },
        { status: 400 }
      );
    }

    await prisma.activityType.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Type supprimé avec succès" });
  } catch (error) {
    console.error("Erreur de suppression:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();

    const type = await prisma.activityType.update({
      where: { id },
      data: { name: data.name },
      include: {
        _count: {
          select: {
            activities: true,
          },
        },
      },
    });

    return NextResponse.json(type);
  } catch (error) {
    console.error("Erreur de modification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification" },
      { status: 500 }
    );
  }
}