import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import "./CreateJob.css";

function CreateJob() {
  const [user, setUser] = useState(null);

  const [job, setJob] = useState({
    title: "",
    description: "",
    location: "",
    job_type: "Full Time",
    salary_min: "",
    salary_max: "",
    experience_required: "",
    skills: "",
    application_deadline: "",
  });

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
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setJob((previousJob) => ({
      ...previousJob,
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

    if (!job.title.trim()) {
      alert("Job title is required");
      return;
    }

    if (!job.description.trim()) {
      alert("Job description is required");
      return;
    }

    try {
      const response = await fetch(
        "https://jobhunt-5q5m.onrender.com/api/recruiter/jobs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(job),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create job");
        return;
      }

      alert("Job posted successfully!");

      console.log("Create Job Response:", data);

      navigate("/recruiter/jobs");

    } catch (error) {
      console.error("Create job error:", error);
      alert("Cannot connect to server");
    }
  };

  if (!user) {
    return <div className="create-job-loading">Loading...</div>;
  }

  return (
    <div className="create-job-page">

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
      <main className="create-job-container">

        <section className="create-job-heading">

          <Link
            to="/recruiter/jobs"
            className="back-link"
          >
            ← Back to My Jobs
          </Link>

          <h1>Post a New Job</h1>

          <p>
            Create a job opening and start finding talented candidates.
          </p>

        </section>

        <form onSubmit={handleSubmit}>

          {/* Basic Information */}
          <section className="create-job-card">

            <div className="create-job-card-header">
              <h2>Job Information</h2>
              <p>Enter the basic details about this position.</p>
            </div>

            <div className="job-form-group">

              <label htmlFor="title">
                Job Title *
              </label>

              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Frontend Developer"
                value={job.title}
                onChange={handleChange}
              />

            </div>

            <div className="job-form-group">

              <label htmlFor="description">
                Job Description *
              </label>

              <textarea
                id="description"
                name="description"
                rows="7"
                placeholder="Describe the role, responsibilities and requirements..."
                value={job.description}
                onChange={handleChange}
              />

            </div>

          </section>

          {/* Job Details */}
          <section className="create-job-card">

            <div className="create-job-card-header">
              <h2>Job Details</h2>
              <p>Tell candidates about the position.</p>
            </div>

            <div className="job-form-grid">

              <div className="job-form-group">

                <label htmlFor="location">
                  Location
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g. Delhi, India"
                  value={job.location}
                  onChange={handleChange}
                />

              </div>

              <div className="job-form-group">

                <label htmlFor="job_type">
                  Job Type
                </label>

                <select
                  id="job_type"
                  name="job_type"
                  value={job.job_type}
                  onChange={handleChange}
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>

              </div>

              <div className="job-form-group">

                <label htmlFor="salary_min">
                  Minimum Salary (LPA)
                </label>

                <input
                  id="salary_min"
                  name="salary_min"
                  type="number"
                  placeholder="e.g. 4"
                  value={job.salary_min}
                  onChange={handleChange}
                />

              </div>

              <div className="job-form-group">

                <label htmlFor="salary_max">
                  Maximum Salary (LPA)
                </label>

                <input
                  id="salary_max"
                  name="salary_max"
                  type="number"
                  placeholder="e.g. 7"
                  value={job.salary_max}
                  onChange={handleChange}
                />

              </div>

              <div className="job-form-group">

                <label htmlFor="experience_required">
                  Experience Required
                </label>

                <input
                  id="experience_required"
                  name="experience_required"
                  type="text"
                  placeholder="e.g. 0-2 years"
                  value={job.experience_required}
                  onChange={handleChange}
                />

              </div>

              <div className="job-form-group">

                <label htmlFor="application_deadline">
                  Application Deadline
                </label>

                <input
                  id="application_deadline"
                  name="application_deadline"
                  type="date"
                  value={job.application_deadline}
                  onChange={handleChange}
                />

              </div>

            </div>

            <div className="job-form-group">

              <label htmlFor="skills">
                Required Skills
              </label>

              <input
                id="skills"
                name="skills"
                type="text"
                placeholder="e.g. React, JavaScript, HTML, CSS"
                value={job.skills}
                onChange={handleChange}
              />

              <small>
                Separate skills with commas.
              </small>

            </div>

          </section>

          {/* Actions */}
          <div className="create-job-actions">

            <Link
              to="/recruiter/jobs"
              className="cancel-job-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="post-job-button"
            >
              Post Job
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default CreateJob;