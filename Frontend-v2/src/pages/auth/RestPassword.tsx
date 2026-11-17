import { useMemo, useState } from "react";
import { AlertCircle, CircleCheck, Inbox, Loader2 } from "lucide-react";
import { Card, CardContent } from "#components/ui/card";
import { Label } from "#components/ui/label";
import { Input } from "#components/ui/input";
import { Button } from "#components/ui/button";
import { useNavigate, useSearchParams } from "react-router";
import axios from "axios";
import { cn } from "#lib/utils";
import { Alert, AlertDescription } from "#components/ui/alert";

function getRules({ password, confirmPassword }: { password: string; confirmPassword: string }) {
  return [
    { label: "At least 8 characters", met: password.length >= 8 },
    {
      label: "Upper- and lower-case letters",
      met: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    { label: "At least one number", met: /\d/.test(password) },
    {
      label: "Passwords match",
      met: password.length > 0 && password === confirmPassword,
    },
  ];
}

export default function ResetPassword({}) {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = searchParams.get("token");

  const rules = useMemo(
    () => getRules({ password, confirmPassword }),
    [password, confirmPassword],
  );
  const isValid = rules.every((r) => r.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("This password reset link is invalid or incomplete.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
        { token, newPassword: password },
        { withCredentials: true },
      );

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to reset your password. The link may have expired.",
      );
    } finally {
      setLoading(false);
      //   navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4 py-12">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Inbox className="size-4" />
        </div>
        <div className="leading-tight">
          <p className="text-xs font-semibold text-slate-900">Helpdesk</p>
        </div>
      </div>

      <Card className="w-full max-w-sm rounded-2xl shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-xs font-medium">
                New password
              </Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 border-indigo-600 pr-9 text-xs ring-2 ring-indigo-600/20 focus-visible:border-indigo-600 focus-visible:ring-indigo-600/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-xs font-medium">
                Confirm new password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-9 border-indigo-600 pr-9 text-xs ring-2 ring-indigo-600/20 focus-visible:border-indigo-600 focus-visible:ring-indigo-600/20"
              />
            </div>

            <ul className="space-y-1.5" aria-live="polite">
              {rules.map((rule) => (
                <li
                  key={rule.label}
                  className={cn(
                    "flex items-center gap-2 text-xs",
                    rule.met ? "text-emerald-700" : "text-slate-400",
                  )}
                >
                  <CircleCheck className="size-3.5" aria-hidden="true" />
                  <span>{rule.label}</span>
                  <span className="sr-only">
                    {rule.met ? "(met)" : "(not met)"}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              type="submit"
              disabled={!isValid}
              className="h-9 w-full bg-indigo-600 text-xs font-semibold hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Set New Password"
              )}
            </Button>
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
