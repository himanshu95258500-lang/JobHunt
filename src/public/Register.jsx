import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("jobseeker");
  const [terms, setTerms] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!terms) {
      toast.error("Please accept the Terms & Conditions");
      return;
    }

    const userData = {
      name,
      email,
      password,
      role,
    };

    try {
  const response = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    toast.error(data.message || "Registration failed");
    return;
  }

  toast.success(data.message);

  console.log("Registered User:", data);

} catch (error) {
  console.error("Registration error:", error);
  toast.error("Cannot connect to server");
}
  };

  return (
    <div className="register-page">

      {/* HEADER */}

      <header className="register-header">

        <Link to="/" className="register-logo">
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

        <div className="register-header-right">

          <span>Already have an account?</span>

          <Link
            to="/login"
            className="register-login"
          >
            Login
          </Link>

        </div>

      </header>


      {/* REGISTER */}

      <main className="register-container">

        <div className="register-card">

          <div className="register-title">

            <h1>Create an Account</h1>

            <p>
              Join JobHunt and find your next opportunity
            </p>

          </div>


          <form onSubmit={handleRegister}>

            {/* FULL NAME */}

            <div className="form-group">

              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

            </div>


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
                onChange={(e) => setEmail(e.target.value)}
              />

            </div>


            {/* ROLE */}

            <div className="form-group">

              <label htmlFor="role">
                I am a
              </label>

              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >

                <option value="jobseeker">
                  Job Seeker - Looking for a job
                </option>

                <option value="recruiter">
                  Recruiter - Hiring candidates
                </option>

              </select>

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <small>
                Password must be at least 6 characters
              </small>

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="form-group">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
              />

            </div>


            {/* TERMS */}

            <div className="terms-check">

              <label>

                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                />

                <span>
                  I agree to the{" "}
                  <Link to="#">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="#">
                    Privacy Policy
                  </Link>
                </span>

              </label>

            </div>


            {/* BUTTON */}

            <button
              type="submit"
              className="register-button"
            >
              Create Account
            </button>

          </form>


          {/* LOGIN */}

          <p className="login-text">

            Already have an account?

            <Link to="/login">
              Login
            </Link>

          </p>

        </div>

      </main>


      {/* FOOTER */}

      <footer className="register-footer">

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

export default Register;