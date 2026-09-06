import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import "./ManageJobs.css";

function ManageJobs() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
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
      fetchJobs(token);
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const fetchJobs = async (token) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/jobs",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      console.log("Admin Jobs:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch jobs"
        );
      }

      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Fetch jobs error:", error);
      alert(error.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/jobs/${jobId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      console.log("Delete Job:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete job"
        );
      }

      setJobs((previousJobs) =>
        previousJobs.filter(
          (job) => job.id !== jobId
        )
      );

      alert("Job deleted successfully!");
    } catch (error) {
      console.error("Delete job error:", error);
      alert(error.message || "Something went wrong");
    }
  };

  if (!user || loading) {
    return (
      <div className="manage-jobs-loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="manage-jobs-page">

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
      <main className="manage-jobs-container">

        <div className="manage-jobs-heading">

          <div>
            <h1>Manage Jobs</h1>

            <p>
              Review and manage all jobs posted on JobHunt.
            </p>
          </div>

          <Link
            to="/admin-dashboard"
            className="back-dashboard-button"
          >
            ← Dashboard
          </Link>

        </div>

        {/* Summary */}
        <div className="jobs-summary">

          <strong>{jobs.length}</strong>

          <span>Total Jobs</span>

        </div>

        {/* Jobs Table */}
        <section className="jobs-table-card">

          {jobs.length === 0 ? (

            <div className="jobs-empty">

              <h2>No jobs found</h2>

              <p>
                There are currently no jobs posted on JobHunt.
              </p>

            </div>

          ) : (

            <div className="jobs-table-wrapper">

              <table className="jobs-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Job</th>
                    <th>Company</th>
                    <th>Recruiter</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Salary</th>
                    <th>Status</th>
                    <th>Posted</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {jobs.map((job) => (

                    <tr key={job.id}>

                      <td>{job.id}</td>

                      <td>
                        <strong>{job.title}</strong>
                      </td>

                      <td>
                        {job.company_name}
                      </td>

                      <td>
                        {job.recruiter_name}
                      </td>

                      <td>
                        {job.location || "—"}
                      </td>

                      <td>
                        {job.job_type}
                      </td>

                      <td>
                        ₹{Number(job.salary_min || 0).toFixed(2)}
                        {" – "}
                        ₹{Number(job.salary_max || 0).toFixed(2)}
                        {" LPA"}
                      </td>

                      <td>

                        <span
                          className={`job-status ${job.status}`}
                        >
                          {job.status}
                        </span>

                      </td>

                      <td>
                        {new Date(
                          job.created_at
                        ).toLocaleDateString()}
                      </td>

                      <td>

                        <button
                          className="delete-job-button"
                          onClick={() =>
                            deleteJob(job.id)
                          }
                        >
                          Delete
                        </button>

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

export default ManageJobs;