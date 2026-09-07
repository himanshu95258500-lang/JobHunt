import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import "./CompanyProfile.css";

function CompanyProfile() {
  const [user, setUser] = useState(null);

  const [company, setCompany] = useState({
    company_name: "",
    description: "",
    website: "",
    location: "",
  });

  const [companyExists, setCompanyExists] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    try {
      const loggedInUser = JSON.parse(storedUser);

      if (loggedInUser.role !== "recruiter") {
        navigate("/jobseeker-dashboard");
        return;
      }

      setUser(loggedInUser);

      fetchCompany(token);
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const fetchCompany = async (token) => {
    try {
      const response = await fetch(
        "https://jobhunt-5q5m.onrender.com/api/recruiter/company",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      console.log("Company API Response:", data);

      if (response.ok && data.company) {
        setCompany({
          company_name: data.company.company_name || "",
          description: data.company.description || "",
          website: data.company.website || "",
          location: data.company.location || "",
        });

        setCompanyExists(true);
      }
    } catch (error) {
      console.error("Fetch company error:", error);
    } finally {
      setLoadingCompany(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCompany((previousCompany) => ({
      ...previousCompany,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!company.company_name.trim()) {
      alert("Company name is required");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "https://jobhunt-5q5m.onrender.com/api/recruiter/company",
        {
          method: companyExists ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(company),
        }
      );

      const data = await response.json();

      console.log("Save Company Response:", data);

      if (!response.ok) {
        alert(data.message || "Failed to save company");
        return;
      }

      setCompanyExists(true);

      alert(
        companyExists
          ? "Company profile updated successfully!"
          : "Company created successfully!"
      );
    } catch (error) {
      console.error("Save company error:", error);
      alert("Cannot connect to server");
    } finally {
      setSaving(false);
    }
  };

  if (!user || loadingCompany) {
    return <div className="company-loading">Loading...</div>;
  }

  return (
    <div className="company-profile-page">

      {/* Header */}
      <header className="dashboard-header">

        <Link to="/" className="dashboard-logo">
          <span>●</span> JobHunt
        </Link>

        <nav className="dashboard-nav">
          <Link to="/recruiter-dashboard">Dashboard</Link>
          <Link to="/find-jobs">Find Jobs</Link>
          <Link to="/recruiter/company">Company</Link>
          <Link to="/recruiter/jobs">My Jobs</Link>
          <Link to="/recruiter/applicants">Applicants</Link>
        </nav>

        <div className="dashboard-user">
          <span>Hi, {user.name}</span>
          <LogoutButton />
        </div>

      </header>

      {/* Main */}
      <main className="company-profile-container">

        <section className="company-heading">

          <h1>Company Profile</h1>

          <p>
            {companyExists
              ? "Update your company information so job seekers can learn more about your organization."
              : "Create your company profile so job seekers can learn more about your organization."}
          </p>

        </section>

        <form onSubmit={handleSubmit}>

          <section className="company-card">

            <div className="company-card-header">

              <h2>Company Information</h2>

              <p>
                Add the basic information about your company.
              </p>

            </div>

            <div className="company-form-group">

              <label htmlFor="company_name">
                Company Name
              </label>

              <input
                id="company_name"
                name="company_name"
                type="text"
                placeholder="e.g. Tech Solutions"
                value={company.company_name}
                onChange={handleChange}
              />

            </div>

            <div className="company-form-group">

              <label htmlFor="description">
                Company Description
              </label>

              <textarea
                id="description"
                name="description"
                rows="6"
                placeholder="Tell job seekers about your company..."
                value={company.description}
                onChange={handleChange}
              />

            </div>

            <div className="company-form-grid">

              <div className="company-form-group">

                <label htmlFor="website">
                  Company Website
                </label>

                <input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://example.com"
                  value={company.website}
                  onChange={handleChange}
                />

              </div>

              <div className="company-form-group">

                <label htmlFor="location">
                  Location
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g. Delhi, India"
                  value={company.location}
                  onChange={handleChange}
                />

              </div>

            </div>

          </section>

          <div className="company-actions">

            <button
              type="submit"
              className="save-company-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : companyExists
                ? "Update Company"
                : "Create Company"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default CompanyProfile;