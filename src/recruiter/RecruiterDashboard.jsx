import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import "./RecruiterDashboard.css";

function RecruiterDashboard() {
  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    interviews: 0,
  });

  const [recentApplications, setRecentApplications] = useState([]);

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

      fetchDashboardData(token);
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      const [jobsResponse, applicantsResponse] = await Promise.all([
        fetch("http://localhost:5000/api/recruiter/jobs", {
          headers: {
            Authorization: "Bearer " + token,
          },
        }),

        fetch("http://localhost:5000/api/recruiter/applicants", {
          headers: {
            Authorization: "Bearer " + token,
          },
        }),
      ]);

      const jobsData = await jobsResponse.json();
      const applicantsData = await applicantsResponse.json();

      const jobs = jobsData.jobs || [];
      const applicants = applicantsData.applicants || [];

      const activeJobs = jobs.filter(
        (job) => job.status === "active"
      ).length;

      const shortlisted = applicants.filter(
        (applicant) => applicant.status === "Shortlisted"
      ).length;

      const interviews = applicants.filter(
        (applicant) => applicant.status === "Interview"
      ).length;

      setStats({
        activeJobs,
        totalApplications: applicants.length,
        shortlisted,
        interviews,
      });

      // Show latest 3 applications
      setRecentApplications(applicants.slice(0, 3));
    } catch (error) {
      console.error("Dashboard data error:", error);
    }
  };

  if (!user) {
    return <div className="recruiter-loading">Loading...</div>;
  }

  return (
    <div className="recruiter-dashboard-page">

      {/* Header */}
      <header className="recruiter-header">

        <Link to="/" className="recruiter-logo">
          <span>●</span> JobHunt
        </Link>

        <nav className="recruiter-nav">
          <Link to="/recruiter-dashboard">Dashboard</Link>
          <Link to="/recruiter/company">Company</Link>
          <Link to="/recruiter/jobs">My Jobs</Link>
          <Link to="/recruiter/applicants">Applicants</Link>
        </nav>

        <div className="recruiter-user">
          <span>Hi, {user.name}</span>
          <LogoutButton />
        </div>

      </header>

      {/* Main */}
      <main className="recruiter-container">

        {/* Welcome */}
        <section className="recruiter-welcome">

          <div>
            <h1>Welcome back, {user.name}! 👋</h1>

            <p>
              Manage your company, jobs and applications from your dashboard.
            </p>
          </div>

          <Link
            to="/recruiter/company"
            className="company-profile-button"
          >
            Company Profile
          </Link>

        </section>

        {/* Stats */}
        <section className="recruiter-stats">

          <div className="recruiter-stat-card">
            <div className="recruiter-stat-icon">💼</div>

            <div>
              <h2>{stats.activeJobs}</h2>
              <p>Active Jobs</p>
            </div>
          </div>

          <div className="recruiter-stat-card">
            <div className="recruiter-stat-icon">📄</div>

            <div>
              <h2>{stats.totalApplications}</h2>
              <p>Total Applications</p>
            </div>
          </div>

          <div className="recruiter-stat-card">
            <div className="recruiter-stat-icon">⭐</div>

            <div>
              <h2>{stats.shortlisted}</h2>
              <p>Shortlisted</p>
            </div>
          </div>

          <div className="recruiter-stat-card">
            <div className="recruiter-stat-icon">🎯</div>

            <div>
              <h2>{stats.interviews}</h2>
              <p>Interviews</p>
            </div>
          </div>

        </section>

        {/* Main Cards */}
        <section className="recruiter-content">

          {/* Post Job */}
          <div className="recruiter-card">

            <div className="recruiter-card-icon">💼</div>

            <h2>Post a New Job</h2>

            <p>
              Find talented candidates by creating a new job opening.
            </p>

            <Link
              to="/recruiter/jobs/create"
              className="recruiter-card-button"
            >
              Post a Job
            </Link>

          </div>

          {/* Manage Jobs */}
          <div className="recruiter-card">

            <div className="recruiter-card-icon">📋</div>

            <h2>Manage Your Jobs</h2>

            <p>
              View, edit and manage the jobs you have posted.
            </p>

            <Link
              to="/recruiter/jobs"
              className="recruiter-card-button secondary"
            >
              View My Jobs
            </Link>

          </div>

          {/* Applicants */}
          <div className="recruiter-card">

            <div className="recruiter-card-icon">👥</div>

            <h2>View Applicants</h2>

            <p>
              Review candidates and manage their application status.
            </p>

            <Link
              to="/recruiter/applicants"
              className="recruiter-card-button secondary"
            >
              View Applicants
            </Link>

          </div>

          {/* Company */}
          <div className="recruiter-card">

            <div className="recruiter-card-icon">🏢</div>

            <h2>Company Profile</h2>

            <p>
              Update your company information and details.
            </p>

            <Link
              to="/recruiter/company"
              className="recruiter-card-button secondary"
            >
              Manage Company
            </Link>

          </div>

        </section>

        {/* Recent Applications */}
        <section className="recent-applications-card">

          <div className="recent-header">

            <div>
              <h2>Recent Applications</h2>

              <p>
                Keep track of your latest candidates.
              </p>
            </div>

            <Link to="/recruiter/applicants">
              View All
            </Link>

          </div>

          {recentApplications.length === 0 ? (

            <div className="recruiter-empty-state">

              <div className="recruiter-empty-icon">📄</div>

              <h3>No applications yet</h3>

              <p>
                Once candidates apply to your jobs, their applications
                will appear here.
              </p>

              <Link
                to="/recruiter/jobs/create"
                className="recruiter-card-button"
              >
                Post Your First Job
              </Link>

            </div>

          ) : (

            <div className="recent-applications-list">

              {recentApplications.map((application) => (

                <div
                  className="recent-application-item"
                  key={application.application_id}
                >

                  <div>
                    <h3>{application.applicant_name}</h3>

                    <p>
                      Applied for: {application.job_title}
                    </p>

                    <small>
                      {application.applicant_email}
                    </small>
                  </div>

                  <span
                    className={`application-status ${application.status.toLowerCase()}`}
                  >
                    {application.status}
                  </span>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default RecruiterDashboard;