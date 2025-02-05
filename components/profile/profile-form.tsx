"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [user, setUser] = useState<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (res.ok) {
          setUser(data);
          setForm({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
          });
        } else {
          setError(data.error || "Failed to load user data.");
        }
      } catch (err) {
        console.log(err);
        setError("An error occurred while fetching user data.");
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`/api/profile/${user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setIsEditing(false);
      } else {
        setError(data.error || "Failed to update profile.");
      }
    } catch (err) {
      console.log(err);
      setError("An error occurred while updating your profile.");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="max-w-md mx-auto p-6 shadow-xl rounded-xl mt-10">
      <h1 className="text-3xl font-bold text-center mb-4">My Profile</h1>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            required
          />
          <Input
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
            required
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <div className="flex justify-between gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditing(false)}
              className="w-full"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 text-center">
          <p>
            <strong>First Name:</strong> {user.firstName}
          </p>
          <p>
            <strong>Last Name:</strong> {user.lastName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <Button onClick={() => setIsEditing(true)} className="w-full">
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
}
