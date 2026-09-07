import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import "./SavedJobs.css";

function SavedJobs() {
  const [user, setUser] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
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

      fetch("https://jobhunt-5q5m.onrender.com/api/jobs/saved", {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
        .then(async (response) => {
          const data = await response.json();

          console.log("Saved Jobs:", data);

          if (!response.ok) {
            throw new Error(
              data.message || "Failed to fetch saved jobs"
            );
          }

          return data;
        })
        .then((data) => {
          setSavedJobs(data.jobs || []);
        })
        .catch((error) => {
          console.error("Fetch saved jobs error:", error);
          alert(error.message || "Failed to load saved jobs");
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

  const removeSavedJob = async (jobId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `https://jobhunt-5q5m.onrender.com/api/jobs/${jobId}/save`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      console.log("Remove saved job:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to remove saved job"
        );
      }

      setSavedJobs((previousJobs) =>
        previousJobs.filter((job) => job.id !== jobId)
      );

      alert("Job removed from saved jobs");

    } catch (error) {
      console.error("Remove saved job error:", error);
      alert(error.message || "Failed to remove saved job");
    }
  };

  if (loading) {
    return (
      <div className="saved-jobs-loading">
        Loading saved jobs...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="saved-jobs-loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="saved-jobs-page">

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
      <main className="saved-jobs-container">

        {/* Heading */}
        <section className="saved-jobs-heading">

          <div>
            <h1>Saved Jobs</h1>

            <p>
              Keep track of jobs you're interested in and apply
              when you're ready.
            </p>
          </div>

          <Link
            to="/find-jobs"
            className="find-jobs-button"
          >
            Find More Jobs
          </Link>

        </section>


        {/* Saved Jobs Count */}
        <div className="saved-jobs-summary">

          <div className="saved-summary-icon">
            ♡
          </div>

          <div>
            <h2>
              {savedJobs.length} Saved Jobs
            </h2>

            <p>
              Jobs you've saved for later
            </p>
          </div>

        </div>


        {/* Jobs */}
        <section className="saved-jobs-list">

          {savedJobs.length === 0 ? (

            <div className="no-saved-jobs">

              <div className="no-saved-icon">
                ♡
              </div>

              <h2>
                No saved jobs
              </h2>

              <p>
                You haven't saved any jobs yet. Browse available
                jobs and save the ones you're interested in.
              </p>

              <Link
                to="/find-jobs"
                className="find-jobs-button"
              >
                Browse Jobs
              </Link>

            </div>

          ) : (

            savedJobs.map((job) => (

              <div
                className="saved-job-card"
                key={job.id}
              >

                {/* Company Logo */}
                <div className="saved-company-logo">

                  {job.company_name
                    ? job.company_name
                        .charAt(0)
                        .toUpperCase()
                    : "C"}

                </div>


                {/* Job Information */}
                <div className="saved-job-info">

                  <h2>
                    {job.title}
                  </h2>

                  <h3>
                    {job.company_name}
                  </h3>

                  <div className="saved-job-details">

                    <span>
                      📍 {job.location || "Not specified"}
                    </span>

                    <span>
                      💼 {job.job_type || "Not specified"}
                    </span>

                    <span>
                      💰 ₹{job.salary_min || 0}
                      {" - "}
                      ₹{job.salary_max || "Not specified"} LPA
                    </span>

                  </div>

                  <p className="saved-date">

                    Saved on{" "}
                    {job.saved_at
                      ? new Date(
                          job.saved_at
                        ).toLocaleDateString()
                      : "Not available"}

                  </p>

                </div>


                {/* Actions */}
                <div className="saved-job-actions">

                  <button
                    className="remove-saved-button"
                    onClick={() =>
                      removeSavedJob(job.id)
                    }
                    title="Remove saved job"
                  >
                    ♡
                  </button>

                  <button
                    className="view-job-button"
                    onClick={() =>
                      navigate(`/jobs/${job.id}`)
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

export default SavedJobs;