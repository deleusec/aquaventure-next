"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerSchema } from "@/schemas/authSchemas";
import { z } from 'zod';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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
      registerSchema.parse(form);

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push('/login');
      } else {
        const data = await res.json();
        setApiError(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};
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
        <CardTitle className="text-2xl text-center">Créer un compte</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {["firstName", "lastName", "email", "password"].map((field, index) => (
            <div key={index}>
              <Input
                name={field}
                placeholder={field.replace(/([A-Z])/g, ' $1').trim()}
                onChange={handleChange}
                value={form[field as keyof typeof form]}
                type={field === "password" ? "password" : "text"}
                className={`w-full p-2 border rounded-md ${
                  errors[field] ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
            </div>
          ))}

          <Button type="submit" className="w-full py-2">S&apos;inscrire</Button>

          {apiError && <p className="text-red-600 text-center mt-4">{apiError}</p>}

          <div className="text-center mt-4 text-sm">
            Déjà un compte ?{" "}
            <a href="/login" className="hover:underline">Se connecter</a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
