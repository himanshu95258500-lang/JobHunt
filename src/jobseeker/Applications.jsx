import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import "./Applications.css";

function Applications() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser.role !== "jobseeker") {
        navigate("/");
        return;
      }

      setUser(parsedUser);

      fetch("http://localhost:5000/api/jobs/applications/my", {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
        .then(async (response) => {
          const data = await response.json();

          console.log("My Applications:", data);

          if (!response.ok) {
            throw new Error(
              data.message || "Failed to fetch applications"
            );
          }

          return data;
        })
        .then((data) => {
          setApplications(data.applications || []);
        })
        .catch((error) => {
          console.error("Fetch applications error:", error);
          alert(error.message || "Failed to load applications");
        })
        .finally(() => {
          setLoading(false);
        });

    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const filteredApplications =
    filter === "All"
      ? applications
      : applications.filter(
          (application) => application.status === filter
        );

  const getStatusClass = (status) => {
    switch (status) {
      case "Applied":
        return "status-applied";

      case "Shortlisted":
        return "status-shortlisted";

      case "Interview":
        return "status-interview";

      case "Rejected":
        return "status-rejected";

      case "Hired":
        return "status-hired";

      default:
        return "";
    }
  };

  const getCompanyInitial = (companyName) => {
    if (!companyName) {
      return "C";
    }

    return companyName.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="applications-loading">
        Loading applications...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="applications-loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="applications-page">

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

          <Link to="/jobseeker/profile">
            Profile
          </Link>

          <Link to="/jobseeker/applications">
            Applications
          </Link>

          <Link to="/jobseeker/saved-jobs">
            Saved Jobs
          </Link>
        </nav>

        <div className="dashboard-user">
          <span>Hi, {user.name}</span>
          <LogoutButton />
        </div>

      </header>


      {/* Main */}
      <main className="applications-container">

        {/* Heading */}
        <section className="applications-heading">

          <div>
            <h1>My Applications</h1>

            <p>
              Track the jobs you have applied for and monitor your
              application status.
            </p>
          </div>

          <Link
            to="/find-jobs"
            className="find-jobs-button"
          >
            Find More Jobs
          </Link>

        </section>


        {/* Stats */}
        <section className="application-stats">

          <div className="application-stat-card">

            <div className="application-stat-icon">
              📄
            </div>

            <div>
              <h2>{applications.length}</h2>
              <p>Total Applications</p>
            </div>

          </div>


          <div className="application-stat-card">

            <div className="application-stat-icon">
              📋
            </div>

            <div>
              <h2>
                {
                  applications.filter(
                    (application) =>
                      application.status === "Applied"
                  ).length
                }
              </h2>

              <p>Applied</p>
            </div>

          </div>


          <div className="application-stat-card">

            <div className="application-stat-icon">
              ⭐
            </div>

            <div>
              <h2>
                {
                  applications.filter(
                    (application) =>
                      application.status === "Shortlisted" ||
                      application.status === "Interview"
                  ).length
                }
              </h2>

              <p>In Progress</p>
            </div>

          </div>


          <div className="application-stat-card">

            <div className="application-stat-icon">
              ✓
            </div>

            <div>
              <h2>
                {
                  applications.filter(
                    (application) =>
                      application.status === "Interview"
                  ).length
                }
              </h2>

              <p>Interviews</p>
            </div>

          </div>

        </section>


        {/* Filters */}
        <section className="application-filters">

          <button
            className={
              filter === "All"
                ? "active-filter"
                : ""
            }
            onClick={() => setFilter("All")}
          >
            All
          </button>

          <button
            className={
              filter === "Applied"
                ? "active-filter"
                : ""
            }
            onClick={() => setFilter("Applied")}
          >
            Applied
          </button>

          <button
            className={
              filter === "Shortlisted"
                ? "active-filter"
                : ""
            }
            onClick={() => setFilter("Shortlisted")}
          >
            Shortlisted
          </button>

          <button
            className={
              filter === "Interview"
                ? "active-filter"
                : ""
            }
            onClick={() => setFilter("Interview")}
          >
            Interview
          </button>

          <button
            className={
              filter === "Rejected"
                ? "active-filter"
                : ""
            }
            onClick={() => setFilter("Rejected")}
          >
            Rejected
          </button>

        </section>


        {/* Applications */}
        <section className="applications-list">

          {filteredApplications.length === 0 ? (

            <div className="no-applications">

              <div className="no-applications-icon">
                📄
              </div>

              <h2>
                No applications found
              </h2>

              <p>
                You don't have any applications with this status.
              </p>

              <Link
                to="/find-jobs"
                className="find-jobs-button"
              >
                Find Jobs
              </Link>

            </div>

          ) : (

            filteredApplications.map((application) => (

              <div
                className="application-card"
                key={application.id}
              >

                {/* Company Logo */}
                <div className="company-logo">

                  {getCompanyInitial(
                    application.company_name
                  )}

                </div>


                {/* Application Information */}
                <div className="application-info">

                  <h2>
                    {application.title}
                  </h2>

                  <h3>
                    {application.company_name}
                  </h3>


                  <div className="application-details">

                    <span>
                      📍{" "}
                      {application.location ||
                        "Not specified"}
                    </span>

                    <span>
                      💼{" "}
                      {application.job_type ||
                        "Not specified"}
                    </span>

                    <span>
                      💰 ₹
                      {application.salary_min || 0}
                      {" - "}
                      ₹
                      {application.salary_max ||
                        "Not specified"}
                      {" "}LPA
                    </span>

                    <span>
                      📅 Applied{" "}
                      {application.applied_at
                        ? new Date(
                            application.applied_at
                          ).toLocaleDateString()
                        : "Not available"}
                    </span>

                  </div>

                </div>


                {/* Status */}
                <div className="application-status">

                  <span
                    className={`status-badge ${getStatusClass(
                      application.status
                    )}`}
                  >
                    {application.status}
                  </span>


                  <button
                    className="view-application-button"
                    onClick={() =>
                      navigate(
                        `/jobs/${application.job_id}`
                      )
                    }
                  >
                    View Job
                  </button>

                </div>

              </div>

            ))

          )}

        </section>

      </main>

    </div>
  );
}

export default Applications;