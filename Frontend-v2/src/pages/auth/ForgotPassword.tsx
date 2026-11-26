import { useState } from "react";
import { AlertCircle, Inbox, Loader2, Mail } from "lucide-react";

import { Button } from "#components/ui/button";
import { Card, CardContent } from "#components/ui/card";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import { Link } from "react-router";
import axios from "axios";
import { Alert, AlertDescription } from "#components/ui/alert";
import Brand from "#components/Brand";

function BackToSignIn() {
  return (
    <Button
      type="button"
      variant="link"
      className="h-auto gap-1 p-0 text-xs font-semibold text-indigo-600"
    >
      <Link to="/">Back to sign in</Link>
    </Button>
  );
}

function RequestForm({
  email,
  setEmail,
  loading,
  onSubmit,
}: {
  email: string;
  setEmail: (email: string) => void;
  loading: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit}>
      <h1 className="text-lg font-semibold tracking-tight text-slate-900">
        Forgot your password?
      </h1>
      <p className="mt-1 text-xs text-slate-500">
        Enter your work email and we'll send you a link to reset it.
      </p>

      <div className="mt-5 space-y-1.5">
        <Label htmlFor="email" className="text-xs font-medium">
          Work email
        </Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-9 border-indigo-600 pr-9 text-xs ring-2 ring-indigo-600/20 focus-visible:border-indigo-600 focus-visible:ring-indigo-600/20"
        />
      </div>

      <Button
        type="submit"
        disabled={loading || !email.trim()}
        className="mt-4 h-9 w-full bg-indigo-600 text-xs font-semibold hover:bg-indigo-700"
      >
        {loading ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Sending...
          </>
        ) : (
          "Send reset link"
        )}
      </Button>

      <div className="mt-4 flex justify-center">
        <BackToSignIn />
      </div>
    </form>
  );
}

function CheckEmail({ email }: { email: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
        <Mail className="size-4" />
      </div>

      <h1 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
        Check your email
      </h1>
      <p className="mx-auto mt-1.5 max-w-[17rem] text-xs leading-relaxed text-slate-500">
        If an account exists for{" "}
        <strong className="font-semibold text-slate-900">{email}</strong>, we've
        sent a link to reset your password. It expires in 30 minutes.
      </p>

      <p className="mt-4 rounded-md bg-slate-50 px-3 py-2.5 text-[11px] text-slate-500">
        Nothing after 5 minutes? Check your spam folder, or try again.
      </p>

      <div className="mt-4 flex justify-center">
        <BackToSignIn />
      </div>
    </div>
  );
}

export default function ForgotPassword({}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        { email },
        { withCredentials: true },
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to send the reset link. Please try again.",
      );
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4 py-12">
      <Brand />

      <Card className="w-full max-w-sm rounded-2xl shadow-sm">
        <CardContent className="p-6">
          {sent ? (
            <CheckEmail email={email.trim()} />
          ) : (
            <RequestForm
              email={email}
              setEmail={setEmail}
              loading={loading}
              onSubmit={handleSubmit}
            />
          )}
          {error && (
            <Alert
              variant="destructive"
              className="border-red-200 bg-red-50 text-red-700"
            >
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs text-red-700">
                <strong className="font-semibold">{error}</strong> Check both
                and try again.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
