import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    total_users: 0,
    total_jobseekers: 0,
    total_recruiters: 0,
    total_jobs: 0,
    active_jobs: 0,
    total_applications: 0,
  });

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

      if (loggedInUser.role !== "admin") {
        navigate("/login");
        return;
      }

      setUser(loggedInUser);
      fetchStats(token);
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const fetchStats = async (token) => {
    try {
      const response = await fetch(
        "https://jobhunt-5q5m.onrender.com/api/admin/stats",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      console.log("Admin Stats:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch admin statistics"
        );
      }

      setStats(data.stats);
    } catch (error) {
      console.error("Admin dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard-page">

      {/* Header */}
      <header className="admin-header">

        <Link to="/" className="admin-logo">
          <span>●</span> JobHunt
        </Link>

        <nav className="admin-nav">
          <Link to="/admin-dashboard">Dashboard</Link>
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/recruiters">Recruiters</Link>
          <Link to="/admin/jobs">Jobs</Link>
        </nav>

        <div className="admin-user">
          <span>Hi, {user.name}</span>
          <LogoutButton />
        </div>

      </header>

      {/* Main */}
      <main className="admin-container">

        {/* Welcome */}
        <section className="admin-welcome">

          <div>
            <h1>Admin Dashboard 👑</h1>

            <p>
              Manage JobHunt users, recruiters, jobs and applications.
            </p>
          </div>

        </section>

        {/* Stats */}
        <section className="admin-stats">

          <div className="admin-stat-card">
            <div className="admin-stat-icon">👥</div>

            <div>
              <h2>{stats.total_users}</h2>
              <p>Total Users</p>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">🔎</div>

            <div>
              <h2>{stats.total_jobseekers}</h2>
              <p>Job Seekers</p>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">🏢</div>

            <div>
              <h2>{stats.total_recruiters}</h2>
              <p>Recruiters</p>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">💼</div>

            <div>
              <h2>{stats.total_jobs}</h2>
              <p>Total Jobs</p>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">🟢</div>

            <div>
              <h2>{stats.active_jobs}</h2>
              <p>Active Jobs</p>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">📄</div>

            <div>
              <h2>{stats.total_applications}</h2>
              <p>Applications</p>
            </div>
          </div>

        </section>

        {/* Management Cards */}
        <section className="admin-management">

          <div className="admin-card">

            <div className="admin-card-icon">👥</div>

            <h2>Manage Users</h2>

            <p>
              View and manage registered job seekers and users.
            </p>

            <Link
              to="/admin/users"
              className="admin-card-button"
            >
              Manage Users
            </Link>

          </div>

          <div className="admin-card">

            <div className="admin-card-icon">🏢</div>

            <h2>Manage Recruiters</h2>

            <p>
              Review recruiters and their company information.
            </p>

            <Link
              to="/admin/recruiters"
              className="admin-card-button"
            >
              Manage Recruiters
            </Link>

          </div>

          <div className="admin-card">

            <div className="admin-card-icon">💼</div>

            <h2>Manage Jobs</h2>

            <p>
              Review and moderate jobs posted on JobHunt.
            </p>

            <Link
              to="/admin/jobs"
              className="admin-card-button"
            >
              Manage Jobs
            </Link>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;