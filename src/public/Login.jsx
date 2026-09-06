import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      console.log("Logged in User:", data);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success(data.message);

      if (data.user.role === "jobseeker") {
        navigate("/jobseeker-dashboard");
      } else if (data.user.role === "recruiter") {
        navigate("/recruiter-dashboard");
      } else if (data.user.role === "admin") {
        navigate("/admin-dashboard");
      }

    } catch (error) {
      console.error("Login error:", error);
      toast.error("Cannot connect to server");
    }
  };

  return (
    <div className="login-page">

      {/* HEADER */}
      <header className="login-header">

        <Link to="/" className="login-logo">
          <span>●</span> JobHunt
        </Link>

        <nav>
          <Link to="/">Home</Link>

          <Link to="/find-jobs">
            Find Jobs
          </Link>

          <Link to="#">
            Browse Companies
          </Link>
        </nav>

        <div className="login-header-right">

          <span>Don't have an account?</span>

          <Link
            to="/register"
            className="login-signup"
          >
            Sign Up
          </Link>

        </div>

      </header>


      {/* LOGIN SECTION */}
      <main className="login-container">

        <div className="login-card">

          <div className="login-title">

            <h1>Welcome Back!</h1>

            <p>
              Login to continue your JobHunt journey
            </p>

          </div>


          <form onSubmit={handleLogin}>

            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <div className="password-label">

                <label htmlFor="password">
                  Password
                </label>

                <Link to="#">
                  Forgot password?
                </Link>

              </div>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

            </div>


            {/* REMEMBER ME */}

            <div className="remember-me">

              <label>

                <input type="checkbox" />

                <span>
                  Remember me
                </span>

              </label>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-button"
            >
              Login
            </button>

          </form>


          {/* DIVIDER */}

          <div className="login-divider">
            <span>OR</span>
          </div>


          {/* SOCIAL LOGIN */}

          <div className="social-login">

            <button type="button">
              Continue with Google
            </button>

            <button type="button">
              Continue with LinkedIn
            </button>

          </div>


          {/* REGISTER */}

          <p className="register-text">

            Don't have an account?

            <Link to="/register">
              Create Account
            </Link>

          </p>

        </div>

      </main>


      {/* FOOTER */}

      <footer className="login-footer">

        <p>
          © 2026 JobHunt. All rights reserved.
        </p>

        <div>

          <Link to="#">
            Privacy Policy
          </Link>

          <Link to="#">
            Terms & Conditions
          </Link>

          <Link to="#">
            Contact
          </Link>

        </div>

      </footer>

    </div>
  );
}

export default Login;