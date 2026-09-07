import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import "./ManageRecruiters.css";

function ManageRecruiters() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [recruiters, setRecruiters] = useState([]);
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
      fetchRecruiters(token);
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const fetchRecruiters = async (token) => {
    try {
      const response = await fetch(
        "https://jobhunt-5q5m.onrender.com/api/admin/recruiters",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      console.log("Recruiters:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch recruiters"
        );
      }

      setRecruiters(data.recruiters || []);
    } catch (error) {
      console.error("Fetch recruiters error:", error);
      alert(error.message || "Failed to load recruiters");
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="manage-recruiters-loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="manage-recruiters-page">

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
      <main className="manage-recruiters-container">

        <div className="manage-recruiters-heading">

          <div>
            <h1>Manage Recruiters</h1>

            <p>
              View recruiters and their company information.
            </p>
          </div>

          <Link
            to="/admin-dashboard"
            className="back-dashboard-button"
          >
            ← Dashboard
          </Link>

        </div>

        {/* Recruiter count */}
        <div className="recruiters-summary">

          <strong>{recruiters.length}</strong>

          <span>Total Recruiters</span>

        </div>

        {/* Recruiters */}
        <section className="recruiters-table-card">

          {recruiters.length === 0 ? (

            <div className="recruiters-empty">

              <h2>No recruiters found</h2>

              <p>
                There are currently no registered recruiters.
              </p>

            </div>

          ) : (

            <div className="recruiters-table-wrapper">

              <table className="recruiters-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Recruiter</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Website</th>
                    <th>Registered</th>
                  </tr>
                </thead>

                <tbody>

                  {recruiters.map((recruiter) => (

                    <tr key={recruiter.id}>

                      <td>{recruiter.id}</td>

                      <td>
                        <strong>
                          {recruiter.name}
                        </strong>
                      </td>

                      <td>
                        {recruiter.email}
                      </td>

                      <td>
                        {recruiter.company_name || (
                          <span className="no-company">
                            No company
                          </span>
                        )}
                      </td>

                      <td>
                        {recruiter.location || "—"}
                      </td>

                      <td>
                        {recruiter.website ? (
                          <a
                            href={recruiter.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit Website
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td>
                        {new Date(
                          recruiter.created_at
                        ).toLocaleDateString()}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default ManageRecruiters;