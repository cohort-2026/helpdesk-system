import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Alert } from "../../components/ui/Alert";
import axios from "axios";
import { getApiMessage } from "../../utils/errors";

const SignInPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL ?? ""}/api/auth/login`,
        { email, password },
        { withCredentials: true },
      );

      const user = response.data.user;
      // console.log(user);
      login(user);

      const role = user.role;
      switch (role) {
        case "Employee":
          navigate("/employee");
          break;
        case "Agent":
          navigate("/agent");
          break;
        case "Department Lead":
          navigate("/department-lead");
          break;
        case "System Admin":
          navigate("/system-admin");
          break;
        case "Platform Admin":
          navigate("/platform-admin");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setError(
        getApiMessage(err) || "An error occurred during sign in.",
      );
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
      <h1>Sign In</h1>
      <form
        onSubmit={handleSignIn}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          width: "300px",
        }}
      >
        {error && (
          <div style={{ marginBottom: "10px" }}>
            <Alert variant="error" description={error} />
          </div>
        )}
        <div>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            required
            placeholder="enter your email"
            label="Email"
          />
        </div>
        <div style={{ position: "relative", width: "100%" }}>
          <Input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              paddingRight: "40px",
              boxSizing: "border-box",
            }}
            required
            placeholder="enter your password"
            label="Password"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "32px",
              cursor: "pointer",
              display: "flex",
            }}
          >
            {showPassword ? (
              // CLOSED EYE - when password is visible, show this to close it
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M3 6 Q12 18 21 6" />
                <path d="M5 9 L3 13" />
                <path d="M8 12 L7 16" />
                <path d="M12 13.5 L12 18" />
                <path d="M16 12 L17 16" />
                <path d="M19 9 L21 13" />
              </svg>
            ) : (
              // OPEN EYE - simple emoji when hidden
              <span style={{ fontSize: "22px" }}>👁️</span>
            )}
          </span>
        </div>
        <Button type="submit" variant="primary">
          Sign In
        </Button>
        {/*
      <Link to="/forgot-password" style={{ fontSize: "14px", textAlign: "center" }}>
  Forgot password?
</Link>
         */}
      </form>

      <p style={{ marginTop: "15px", fontSize: "14px" }}>
        Forgot your password?{" "}
        <Link
          to="/forgot-password"
          style={{ color: "#2563eb", textDecoration: "none" }}
        >
          Reset it here
        </Link>
      </p>

      <div
        style={{
          marginTop: "20px",
        }}
      >
        {/* <p>
          <strong>Dummy Accounts:</strong>
        </p>
        <p>employee@test.com</p>
        <p>agent@test.com</p>
        <p>lead@test.com</p>
        <p>admin@test.com</p>
        <p>platform@test.com</p> */}
      </div>
    </div>
  );
};

export default SignInPage;
