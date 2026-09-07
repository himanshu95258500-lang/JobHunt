import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Applicants.css";

function Applicants() {
  const navigate = useNavigate();

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

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

    fetch("https://jobhunt-5q5m.onrender.com/api/recruiter/applicants", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Applicants:", data);

        if (data.applicants) {
          setApplicants(data.applicants);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch applicants error:", error);
        setLoading(false);
      });
  }, [navigate]);

  const updateApplicationStatus = async (
    applicationId,
    newStatus
  ) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `https://jobhunt-5q5m.onrender.com/api/recruiter/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      console.log("Status Update:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update status"
        );
      }

      // Update the applicant immediately on the page
      setApplicants((previousApplicants) =>
        previousApplicants.map((applicant) =>
          applicant.application_id === applicationId
            ? {
              ...applicant,
              status: newStatus,
            }
            : applicant
        )
      );

      alert("Application status updated successfully");

    } catch (error) {
      console.error("Update status error:", error);
      alert(error.message || "Something went wrong");
    }
  };

  return (
    <div className="applicants-page">

      <header className="applicants-header">
        <div>
          <h1>Applicants</h1>
          <p>View candidates who applied to your jobs</p>
        </div>

        <Link to="/recruiter/jobs" className="back-jobs-btn">
          ← My Jobs
        </Link>
      </header>

      <nav className="applicants-nav">
        <Link to="/recruiter-dashboard">Dashboard</Link>
        <Link to="/recruiter/company">Company</Link>
        <Link to="/recruiter/jobs">My Jobs</Link>
        <Link to="/recruiter/jobs/create">Post a Job</Link>
        <Link to="/recruiter/applicants">Applicants</Link>
      </nav>

      {loading ? (
        <div className="applicants-message">
          Loading applicants...
        </div>
      ) : applicants.length === 0 ? (
        <div className="applicants-message">
          <h2>No applicants yet</h2>
          <p>
            Applications from job seekers will appear here.
          </p>
        </div>
      ) : (
        <div className="applicants-container">

          {applicants.map((applicant) => (
            <div
              className="applicant-card"
              key={applicant.application_id}
            >

              <div className="applicant-top">

                <div className="applicant-info">
                  <div className="applicant-avatar">
                    {applicant.applicant_name
                      ? applicant.applicant_name.charAt(0).toUpperCase()
                      : "U"}
                  </div>

                  <div>
                    <h2>{applicant.applicant_name}</h2>

                    <p>{applicant.applicant_email}</p>

                    {applicant.professional_title && (
                      <span>
                        {applicant.professional_title}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`application-status ${applicant.status.toLowerCase()}`}
                >
                  {applicant.status}
                </div>

              </div>

              <div className="applied-job">
                <strong>Applied for:</strong>
                <span>{applicant.job_title}</span>
              </div>

              <div className="applicant-details">

                {applicant.location && (
                  <span>📍 {applicant.location}</span>
                )}

                {applicant.phone && (
                  <span>📞 {applicant.phone}</span>
                )}

                {applicant.skills && (
                  <span>🛠 {applicant.skills}</span>
                )}

              </div>

              {applicant.cover_letter && (
                <div className="cover-letter">
                  <h3>Cover Letter</h3>
                  <p>{applicant.cover_letter}</p>
                </div>
              )}

              <div className="applicant-actions">

                <button
                  className="view-profile-button"
                  onClick={() => setSelectedApplicant(applicant)}
                >
                  View Profile
                </button>

                {applicant.resume && (
                  <button
                    onClick={() =>
                      alert("Resume viewing will be added next")
                    }
                  >
                    View Resume
                  </button>
                )}

                <select
                  value={applicant.status}
                  onChange={(e) =>
                    updateApplicationStatus(
                      applicant.application_id,
                      e.target.value
                    )
                  }
                >
                  <option value="Applied">Applied</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview">Interview</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Hired">Hired</option>
                </select>

              </div>

            </div>
          ))}

        </div>
      )}
      {selectedApplicant && (
        <div
          className="applicant-modal-overlay"
          onClick={() => setSelectedApplicant(null)}
        >
          <div
            className="applicant-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="applicant-modal-header">
              <div>
                <h2>{selectedApplicant.applicant_name}</h2>
                <p>{selectedApplicant.professional_title || "Job Seeker"}</p>
              </div>

              <button
                className="close-modal-button"
                onClick={() => setSelectedApplicant(null)}
              >
                ×
              </button>
            </div>

            <div className="applicant-profile-grid">

              <div className="profile-detail">
                <span>Email</span>
                <strong>
                  {selectedApplicant.applicant_email || "Not provided"}
                </strong>
              </div>

              <div className="profile-detail">
                <span>Phone</span>
                <strong>
                  {selectedApplicant.phone || "Not provided"}
                </strong>
              </div>

              <div className="profile-detail">
                <span>Location</span>
                <strong>
                  {selectedApplicant.location || "Not provided"}
                </strong>
              </div>

              <div className="profile-detail">
                <span>Skills</span>
                <strong>
                  {selectedApplicant.skills || "Not provided"}
                </strong>
              </div>

              <div className="profile-detail profile-full-width">
                <span>Education</span>
                <strong>
                  {selectedApplicant.education || "Not provided"}
                </strong>
              </div>

              <div className="profile-detail profile-full-width">
                <span>Experience</span>
                <strong>
                  {selectedApplicant.experience || "Not provided"}
                </strong>
              </div>

              <div className="profile-detail profile-full-width">
                <span>Cover Letter</span>
                <strong>
                  {selectedApplicant.cover_letter || "No cover letter provided"}
                </strong>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Applicants;