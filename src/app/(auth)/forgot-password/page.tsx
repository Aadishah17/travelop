import { AuthForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Reset Password"
};

export default function ForgotPasswordPage() {
  return <AuthForm mode="forgot" />;
}
