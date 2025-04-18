"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const error = searchParams.get("error");
    let message = "An unknown error occurred during authentication";

    if (error === "Configuration") {
      message =
        "There is a problem with the server configuration. Please contact support.";
    } else if (error === "AccessDenied") {
      message = "You do not have access to this resource.";
    } else if (error === "Verification") {
      message = "The verification link is invalid or has expired.";
    } else if (
      error === "OAuthSignin" ||
      error === "OAuthCallback" ||
      error === "OAuthCreateAccount"
    ) {
      message =
        "There was a problem with the OAuth authentication. Please try again.";
    } else if (error === "EmailCreateAccount") {
      message = "There was a problem creating your account. Please try again.";
    } else if (error === "Callback") {
      message = "The authentication callback failed. Please try again.";
    } else if (error === "OAuthAccountNotLinked") {
      message =
        "This email is already associated with another account. Please sign in using the original provider.";
    } else if (error === "EmailSignin") {
      message =
        "The email could not be sent or the verification link is invalid. Please try again.";
    } else if (error === "CredentialsSignin") {
      message =
        "The login credentials are invalid. Please check your email and password.";
    } else if (error) {
      message = `Authentication error: ${error}`;
    }

    setErrorMessage(message);
  }, [searchParams]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-red-600 text-center">
            Authentication Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4">{errorMessage}</p>
          <div className="flex justify-center">
            <span className="text-sm text-muted-foreground">
              Please try again or contact support if the problem persists.
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button asChild variant="secondary">
            <Link href="/login">Return to Login</Link>
          </Button>
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
