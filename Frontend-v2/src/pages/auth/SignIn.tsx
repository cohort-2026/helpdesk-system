import React, { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Inbox,
} from "lucide-react";
import { Label } from "#components/ui/label";
import { Input } from "#components/ui/input";
import { Button } from "#components/ui/button";
import TicketCard from "#components/ui/TicketCard";
import { Alert, AlertDescription } from "#components/ui/alert";
import { useAuth, type User } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router";
import axios from "axios";

const tickets = [
  {
    id: "1048",
    title: "VPN drops every 10 minutes",
    status: "Open",
    statusClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    meta: "Thabo Nkosi is working on this · update by 16:14",
    offset: "",
  },
  {
    id: "1052",
    title: "Adobe Acrobat Pro licence",
    status: "Pending approval",
    statusClass: "bg-violet-50 text-violet-700 border-violet-200",
    meta: "Waiting for approval",
    offset: "ml-6 bg-indigo-50/90",
  },
];

const getHomePath = (role: User["role"]) => {
  switch (role) {
    case "Employee":
      return "/employee";
    case "Agent":
      return "/agent";
    case "Department Lead":
      return "/department-lead";
    case "System Admin":
      return "/system-admin";
    case "Platform Admin":
      return "/platform-admin";
    default:
      return "/";
  }
};

const SignIn = () => {
  const { login, isAuthenticated, loading: authLoading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      navigate(getHomePath(user.role), { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, user]);

  const handleSignIn = async (e: React.FormEvent) => {
    // console.log("Triggered")
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post<{ user: User; expiresAt: number }>(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true },
      );

      const user = response.data.user;
      // console.log(user);
      login(user, response.data.expiresAt);
      navigate(getHomePath(user.role), { replace: true });
      setLoading(false);
    } catch (err: unknown) {
      setError(
        (axios.isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "An error occurred during sign in.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-white md:grid-cols-2">
      {/* Left: form */}
      <div className="flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Inbox className="size-4" />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-slate-900">Helpdesk</p>
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Sign in to Helpdesk
          </h1>
          <p className="mt-1.5 text-xs text-slate-500">Use your work email.</p>

          <form onSubmit={handleSignIn} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-lg font-medium">
                Email
              </Label>
              <Input
                placeholder="you@company.com"
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 border-indigo-600 pr-9 text-xs ring-2 ring-indigo-600/20 focus-visible:border-indigo-600 focus-visible:ring-indigo-600/20"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-lg font-medium">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-indigo-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  placeholder="Enter your password"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 border-indigo-600 pr-9 text-xs ring-2 ring-indigo-600/20 focus-visible:border-indigo-600 focus-visible:ring-indigo-600/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || authLoading}
              className="h-9 w-full bg-indigo-600 text-xs font-semibold hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
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
        </div>
      </div>

      {/* Right: marketing panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-900 md:flex md:items-center md:justify-center">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-white/10" />
        <div className="relative w-full max-w-md space-y-4 px-8 text-white">
          <h2 className="mb-8 text-xl font-semibold leading-snug">
            One place for every request. See who has it and when you'll hear
            back.
          </h2>
          {tickets.map((t) => (
            <TicketCard key={t.id} ticket={t} />
          ))}
        </div>
      </div>
    </div>
  );
};
export default SignIn;
