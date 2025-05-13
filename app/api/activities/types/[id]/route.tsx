import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";
import sharp from "sharp";

export async function DELETE(request, { params }) {
  try {
    const id = parseInt((await params).id);

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

export async function PUT(request, { params }) {
  try {
    const typeId = parseInt((await params).id);
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const imageFile = formData.get("image") as File | null;

    let imageUrl = null;

    if (imageFile) {
      try {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const webpBuffer = await sharp(buffer)
          .resize({ width: 512 })
          .webp({ quality: 80 })
          .toBuffer();
        const fileName = `${typeId}-${Date.now()}.webp`;

        // Enregistrer la nouvelle image sur Vercel Blob
        const { url } = await put(`uploads/${fileName}`, webpBuffer, { 
          access: 'public',
          contentType: 'image/webp',
         });
        imageUrl = url;
        console.log("Image uploaded successfully:", imageUrl);
      } catch (error) {
        console.error("Failed to upload image:", error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
      }
    }

    const updatedType = await prisma.activityType.update({
      where: { id: typeId },
      data: {
        name,
        media: imageUrl
          ? {
              upsert: {
                where: { activityTypeId: typeId },
                create: { url: imageUrl, type: "ACTIVITY_TYPE" },
                update: { url: imageUrl },
              },
            }
          : undefined,
      },
      include: { media: true },
    });

    return NextResponse.json(updatedType);
  } catch (error) {
    console.error("Erreur de modification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification" },
      { status: 500 }
    );
  }
}
