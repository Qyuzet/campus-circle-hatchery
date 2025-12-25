import { signIn } from "@/lib/auth";
import { Button } from "./ui/button";

interface GoogleSignInButtonProps {
  text?: string;
  variant?: "default" | "outline" | "ghost" | "glow" | "secondary";
  className?: string;
}

export default function GoogleSignInButton({
  text = "Join Now",
  variant = "default",
  className,
}: GoogleSignInButtonProps) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/dashboard" });
      }}
    >
      <Button type="submit" variant={variant} className={className}>
        {text}
      </Button>
    </form>
  );
}

