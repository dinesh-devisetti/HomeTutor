import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { LoginInput } from "@hometutoring/types";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@hometutoring/ui";
import { useAuth } from "../context/auth-context.jsx";

// Email/password login form. Validated client-side with the same Zod
// schema the API uses server-side (packages/types), so error messages
// match before the request even goes out.
export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(LoginInput) });

  // Submits the form, logs in, and lands on the home page — server-side
  // errors (wrong password, etc) surface as a form-level message.
  async function onSubmit(values) {
    setServerError(null);
    try {
      await login(values);
      navigate("/");
    } catch (err) {
      setServerError(err.message);
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle>Log in</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            {isSubmitting ? "Logging in..." : "Log in"}
          </Button>
        </form>
        <p className="mt-2 text-center text-sm text-slate-500">
          <Link to="/forgot-password" className="underline">
            Forgot password?
          </Link>
        </p>
        <p className="mt-4 text-center text-sm text-slate-500">
          No account?{" "}
          <Link to="/signup" className="underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
