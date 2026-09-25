import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { ForgotPasswordInput } from "@hometutoring/types";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@hometutoring/ui";
import { api } from "../lib/api.js";

// Forgot-password request form. Always shows the same success message
// regardless of whether the email is registered — matches the API's
// anti-enumeration response, so this page can't be used to discover which
// emails have accounts.
export function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(ForgotPasswordInput) });

  // Requests a reset link — response is intentionally the same whether or
  // not the email exists, so there's nothing to branch on here either.
  async function onSubmit(values) {
    await api.auth.forgotPassword(values);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            If that email is registered, a password reset link has been sent.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Sending..." : "Send reset link"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          <Link to="/login" className="underline">
            Back to log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
