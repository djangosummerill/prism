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

export default function SuccessPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Success!</CardTitle>
          <CardDescription>Thanks for signing up!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            You&apos;ve successfully signed up. Please check your email to
            confirm your account before signing in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
