import { AuthLayout } from "@/components/auth/auth-layout";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your Account"
      description="Join VertexCMS and start creating amazing content."
    >
      <SignupForm />
    </AuthLayout>
  );
}
