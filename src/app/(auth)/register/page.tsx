import Link from "next/link";
import { Shield } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--arc-bg-primary)] px-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-[var(--arc-radius-md)] bg-[var(--arc-crimson-500)] flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Registration is closed
          </h1>
          <p className="text-[var(--arc-text-secondary)] text-sm mt-2 leading-relaxed">
            ARC HR accounts are provisioned by the Super Admin.
            <br />
            Contact your administrator to be added.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-block text-sm text-[var(--arc-crimson-400)] hover:underline"
        >
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
