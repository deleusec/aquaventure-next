"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerSchema } from "@/schemas/authSchemas";
import { z } from "zod";

const FORM_FIELDS = [
  { name: "firstName", label: "Prénom", type: "text" },
  { name: "lastName", label: "Nom", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "password", label: "Mot de passe", type: "password" },
] as const;

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export default function RegisterPage() {
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [apiError, setApiError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setApiError("");

    try {
      registerSchema.parse(form);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setApiError(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof FormData, string>> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as keyof FormData] = error.message;
          }
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
        <CardTitle className="text-2xl text-center">Créer un compte</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {FORM_FIELDS.map(({ name, label, type }) => (
            <div key={name}>
              <Input
                name={name}
                placeholder={label}
                type={type}
                value={form[name as keyof FormData]}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  errors[name] ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors[name] && (
                <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
              )}
            </div>
          ))}

          <Button type="submit" variant="primary" className="w-full py-2">
            S&apos;inscrire
          </Button>

          {apiError && (
            <p className="text-red-600 text-center mt-4">{apiError}</p>
          )}

          <div className="text-center mt-4 text-sm">
            Déjà un compte ?{" "}
            <a href="/login" className="hover:underline">
              Se connecter
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
