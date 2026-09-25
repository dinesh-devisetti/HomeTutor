import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ResetPasswordInput } from "@hometutoring/types";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@hometutoring/ui";
import { api } from "../lib/api.js";

// Reset-password form — reached via the link the forgot-password flow
// "emails" (a server console log in Phase 1's dev stub). Reads the token
// from the query string; the actual token validity check happens
// server-side, this page just relays whatever error comes back.
export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(ResetPasswordInput), defaultValues: { token } });

  // Submits the new password; on success, sends the user to log in with
  // it (every existing session was revoked server-side, so no auto-login here).
  async function onSubmit(values) {
    setServerError(null);
    try {
      await api.auth.resetPassword(values);
      navigate("/login");
    } catch (err) {
      setServerError(err.message);
    }
  }

  if (!token) {
    return (
      <Card className="mx-auto max-w-sm">
        <CardContent>
          <p className="text-sm text-red-600">
            Missing reset token. Use the link from the password reset email.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("token")} />
          <div>
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" type="password" {...register("newPassword")} />
            {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>}
          </div>
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Resetting..." : "Reset password"}
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
