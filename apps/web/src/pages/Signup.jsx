import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { SignupInput } from "@hometutoring/types";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select } from "@hometutoring/ui";
import { useAuth } from "../context/auth-context.jsx";

// Email/password signup — role picker is limited to PARENT/TUTOR
// (self-signup roles; STUDENT accounts are created by a guardian, ADMIN
// only via seed/ops), mirroring SignupInput's schema exactly.
export function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(SignupInput), defaultValues: { role: "PARENT" } });

  // Submits the form, creates the account, logs the new user in
  // immediately, and lands on the home page.
  async function onSubmit(values) {
    setServerError(null);
    try {
      await signup(values);
      navigate("/");
    } catch (err) {
      setServerError(err.message);
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="role">I am a</Label>
            <Select id="role" {...register("role")}>
              <option value="PARENT">Parent</option>
              <option value="TUTOR">Tutor</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" {...register("fullName")} />
            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating account..." : "Sign up"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
