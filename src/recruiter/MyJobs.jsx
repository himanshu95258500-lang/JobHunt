import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MyJobs.css";

function MyJobs() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

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

        fetch("http://localhost:5000/api/recruiter/jobs", {
            headers: {
                Authorization: "Bearer " + token,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("My Jobs:", data);

                if (data.jobs) {
                    setJobs(data.jobs);
                }

                setLoading(false);
            })
            .catch((error) => {
                console.error("Failed to fetch jobs:", error);
                setLoading(false);
            });
    }, [navigate]);

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
                `http://localhost:5000/api/recruiter/jobs/${jobId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete job"
                );
            }

            setJobs((previousJobs) =>
                previousJobs.filter((job) => job.id !== jobId)
            );

            alert("Job deleted successfully!");
        } catch (error) {
            console.error("Delete job error:", error);

            alert(
                error.message || "Failed to delete job"
            );
        }
    };

    return (
        <div className="my-jobs-page">

            <header className="my-jobs-header">
                <div>
                    <h1>My Jobs</h1>
                    <p>Manage the jobs you have posted</p>
                </div>

                <Link to="/recruiter/jobs/create" className="post-job-btn">
                    + Post New Job
                </Link>
            </header>

            <nav className="my-jobs-nav">
                <Link to="/recruiter-dashboard">Dashboard</Link>
                <Link to="/recruiter/company">Company</Link>
                <Link to="/recruiter/jobs">My Jobs</Link>
                <Link to="/recruiter/jobs/create">Post a Job</Link>
            </nav>

            {loading ? (
                <div className="empty-message">
                    Loading jobs...
                </div>
            ) : jobs.length === 0 ? (
                <div className="empty-message">
                    <h2>No jobs posted yet</h2>
                    <p>Start by posting your first job.</p>

                    <Link to="/recruiter/jobs/create" className="post-job-btn">
                        Post a Job
                    </Link>
                </div>
            ) : (
                <div className="jobs-list">

                    {jobs.map((job) => (
                        <div className="job-card" key={job.id}>

                            <div className="job-card-top">
                                <div>
                                    <h2>{job.title}</h2>
                                    <p className="company-name">
                                        {job.company_name}
                                    </p>
                                </div>

                                <span className={`job-status ${job.status}`}>
                                    {job.status}
                                </span>
                            </div>

                            <div className="job-info">
                                <span>📍 {job.location || "Not specified"}</span>

                                <span>💼 {job.job_type}</span>

                                <span>
                                    💰 ₹{job.salary_min || "0"} - ₹
                                    {job.salary_max || "Not specified"}
                                </span>

                                <span>
                                    📅{" "}
                                    {job.application_deadline
                                        ? new Date(job.application_deadline).toLocaleDateString()
                                        : "No deadline"}
                                </span>
                            </div>

                            <p className="job-description">
                                {job.description}
                            </p>

                            <div className="job-actions">

                                <button
                                    onClick={() => navigate(`/recruiter/jobs/${job.id}/edit`)}
                                >
                                    Edit
                                </button>

                                {job.status === "active" ? (
                                    <button
                                        onClick={async () => {
                                            const token = localStorage.getItem("token");

                                            const confirmClose = window.confirm(
                                                "Are you sure you want to close this job?"
                                            );

                                            if (!confirmClose) {
                                                return;
                                            }

                                            try {
                                                const response = await fetch(
                                                    `http://localhost:5000/api/recruiter/jobs/${job.id}/close`,
                                                    {
                                                        method: "PUT",
                                                        headers: {
                                                            Authorization: "Bearer " + token,
                                                        },
                                                    }
                                                );

                                                const data = await response.json();

                                                if (!response.ok) {
                                                    alert(data.message || "Failed to close job");
                                                    return;
                                                }

                                                alert("Job closed successfully!");

                                                setJobs((currentJobs) =>
                                                    currentJobs.map((currentJob) =>
                                                        currentJob.id === job.id
                                                            ? { ...currentJob, status: "closed" }
                                                            : currentJob
                                                    )
                                                );
                                            } catch (error) {
                                                console.error("Close job error:", error);
                                                alert("Something went wrong");
                                            }
                                        }}
                                    >
                                        Close
                                    </button>
                                ) : (
                                    <button
                                        onClick={async () => {
                                            const token = localStorage.getItem("token");

                                            const confirmReopen = window.confirm(
                                                "Do you want to reopen this job?"
                                            );

                                            if (!confirmReopen) {
                                                return;
                                            }

                                            try {
                                                const response = await fetch(
                                                    `http://localhost:5000/api/recruiter/jobs/${job.id}/reopen`,
                                                    {
                                                        method: "PUT",
                                                        headers: {
                                                            Authorization: "Bearer " + token,
                                                        },
                                                    }
                                                );

                                                const data = await response.json();

                                                if (!response.ok) {
                                                    alert(data.message || "Failed to reopen job");
                                                    return;
                                                }

                                                alert("Job reopened successfully!");

                                                setJobs((currentJobs) =>
                                                    currentJobs.map((currentJob) =>
                                                        currentJob.id === job.id
                                                            ? { ...currentJob, status: "active" }
                                                            : currentJob
                                                    )
                                                );
                                            } catch (error) {
                                                console.error("Reopen job error:", error);
                                                alert("Something went wrong");
                                            }
                                        }}
                                    >
                                        Reopen
                                    </button>
                                )}

                                <button
                                    onClick={() => alert("Applicants section coming next")}
                                >
                                    Applicants
                                </button>

                                <button
                                    className="delete-job-button"
                                    onClick={() => deleteJob(job.id)}
                                >
                                    Delete
                                </button>

                            </div>

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}

export default MyJobs;