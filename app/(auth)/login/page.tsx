"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginSchema } from "@/schemas/authSchemas";
import { z } from "zod";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [apiError, setApiError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setApiError("");

    try {
      // Validation avec Zod
      loginSchema.parse(form);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/");
      } else {
        const data = await res.json();
        setApiError(data.error || "Erreur inconnue");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {};
        err.errors.forEach((error) => {
          fieldErrors[error.path[0]] = error.message;
        });
        setErrors(fieldErrors);
      } else {
        setApiError("Une erreur est survenue.");
      }
    }
  };

  return (
    <Card className="max-w-md min-w-[500px] mx-auto mt-12 p-8 shadow-xl rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              name="email"
              placeholder="Email"
              onChange={handleChange}
              value={form.email}
              type="email"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Input
              name="password"
              placeholder="Password"
              onChange={handleChange}
              value={form.password}
              type="password"
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="text-left mt-4 text-sm">
            <a href="/forgot-password" className="text-sm hover:underline">
              Mot de passe oublié ?
            </a>
          </div>

          <Button type="submit" className="w-full">
            Se connecter
          </Button>

          {apiError && (
            <p className="text-red-600 text-center mt-4">{apiError}</p>
          )}
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
