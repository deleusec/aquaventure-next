import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateUserSchema } from "@/schemas/usersSchemas";
import { writeFile, unlink } from "fs/promises";
import path from "path";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.id !== Number(params.id))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(params.id) },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, media: { select: { url: true } } }
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.id !== Number(params.id))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const imageFile = formData.get("image") as File | null;

    // Validation des données
    const validatedData = updateUserSchema.safeParse({ firstName, lastName, email });
    if (!validatedData.success) {
        return NextResponse.json({ error: validatedData.error }, { status: 400 });
    }

    let imageUrl = null;

    // Vérifier si l'utilisateur a déjà une image
    const existingMedia = await prisma.media.findUnique({
        where: { userId: Number(params.id) },
    });

    if (imageFile) {
        // Supprimer l'ancienne image si elle existe
        if (existingMedia) {
            const oldImagePath = path.join(process.cwd(), "public", existingMedia.url);
            try {
                await unlink(oldImagePath);
            } catch (error) {
                console.error("Failed to delete old image:", error);
            }
        }

        // Enregistrer la nouvelle image
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const filePath = path.join(process.cwd(), "public/uploads", `${params.id}-${Date.now()}.jpg`);
        await writeFile(filePath, buffer);
        imageUrl = `/uploads/${path.basename(filePath)}`;
    }

    // Mise à jour du profil
    const updatedUser = await prisma.user.update({
        where: { id: Number(params.id) },
        data: {
            firstName,
            lastName,
            email,
        },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, media: { select: { url: true } } }
    });

    // Mise à jour ou création de l'image
    if (imageUrl) {
        if (existingMedia) {
            await prisma.media.update({
                where: { userId: Number(params.id) },
                data: { url: imageUrl },
            });
        } else {
            await prisma.media.create({
                data: {
                    url: imageUrl,
                    type: "PROFILE",
                    userId: Number(params.id),
                },
            });
        }

        // Recharger les données de l'utilisateur avec la nouvelle image
        updatedUser.media = [{ url: imageUrl }];
    }

    return NextResponse.json({ message: "User updated", user: updatedUser });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Supprimer l'image associée s'il y en a une
    const existingMedia = await prisma.media.findUnique({
        where: { userId: Number(params.id) },
    });

    if (existingMedia) {
        const imagePath = path.join(process.cwd(), "public", existingMedia.url);
        try {
            await unlink(imagePath);
        } catch (error) {
            console.error("Failed to delete user image:", error);
        }

        await prisma.media.delete({
            where: { userId: Number(params.id) },
        });
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
        where: { id: Number(params.id) },
    });

    return NextResponse.json({ message: "User deleted" });
}
