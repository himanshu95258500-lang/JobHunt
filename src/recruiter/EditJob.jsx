import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditJob.css";

function EditJob() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
      navigate("/login");
      return;
    }

    if (user.role !== "recruiter") {
      navigate("/jobseeker-dashboard");
      return;
    }

    fetch(`http://localhost:5000/api/recruiter/jobs/${id}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Job Details:", data);

        if (!data.job) {
          alert(data.message || "Job not found");
          navigate("/recruiter/jobs");
          return;
        }

        setFormData({
          title: data.job.title || "",
          description: data.job.description || "",
          location: data.job.location || "",
          job_type: data.job.job_type || "Full Time",
          salary_min: data.job.salary_min || "",
          salary_max: data.job.salary_max || "",
          experience_required: data.job.experience_required || "",
          skills: data.job.skills || "",
          application_deadline: data.job.application_deadline
            ? data.job.application_deadline.split("T")[0]
            : "",
        });

        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch job error:", error);
        alert("Something went wrong");
        setLoading(false);
      });
  }, [id, navigate]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!formData.title || !formData.description) {
      alert("Job title and description are required");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `http://localhost:5000/api/recruiter/jobs/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      console.log("Update Job Response:", data);

      if (!response.ok) {
        alert(data.message || "Failed to update job");
        return;
      }

      alert("Job updated successfully!");

      navigate("/recruiter/jobs");
    } catch (error) {
      console.error("Update job error:", error);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-job-loading">
        Loading job details...
      </div>
    );
  }

  return (
    <div className="edit-job-page">

      <div className="edit-job-header">
        <div>
          <h1>Edit Job</h1>
          <p>Update your job posting details</p>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/recruiter/jobs")}
        >
          ← Back to My Jobs
        </button>
      </div>

      <div className="edit-job-container">

        <form onSubmit={handleSubmit} className="edit-job-form">

          <div className="form-section">
            <h2>Job Information</h2>

            <div className="form-group">
              <label>Job Title *</label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer"
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the job responsibilities..."
                rows="6"
                required
              />
            </div>

            <div className="form-row">

              <div className="form-group">
                <label>Location</label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Delhi"
                />
              </div>

              <div className="form-group">
                <label>Job Type</label>

                <select
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleChange}
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

            </div>
          </div>


          <div className="form-section">
            <h2>Salary & Experience</h2>

            <div className="form-row">

              <div className="form-group">
                <label>Minimum Salary</label>

                <input
                  type="number"
                  name="salary_min"
                  value={formData.salary_min}
                  onChange={handleChange}
                  placeholder="e.g. 10000"
                />
              </div>

              <div className="form-group">
                <label>Maximum Salary</label>

                <input
                  type="number"
                  name="salary_max"
                  value={formData.salary_max}
                  onChange={handleChange}
                  placeholder="e.g. 15000"
                />
              </div>

            </div>

            <div className="form-group">
              <label>Experience Required</label>

              <input
                type="text"
                name="experience_required"
                value={formData.experience_required}
                onChange={handleChange}
                placeholder="e.g. 0-2 years"
              />
            </div>

          </div>


          <div className="form-section">
            <h2>Skills & Deadline</h2>

            <div className="form-group">
              <label>Required Skills</label>

              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. HTML, CSS, JavaScript, React"
              />
            </div>

            <div className="form-group">
              <label>Application Deadline</label>

              <input
                type="date"
                name="application_deadline"
                value={formData.application_deadline}
                onChange={handleChange}
              />
            </div>

          </div>


          <div className="form-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/recruiter/jobs")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditJob;