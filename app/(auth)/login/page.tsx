"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) router.push("/");
  };

  return (
    <Card className="max-w-md mx-auto p-6 shadow-xl rounded-2xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            type="email"
          />
          <Input
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            type="password"
          />
          <div className="text-left mt-4 text-sm">
            <a href="/forgot-password" className="text-sm hover:underline">
              Mot de passe oublié ?
            </a>
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
        <div className="text-center mt-4 text-sm">
          Pas encore de compte ?
          <a href="/register" className="text-sm hover:underline ml-1">
            Inscrivez-vous
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
