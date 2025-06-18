"use client";

import { Suspense, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircleIcon, InfoIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { signinWithGoogle } from "../signin/actions";
import { signup } from "./actions";

function SignUpContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const info = searchParams.get("info");
  const description = searchParams.get("description");

  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const passwordsMatch = password === repeatPassword;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Get started</CardTitle>
          <CardDescription>Sign up with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <div className="grid gap-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle className="font-semibold line-clamp-none">
                    {decodeURIComponent(error)}
                  </AlertTitle>
                  <AlertDescription>Please try again!</AlertDescription>
                </Alert>
              )}
              {info && (
                <Alert>
                  <InfoIcon />
                  <AlertTitle className="font-semibold">
                    {decodeURIComponent(info)}
                  </AlertTitle>
                  {description && (
                    <AlertDescription>{description}</AlertDescription>
                  )}
                </Alert>
              )}
              <div className="flex flex-col gap-4">
                <Button
                  onClick={signinWithGoogle}
                  variant="outline"
                  className="w-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Sign up with Google
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <form action={signup}>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      type="text"
                      placeholder="Theo"
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="theo@t3.gg"
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="repeat-password">Repeat Password</Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      required
                    />
                  </div>
                  {!passwordsMatch && (
                    <p className="text-sm text-red-500">
                      Passwords do not match
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!passwordsMatch}
                    formAction={signup}
                  >
                    Sign up
                  </Button>
                </div>
              </form>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="signin" className="underline underline-offset-4">
                  Sign in
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading sign up...</div>}>
      <SignUpContent />
    </Suspense>
  );
}
