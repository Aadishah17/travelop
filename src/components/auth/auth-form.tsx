"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/logo";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2)
});

const forgotSchema = z.object({
  email: z.string().email()
});

type AuthMode = "login" | "signup" | "forgot";
type AuthFormValues = {
  name?: string;
  email: string;
  password?: string;
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";
  const schema = isSignup ? signupSchema : isForgot ? forgotSchema : loginSchema;
  const callbackUrl = searchParams.get("callbackUrl");
  const safeCallbackUrl = callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/dashboard";

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: AuthFormValues) {
    if (isForgot) {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email })
      });
      if (!response.ok) {
        toast.error("Unable to send reset email");
        return;
      }
      toast.success("Password reset instructions sent");
      return;
    }

    if (isSignup) {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        toast.error(body?.error?.message ?? body?.error ?? "Unable to create account");
        return;
      }
      toast.success("Account created");
    }

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false
    });

    if (result?.error) {
      toast.error("Invalid email or password");
      return;
    }

    router.replace(safeCallbackUrl);
    router.refresh();
  }

  const title = isSignup ? "Create your Traveloop account" : isForgot ? "Reset your password" : "Welcome back";
  const description = isSignup
    ? "Start planning collaborative itineraries with live maps, budgets, and journals."
    : isForgot
      ? "Enter your email and Traveloop will send reset instructions."
      : "Sign in to continue your trips.";

  return (
    <Card className="w-full max-w-md glass-card">
      <CardHeader className="gap-4">
        <Logo />
        <div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="mt-2">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" method="post" onSubmit={form.handleSubmit(onSubmit)}>
          {searchParams.get("error") ? (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Authentication failed. Please check your credentials and try again.
            </div>
          ) : null}
          {isSignup ? (
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Avery Stone" {...form.register("name")} />
              {form.formState.errors.name ? <p className="text-xs text-destructive">{String(form.formState.errors.name.message)}</p> : null}
            </div>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
            {form.formState.errors.email ? <p className="text-xs text-destructive">{String(form.formState.errors.email.message)}</p> : null}
          </div>
          {!isForgot ? (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignup ? (
                  <Link className="text-xs font-semibold text-primary" href="/forgot-password">
                    Forgot?
                  </Link>
                ) : null}
              </div>
              <Input id="password" type="password" placeholder="Password" {...form.register("password")} />
              {form.formState.errors.password ? (
                <p className="text-xs text-destructive">{String(form.formState.errors.password.message)}</p>
              ) : null}
            </div>
          ) : null}
          <Button disabled={form.formState.isSubmitting} variant="gradient" type="submit">
            {form.formState.isSubmitting ? "Working..." : isSignup ? "Create Account" : isForgot ? "Send reset email" : "Login"}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link className="font-semibold text-primary" href="/login">
                Login
              </Link>
            </>
          ) : isForgot ? (
            <Link className="font-semibold text-primary" href="/login">
              Back to login
            </Link>
          ) : (
            <>
              New to Traveloop?{" "}
              <Link className="font-semibold text-primary" href="/signup">
                Create Account
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
