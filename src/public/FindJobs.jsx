import { useEffect, useState } from "react";
import "./FindJobs.css";
import LogoutButton from "../components/LogoutButton";

function FindJobs() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("All");
  const [savedJobs, setSavedJobs] = useState([]);
  const [category, setCategory] = useState("All");
  const [experience, setExperience] = useState([]);
  const [salary, setSalary] = useState([]);
  const [user, setUser] = useState(null);



  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/jobs")
      .then((response) => response.json())
      .then((data) => {
        console.log("Jobs from database:", data);

        if (data.jobs) {
          setJobs(data.jobs);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch jobs error:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to read user:", error);
      }
    }
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      return;
    }

    try {
      const parsedUser = JSON.parse(user);

      if (parsedUser.role !== "jobseeker") {
        return;
      }
    } catch (error) {
      return;
    }

    fetch("http://localhost:5000/api/jobs/saved", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Existing Saved Jobs:", data);

        if (data.jobs) {
          setSavedJobs(
            data.jobs.map((job) => job.id)
          );
        }
      })
      .catch((error) => {
        console.error(
          "Fetch saved jobs error:",
          error
        );
      });
  }, []);

  const toggleSave = async (id) => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      alert("Please login to save jobs");
      return;
    }

    try {
      const isSaved = savedJobs.includes(id);

      const response = await fetch(
        `http://localhost:5000/api/jobs/${id}/save`,
        {
          method: isSaved ? "DELETE" : "POST",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      console.log("Save Job Response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save job"
        );
      }

      if (isSaved) {
        setSavedJobs((previous) =>
          previous.filter((jobId) => jobId !== id)
        );
      } else {
        setSavedJobs((previous) => [...previous, id]);
      }

    } catch (error) {
      console.error("Save job error:", error);
      alert(error.message || "Something went wrong");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const searchText = search.toLowerCase().trim();
    const locationText = location.toLowerCase().trim();

    const searchMatch =
      !searchText ||
      job.title?.toLowerCase().includes(searchText) ||
      job.company_name?.toLowerCase().includes(searchText) ||
      job.skills?.toLowerCase().includes(searchText);

    const locationMatch =
      !locationText ||
      job.location?.toLowerCase().includes(locationText);

    const jobTypeMatch =
      jobType === "All" ||
      job.job_type === jobType;

    const experienceMatch =
      experience.length === 0 ||
      experience.some((item) => {
        const jobExperience =
          job.experience_required?.toLowerCase() || "";

        if (item === "Fresher") {
          return (
            jobExperience.includes("fresher") ||
            jobExperience.includes("0 year") ||
            jobExperience.includes("0-")
          );
        }

        if (item === "1 - 3 Years") {
          return (
            jobExperience.includes("1-3") ||
            jobExperience.includes("1 - 3")
          );
        }

        if (item === "3 - 5 Years") {
          return (
            jobExperience.includes("3-5") ||
            jobExperience.includes("3 - 5")
          );
        }

        if (item === "5+ Years") {
          return (
            jobExperience.includes("5+") ||
            jobExperience.includes("5 year")
          );
        }

        return false;
      });

    const salaryMin = Number(job.salary_min) || 0;
    const salaryMax = Number(job.salary_max) || 0;

    const salaryMatch =
      salary.length === 0 ||
      salary.some((item) => {
        if (item === "3-5") {
          return salaryMax >= 3 && salaryMin <= 5;
        }

        if (item === "5-10") {
          return salaryMax >= 5 && salaryMin <= 10;
        }

        if (item === "10-15") {
          return salaryMax >= 10 && salaryMin <= 15;
        }

        if (item === "15+") {
          return salaryMax >= 15;
        }

        return false;
      });

    return (
      searchMatch &&
      locationMatch &&
      jobTypeMatch &&
      experienceMatch &&
      salaryMatch
    );
  });

  return (
    <div className="find-jobs-page">

      {/* ================= HEADER ================= */}

      <header className="jobs-header">

        <div className="jobs-logo">
          <span>●</span> JobHunt
        </div>

        <nav className="jobs-nav">
          <a href="/">Home</a>
          <a href="/find-jobs" className="active">
            Find Jobs
          </a>
          <a href="#">Browse Companies</a>
        </nav>

        <div className="jobs-auth">
          {user ? (
            <>
              <span className="jobs-user-name">
                Hi, {user.name}
              </span>

              <LogoutButton />
            </>
          ) : (
            <>
              <a href="/login">Login</a>

              <a
                href="/register"
                className="register-btn"
              >
                Sign Up
              </a>
            </>
          )}
        </div>

      </header>


      {/* ================= PAGE HERO ================= */}

      <section className="find-jobs-hero">

        <h1>Find your dream job</h1>

        <p>
          Discover thousands of opportunities and take the next step
          in your career.
        </p>

        <div className="jobs-search">

          <div className="search-input">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Job title, keyword or company"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="search-input location-input">
            <span>⌖</span>

            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <button className="search-button">
            Search Jobs
          </button>

        </div>

      </section>


      {/* ================= MAIN CONTENT ================= */}

      <main className="jobs-content">

        {/* ================= FILTERS ================= */}

        <aside className="job-filters">

          <div className="filter-heading">
            <h3>Filter Jobs</h3>

            <button
              onClick={() => {
                setSearch("");
                setLocation("");
                setJobType("All");
                setCategory("All");
              }}
            >
              Clear
            </button>
          </div>


          {/* Job Type */}

          <div className="filter-section">

            <h4>Job Type</h4>

            <label>
              <input
                type="radio"
                name="jobType"
                checked={jobType === "All"}
                onChange={() => setJobType("All")}
              />
              All Jobs
            </label>

            <label>
              <input
                type="radio"
                name="jobType"
                checked={jobType === "Full Time"}
                onChange={() => setJobType("Full Time")}
              />
              Full Time
            </label>

            <label>
              <input
                type="radio"
                name="jobType"
                checked={jobType === "Remote"}
                onChange={() => setJobType("Remote")}
              />
              Remote
            </label>

            <label>
              <input
                type="radio"
                name="jobType"
                checked={jobType === "Part Time"}
                onChange={() => setJobType("Part Time")}
              />
              Part Time
            </label>

            <label>
              <input
                type="radio"
                name="jobType"
                checked={jobType === "Internship"}
                onChange={() => setJobType("Internship")}
              />
              Internship
            </label>

            <label>
              <input
                type="radio"
                name="jobType"
                checked={jobType === "Contract"}
                onChange={() => setJobType("Contract")}
              />
              Contract
            </label>

          </div>


          {/* Experience */}

          {/* Experience */}

          <div className="filter-section">

            <h4>Experience</h4>

            <label>
              <input
                type="checkbox"
                checked={experience.includes("Fresher")}
                onChange={() => {
                  setExperience((previous) =>
                    previous.includes("Fresher")
                      ? previous.filter((item) => item !== "Fresher")
                      : [...previous, "Fresher"]
                  );
                }}
              />
              Fresher
            </label>

            <label>
              <input
                type="checkbox"
                checked={experience.includes("1 - 3 Years")}
                onChange={() => {
                  setExperience((previous) =>
                    previous.includes("1 - 3 Years")
                      ? previous.filter((item) => item !== "1 - 3 Years")
                      : [...previous, "1 - 3 Years"]
                  );
                }}
              />
              1 - 3 Years
            </label>

            <label>
              <input
                type="checkbox"
                checked={experience.includes("3 - 5 Years")}
                onChange={() => {
                  setExperience((previous) =>
                    previous.includes("3 - 5 Years")
                      ? previous.filter((item) => item !== "3 - 5 Years")
                      : [...previous, "3 - 5 Years"]
                  );
                }}
              />
              3 - 5 Years
            </label>

            <label>
              <input
                type="checkbox"
                checked={experience.includes("5+ Years")}
                onChange={() => {
                  setExperience((previous) =>
                    previous.includes("5+ Years")
                      ? previous.filter((item) => item !== "5+ Years")
                      : [...previous, "5+ Years"]
                  );
                }}
              />
              5+ Years
            </label>

          </div>


          {/* Salary */}

          {/* Salary */}

          <div className="filter-section">

            <h4>Salary</h4>

            <label>
              <input
                type="checkbox"
                checked={salary.includes("3-5")}
                onChange={() => {
                  setSalary((previous) =>
                    previous.includes("3-5")
                      ? previous.filter((item) => item !== "3-5")
                      : [...previous, "3-5"]
                  );
                }}
              />
              ₹3 - 5 LPA
            </label>

            <label>
              <input
                type="checkbox"
                checked={salary.includes("5-10")}
                onChange={() => {
                  setSalary((previous) =>
                    previous.includes("5-10")
                      ? previous.filter((item) => item !== "5-10")
                      : [...previous, "5-10"]
                  );
                }}
              />
              ₹5 - 10 LPA
            </label>

            <label>
              <input
                type="checkbox"
                checked={salary.includes("10-15")}
                onChange={() => {
                  setSalary((previous) =>
                    previous.includes("10-15")
                      ? previous.filter((item) => item !== "10-15")
                      : [...previous, "10-15"]
                  );
                }}
              />
              ₹10 - 15 LPA
            </label>

            <label>
              <input
                type="checkbox"
                checked={salary.includes("15+")}
                onChange={() => {
                  setSalary((previous) =>
                    previous.includes("15+")
                      ? previous.filter((item) => item !== "15+")
                      : [...previous, "15+"]
                  );
                }}
              />
              ₹15+ LPA
            </label>

          </div>

          {/* Category */}

          <div className="filter-section">

            <h4>Category</h4>

            <select
              className="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All Categories</option>

              <option value="Software Development">
                Software Development
              </option>

              <option value="Web Development">
                Web Development
              </option>

              <option value="Frontend Development">
                Frontend Development
              </option>

              <option value="Backend Development">
                Backend Development
              </option>

              <option value="Full Stack Development">
                Full Stack Development
              </option>

              <option value="Mobile App Development">
                Mobile App Development
              </option>

              <option value="Data Science">
                Data Science
              </option>

              <option value="Data Analytics">
                Data Analytics
              </option>

              <option value="AI / Machine Learning">
                AI / Machine Learning
              </option>

              <option value="DevOps">
                DevOps
              </option>

              <option value="Cybersecurity">
                Cybersecurity
              </option>

              <option value="UI/UX Design">
                UI/UX Design
              </option>

              <option value="Product Management">
                Product Management
              </option>

              <option value="Digital Marketing">
                Digital Marketing
              </option>

              <option value="Sales & Business Development">
                Sales & Business Development
              </option>

              <option value="Finance & Accounting">
                Finance & Accounting
              </option>

              <option value="Human Resources">
                Human Resources
              </option>

              <option value="Customer Support">
                Customer Support
              </option>

              <option value="Content & Writing">
                Content & Writing
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>

        </aside>


        {/* ================= JOB RESULTS ================= */}

        <section className="jobs-results">

          <div className="results-top">

            <div>
              <h2>Available Jobs</h2>

              <p>
                Showing {filteredJobs.length} of {jobs.length} jobs
              </p>
            </div>

            <select>
              <option>Most Recent</option>
              <option>Salary: High to Low</option>
              <option>Salary: Low to High</option>
            </select>

          </div>


          {/* JOB CARDS */}

          <div className="job-cards">

            {filteredJobs.length > 0 ? (

              filteredJobs.map((job) => (

                <article className="job-card" key={job.id}>

                  <div className="company-logo">
                    {job.company_name
                      ? job.company_name.charAt(0).toUpperCase()
                      : "C"}
                  </div>


                  <div className="job-information">

                    <div className="job-title-row">

                      <div>
                        <h3>{job.title}</h3>
                        <p className="company-name">
                          {job.company_name}
                        </p>
                      </div>

                      <button
                        className={`save-job ${savedJobs.includes(job.id)
                          ? "saved"
                          : ""
                          }`}
                        onClick={() => toggleSave(job.id)}
                      >
                        {savedJobs.includes(job.id) ? "♥" : "♡"}
                      </button>

                    </div>


                    <div className="job-meta">

                      <span>⌖ {job.location}</span>

                      <span>
                        ₹{job.salary_min || 0} - ₹{job.salary_max || "Not specified"} LPA
                      </span>

                      <span>◷ {job.experience_required || "Not specified"}</span>

                    </div>


                    <div className="job-skills">
                      {job.skills
                        ? job.skills.split(",").map((skill) => (
                          <span key={skill.trim()}>
                            {skill.trim()}
                          </span>
                        ))
                        : null}
                    </div>


                    <div className="job-bottom">

                      <span className="job-type">
                        {job.job_type}
                      </span>

                      <span className="posted">
                        Posted{" "}
                        {job.created_at
                          ? new Date(job.created_at).toLocaleDateString()
                          : ""}
                      </span>

                      <a
                        href={`/jobs/${job.id}`}
                        className="view-job"
                      >
                        View Job →
                      </a>

                    </div>

                  </div>

                </article>

              ))

            ) : (

              <div className="no-jobs">

                <h3>No jobs found</h3>

                <p>
                  Try changing your search or filters.
                </p>

              </div>

            )}

          </div>

        </section>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="jobs-footer">

        <div className="footer-main">

          <div>
            <h3>JobHunt</h3>

            <p>
              Find your dream job and build your future.
            </p>
          </div>

          <div className="footer-column">

            <h4>For Job Seekers</h4>

            <a href="#">Find Jobs</a>
            <a href="#">Saved Jobs</a>
            <a href="#">Applications</a>

          </div>

          <div className="footer-column">

            <h4>For Employers</h4>

            <a href="#">Post a Job</a>
            <a href="#">Find Candidates</a>
            <a href="#">Recruiter Dashboard</a>

          </div>

          <div className="footer-column">

            <h4>Company</h4>

            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Privacy Policy</a>

          </div>

        </div>

        <div className="footer-bottom">

          <p>
            © 2026 JobHunt. All rights reserved.
          </p>

          <div>
            <a href="#">Facebook</a>
            <a href="#">LinkedIn</a>
            <a href="#">Twitter</a>
          </div>

        </div>

      </footer>

    </div>
  );
}

export default FindJobs;