import { AuthForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Create Account"
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
