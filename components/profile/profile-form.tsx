"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";

export default function ProfilePage() {
  const { user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
      setPreviewImage(user.media?.[0]?.url || "/avatar-placeholder.png");
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new FormData();
      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);
      formData.append("email", form.email);
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const res = await fetch(`/api/users/${user?.id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        updateUser(data.user);
        setIsEditing(false);
        setIsImageDialogOpen(false);
        setSelectedImage(null); 
      } else {
        setError(data.error || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("An error occurred while updating your profile.");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="max-w-lg mx-auto p-6 shadow-xl rounded-xl mt-10 bg-popover">
      <h1 className="text-3xl font-bold text-center mb-6">My Profile</h1>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="flex flex-col items-center gap-4">
        {/* Avatar avec bouton d'édition */}
        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogTrigger asChild>
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary cursor-pointer hover:opacity-80 transition">
              <Image
                src={user.media?.[0]?.url || "/avatar-placeholder.png"}
                alt="Profile Picture"
                layout="fill"
                objectFit="cover"
              />
            </div>
          </DialogTrigger>

          {/* Modal d'édition de l'image */}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Profile Picture</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary">
                <Image
                  src={previewImage || "/avatar-placeholder.png"}
                  alt="Preview"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              </div>
              <Input type="file" accept="image/*" onChange={handleImageChange} />
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsImageDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <Input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
            <Input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
            <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />

            <div className="flex justify-between gap-4">
              <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="w-full">
                Cancel
              </Button>
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center w-full">
            <p><strong>First Name:</strong> {user.firstName}</p>
            <p><strong>Last Name:</strong> {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <Button onClick={() => setIsEditing(true)} className="w-full">
              Edit Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
