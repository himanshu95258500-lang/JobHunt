import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [coverLetter, setCoverLetter] = useState("");
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        fetch(`https://jobhunt-5q5m.onrender.com/api/jobs/${id}`)
            .then((response) => response.json())
            .then((data) => {
                console.log("Job details:", data);

                if (data.job) {
                    setJob(data.job);
                }

                setLoading(false);
            })
            .catch((error) => {
                console.error("Fetch job details error:", error);
                setLoading(false);
            });
    }, [id]);

    const handleApply = async () => {
        console.log("APPLY BUTTON CLICKED");
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        if (!token || !user) {
            toast.error("Please login to apply for this job");
            navigate("/login");
            return;
        }

        if (user.role !== "jobseeker") {
            toast.error("Only job seekers can apply for jobs");
            return;
        }

        try {
            setApplying(true);

            const response = await fetch(
                `https://jobhunt-5q5m.onrender.com/api/jobs/${id}/apply`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        cover_letter: coverLetter,
                    }),
                }
            );

            const data = await response.json();
            console.log("APPLY RESPONSE:", response.status, data);

            if (!response.ok) {
                toast.error(data.message || "Failed to apply");
                return;
            }

            toast.success("Application submitted successfully!");

            setCoverLetter("");
        } catch (error) {
            console.error("Apply error:", error);
            toast.error("Something went wrong");
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return <h2>Loading job details...</h2>;
    }

    if (!job) {
        return (
            <div>
                <h2>Job not found</h2>

                <button onClick={() => navigate("/find-jobs")}>
                    Back to Jobs
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>
            <button onClick={() => navigate("/find-jobs")}>
                ← Back to Jobs
            </button>

            <div style={{ marginTop: "30px" }}>
                <h1>{job.title}</h1>

                <h3>{job.company_name}</h3>

                <p>
                    📍 {job.location || "Location not specified"}
                </p>

                <p>
                    💼 {job.job_type}
                </p>

                <p>
                    💰 ₹{job.salary_min || 0} - ₹
                    {job.salary_max || "Not specified"} LPA
                </p>

                <p>
                    🎓 Experience:{" "}
                    {job.experience_required || "Not specified"}
                </p>

                <hr />

                <h2>Job Description</h2>

                <p>{job.description}</p>

                <h2>Skills Required</h2>

                <p>
                    {job.skills || "No specific skills mentioned"}
                </p>

                <h2>Application Deadline</h2>

                <p>
                    {job.application_deadline
                        ? new Date(job.application_deadline).toLocaleDateString()
                        : "No deadline specified"}
                </p>

                <div style={{ marginTop: "30px" }}>
                    <h2>Apply for this Job</h2>

                    <textarea
                        placeholder="Write a cover letter (optional)"
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows="6"
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginTop: "10px",
                            boxSizing: "border-box",
                        }}
                    />

                    <button
                        onClick={handleApply}
                        disabled={applying}
                        style={{
                            marginTop: "15px",
                            padding: "12px 25px",
                            cursor: applying ? "not-allowed" : "pointer",
                        }}
                    >
                        {applying ? "Applying..." : "Apply Now"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default JobDetails;