import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import "./JobSeekerDashboard.css";

function JobSeekerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    try {
      const loggedInUser = JSON.parse(storedUser);

      if (loggedInUser.role !== "jobseeker") {
        navigate("/login");
        return;
      }

      setUser(loggedInUser);

      fetchDashboardData(token);
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      const [applicationsResponse, savedResponse] =
        await Promise.all([
          fetch(
            "http://localhost:5000/api/jobs/applications/my",
            {
              headers: {
                Authorization: "Bearer " + token,
              },
            }
          ),

          fetch(
            "http://localhost:5000/api/jobs/saved",
            {
              headers: {
                Authorization: "Bearer " + token,
              },
            }
          ),
        ]);

      const applicationsData =
        await applicationsResponse.json();

      const savedData =
        await savedResponse.json();

      if (!applicationsResponse.ok) {
        throw new Error(
          applicationsData.message ||
            "Failed to fetch applications"
        );
      }

      if (!savedResponse.ok) {
        throw new Error(
          savedData.message ||
            "Failed to fetch saved jobs"
        );
      }

      setApplications(
        applicationsData.applications || []
      );

      setSavedJobs(savedData.jobs || []);
    } catch (error) {
      console.error(
        "Dashboard data error:",
        error
      );

      alert(
        error.message ||
          "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  const interviewCount = applications.filter(
    (application) =>
      application.status === "Interview"
  ).length;

  if (loading || !user) {
    return (
      <div className="dashboard-loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="jobseeker-dashboard">

      {/* Header */}
      <header className="dashboard-header">

        <Link to="/" className="dashboard-logo">
          <span>●</span> JobHunt
        </Link>

        <nav className="dashboard-nav">
          <Link to="/jobseeker-dashboard">
            Dashboard
          </Link>

          <Link to="/find-jobs">
            Find Jobs
          </Link>

          <Link to="/jobseeker/applications">
            Applications
          </Link>

          <Link to="/jobseeker/saved-jobs">
            Saved Jobs
          </Link>

          <Link to="/jobseeker/profile">
            Profile
          </Link>
        </nav>

        <div className="dashboard-user">
          <span>Hi, {user.name}</span>
          <LogoutButton />
        </div>

      </header>

      {/* Main */}
      <main className="dashboard-container">

        {/* Welcome */}
        <section className="dashboard-welcome">

          <div>
            <h1>
              Welcome back, {user.name} 👋
            </h1>

            <p>
              Track your applications and discover
              your next opportunity.
            </p>
          </div>

          <Link
            to="/find-jobs"
            className="find-jobs-button"
          >
            Find Jobs
          </Link>

        </section>

        {/* Stats */}
        <section className="dashboard-stats">

          <div className="dashboard-stat-card">
            <div className="stat-icon">📄</div>

            <div>
              <strong>
                {applications.length}
              </strong>

              <span>
                Applications
              </span>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon">❤️</div>

            <div>
              <strong>
                {savedJobs.length}
              </strong>

              <span>
                Saved Jobs
              </span>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon">📅</div>

            <div>
              <strong>
                {interviewCount}
              </strong>

              <span>
                Interviews
              </span>
            </div>
          </div>

        </section>

        {/* Recent Applications */}
        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <h2>
                Recent Applications
              </h2>

              <p>
                Keep track of your latest job
                applications.
              </p>
            </div>

            <Link to="/jobseeker/applications">
              View All
            </Link>

          </div>

          {applications.length === 0 ? (

            <div className="dashboard-empty">
              <h3>
                No applications yet
              </h3>

              <p>
                Start applying for jobs to see
                your applications here.
              </p>

              <Link to="/find-jobs">
                Browse Jobs
              </Link>
            </div>

          ) : (

            <div className="application-list">

              {applications
                .slice(0, 3)
                .map((application) => (

                  <div
                    className="application-card"
                    key={application.id}
                  >

                    <div className="application-info">

                      <h3>
                        {application.title}
                      </h3>

                      <p>
                        {application.company_name}
                      </p>

                      <span>
                        📍 {application.location || "Not specified"}
                      </span>

                    </div>

                    <div className="application-status">

                      <span
                        className={`status-badge ${application.status.toLowerCase()}`}
                      >
                        {application.status}
                      </span>

                      <small>
                        Applied{" "}
                        {new Date(
                          application.applied_at
                        ).toLocaleDateString()}
                      </small>

                    </div>

                  </div>

                ))}

            </div>

          )}

        </section>

        {/* Quick Links */}
        <section className="dashboard-quick-links">

          <Link
            to="/find-jobs"
            className="quick-link"
          >
            <span>🔎</span>

            <div>
              <h3>Find Jobs</h3>
              <p>
                Search for new opportunities.
              </p>
            </div>
          </Link>

          <Link
            to="/jobseeker/saved-jobs"
            className="quick-link"
          >
            <span>❤️</span>

            <div>
              <h3>Saved Jobs</h3>
              <p>
                View jobs you saved for later.
              </p>
            </div>
          </Link>

          <Link
            to="/jobseeker/profile"
            className="quick-link"
          >
            <span>👤</span>

            <div>
              <h3>My Profile</h3>
              <p>
                Update your professional profile.
              </p>
            </div>
          </Link>

        </section>

      </main>

    </div>
  );
}

export default JobSeekerDashboard;