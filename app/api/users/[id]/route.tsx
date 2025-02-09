import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateUserSchema } from "@/schemas/usersSchemas";
import { put } from "@vercel/blob";

export async function GET(request, { params }) {
  const session = await getSession();
  const id = Number((await params).id); // Attendre params avant d'accéder à id

  if (!session || (session.role !== "ADMIN" && session.id !== id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      media: { select: { url: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(request, { params }) {
  const session = await getSession();
  const id = Number((await params).id); // Attendre params avant d'accéder à id

  if (!session || (session.role !== "ADMIN" && session.id !== id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await request.formData();
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const imageFile = formData.get("image") as File | null;

  // Validation des données
  const validatedData = updateUserSchema.safeParse({
    firstName,
    lastName,
    email,
  });
  if (!validatedData.success) {
    return NextResponse.json({ error: validatedData.error }, { status: 400 });
  }

  let imageUrl = null;

  // Vérifier si l'utilisateur a déjà une image
  const existingMedia = await prisma.media.findUnique({
    where: { userId: id },
  });

  if (imageFile) {
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const fileName = `${id}-${Date.now()}.jpg`;

      // Enregistrer la nouvelle image
      const { url } = await put(`uploads/${fileName}`, buffer, {
        access: "public",
      });
      imageUrl = url;
      console.log("Image uploaded successfully:", imageUrl);
    } catch (error) {
      console.error("Failed to upload image:", error);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }
  }

  // Mise à jour du profil
  const updatedUser = await prisma.user.update({
    where: { id },
    data: { firstName, lastName, email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      media: { select: { url: true } },
    },
  });

  // Mise à jour ou création de l'image
  if (imageUrl) {
    if (existingMedia) {
      await prisma.media.update({
        where: { userId: id },
        data: { url: imageUrl },
      });
    } else {
      await prisma.media.create({
        data: { url: imageUrl, type: "PROFILE", userId: id },
      });
    }

    // Recharger les données de l'utilisateur avec la nouvelle image
    updatedUser.media = [{ url: imageUrl }];
  }

  return NextResponse.json({ message: "User updated", user: updatedUser });
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  const id = Number((await params).id); // Attendre params avant d'accéder à id

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Supprimer l'image associée s'il y en a une
  const existingMedia = await prisma.media.findUnique({
    where: { userId: id },
  });

  if (existingMedia) {
    await prisma.media.delete({
      where: { userId: id },
    });
  }

  // Supprimer l'utilisateur
  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({ message: "User deleted" });
}
