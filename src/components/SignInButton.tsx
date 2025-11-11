"use client";

import { signIn } from "next-auth/react";
import { Button } from "./ui/button";

interface SignInButtonProps {
  text?: string;
  variant?: "default" | "outline" | "ghost" | "glow" | "secondary";
  className?: string;
}

export default function SignInButton({
  text = "Join Now",
  variant = "default",
  className,
}: SignInButtonProps) {
  const handleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <Button variant={variant} onClick={handleSignIn} className={className}>
      {text}
    </Button>
  );
}

