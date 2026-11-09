
import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Alert } from "../../components/ui/Alert";
import axios from "axios";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        { email },
        { withCredentials: true }
      );

      setMessage(
        "If an account exists with that email, a password reset link will be sent."
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to send the reset link. Please try again."
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
        marginTop: "100px",
      }}
    >
      
      <p style={{ textAlign: "center", maxWidth: "340px", marginBottom: "30px" }}>
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          width: "300px",
        }}
      >
        {message && (
          <Alert variant="success" description={message} />
        )}

        {error && (
          <Alert variant="error" description={error} />
        )}

        <Input
          type="email"
          id="email"
          label="Email"
          placeholder="enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          required
        />

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>


    </div>
  );
};

export default ForgotPasswordPage;
