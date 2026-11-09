
import React, { useState } from "react";
import {  useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Alert } from "../../components/ui/Alert";
import axios from "axios";
import { getApiMessage } from "../../utils/errors";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
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
        `${import.meta.env.VITE_API_URL ?? ""}/api/auth/reset-password`,
        { token, newPassword: password },
        { withCredentials: true }
      );

      setMessage("Your password has been reset successfully.");

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(
        getApiMessage(err) ||
          "Unable to reset your password. The link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "70px",
      }}
    >
      <h1 style={{ marginTop: "0", marginBottom: "20px" }}>
  Reset Password
</h1>

      <p style={{ textAlign: "center", maxWidth: "320px",marginBottom: "10px" }}>
        Enter your new password below and confirm it to reset your password.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          width: "300px",
          marginTop: "20px",
        }}
      >
        {message && <Alert variant="success" description={message} />}
        {error && <Alert variant="error" description={error} />}

        <Input
          type="password"
          id="password"
          label="New Password"
          placeholder="Enter your new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          required
        />

        <Input
          type="password"
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          required
        />

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>


    </div>
  );
};

export default ResetPasswordPage;
