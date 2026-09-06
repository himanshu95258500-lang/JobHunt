const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all active jobs
router.get("/", async (req, res) => {
  try {
    const [jobs] = await db.promise().query(
      `SELECT
        j.id,
        j.title,
        j.description,
        j.location,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.experience_required,
        j.skills,
        j.application_deadline,
        j.status,
        j.created_at,
        c.company_name
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       WHERE j.status = 'active'
       ORDER BY j.created_at DESC`
    );

    res.status(200).json({
      message: "Jobs fetched successfully",
      jobs,
    });
  } catch (error) {
    console.error("Get public jobs error:", error);

    res.status(500).json({
      message: "Failed to fetch jobs",
    });
  }
});

// Save a job
router.post("/:id/save", authMiddleware, async (req, res) => {
  try {
    const jobId = req.params.id;
    const jobSeekerId = req.user.id;

    if (req.user.role !== "jobseeker") {
      return res.status(403).json({
        message: "Only job seekers can save jobs",
      });
    }

    // Check that the job exists and is active
    const [jobs] = await db.promise().query(
      `SELECT id
       FROM jobs
       WHERE id = ? AND status = 'active'`,
      [jobId]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        message: "Job not found or no longer active",
      });
    }

    // Check if already saved
    const [existingSavedJob] = await db.promise().query(
      `SELECT id
       FROM saved_jobs
       WHERE job_id = ? AND job_seeker_id = ?`,
      [jobId, jobSeekerId]
    );

    if (existingSavedJob.length > 0) {
      return res.status(409).json({
        message: "Job already saved",
      });
    }

    await db.promise().query(
      `INSERT INTO saved_jobs
       (job_id, job_seeker_id)
       VALUES (?, ?)`,
      [jobId, jobSeekerId]
    );

    res.status(201).json({
      message: "Job saved successfully",
    });

  } catch (error) {
    console.error("Save job error:", error);

    res.status(500).json({
      message: "Failed to save job",
    });
  }
});

// Get saved jobs
router.get("/saved", authMiddleware, async (req, res) => {
  try {
    const jobSeekerId = req.user.id;

    if (req.user.role !== "jobseeker") {
      return res.status(403).json({
        message: "Only job seekers can view saved jobs",
      });
    }

    const [jobs] = await db.promise().query(
      `SELECT
        j.id,
        j.title,
        j.description,
        j.location,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.experience_required,
        j.skills,
        j.application_deadline,
        j.status,
        j.created_at,
        c.company_name,
        s.saved_at

       FROM saved_jobs s

       JOIN jobs j
         ON s.job_id = j.id

       JOIN companies c
         ON j.company_id = c.id

       WHERE s.job_seeker_id = ?

       ORDER BY s.saved_at DESC`,
      [jobSeekerId]
    );

    res.status(200).json({
      message: "Saved jobs fetched successfully",
      jobs,
    });

  } catch (error) {
    console.error("Get saved jobs error:", error);

    res.status(500).json({
      message: "Failed to fetch saved jobs",
    });
  }
});

// Remove saved job
router.delete("/:id/save", authMiddleware, async (req, res) => {
  try {
    const jobId = req.params.id;
    const jobSeekerId = req.user.id;

    if (req.user.role !== "jobseeker") {
      return res.status(403).json({
        message: "Only job seekers can remove saved jobs",
      });
    }

    const [result] = await db.promise().query(
      `DELETE FROM saved_jobs
       WHERE job_id = ? AND job_seeker_id = ?`,
      [jobId, jobSeekerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Saved job not found",
      });
    }

    res.status(200).json({
      message: "Job removed from saved jobs",
    });

  } catch (error) {
    console.error("Remove saved job error:", error);

    res.status(500).json({
      message: "Failed to remove saved job",
    });
  }
});

// Get single active job
router.get("/:id", async (req, res) => {
  try {
    const jobId = req.params.id;

    const [jobs] = await db.promise().query(
      `SELECT
        j.id,
        j.title,
        j.description,
        j.location,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.experience_required,
        j.skills,
        j.application_deadline,
        j.status,
        j.created_at,
        c.company_name,
        c.website,
        c.description AS company_description
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       WHERE j.id = ? AND j.status = 'active'`,
      [jobId]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.status(200).json({
      message: "Job fetched successfully",
      job: jobs[0],
    });

  } catch (error) {
    console.error("Get single public job error:", error);

    res.status(500).json({
      message: "Failed to fetch job",
    });
  }
});

// Apply for a job
router.post("/:id/apply", authMiddleware, async (req, res) => {
  try {
    const jobId = req.params.id;
    const jobSeekerId = req.user.id;
    const { cover_letter } = req.body;

    // Only job seekers can apply
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({
        message: "Only job seekers can apply for jobs",
      });
    }

    // Check if job exists and is active
    const [jobs] = await db.promise().query(
      `SELECT id, application_deadline
       FROM jobs
       WHERE id = ? AND status = 'active'`,
      [jobId]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        message: "Job not found or no longer active",
      });
    }

    // Check application deadline
    if (
      jobs[0].application_deadline &&
      new Date(jobs[0].application_deadline) < new Date()
    ) {
      return res.status(400).json({
        message: "Application deadline has passed",
      });
    }

    // Check if already applied
    const [existingApplication] = await db.promise().query(
      `SELECT id
       FROM applications
       WHERE job_id = ? AND job_seeker_id = ?`,
      [jobId, jobSeekerId]
    );

    if (existingApplication.length > 0) {
      return res.status(409).json({
        message: "You have already applied for this job",
      });
    }

    // Save application
    await db.promise().query(
      `INSERT INTO applications
       (job_id, job_seeker_id, cover_letter)
       VALUES (?, ?, ?)`,
      [jobId, jobSeekerId, cover_letter || null]
    );

    res.status(201).json({
      message: "Application submitted successfully",
    });

  } catch (error) {
    console.error("Apply job error:", error);

    res.status(500).json({
      message: "Failed to submit application",
    });
  }
});

// Get applications of logged-in job seeker
router.get("/applications/my", authMiddleware, async (req, res) => {
  try {
    const jobSeekerId = req.user.id;

    // Only job seekers can view their applications
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({
        message: "Only job seekers can view applications",
      });
    }

    const [applications] = await db.promise().query(
      `SELECT
        a.id,
        a.cover_letter,
        a.status,
        a.applied_at,
        a.updated_at,

        j.id AS job_id,
        j.title,
        j.location,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.experience_required,

        c.company_name

       FROM applications a

       JOIN jobs j
         ON a.job_id = j.id

       JOIN companies c
         ON j.company_id = c.id

       WHERE a.job_seeker_id = ?

       ORDER BY a.applied_at DESC`,
      [jobSeekerId]
    );

    res.status(200).json({
      message: "Applications fetched successfully",
      applications,
    });

  } catch (error) {
    console.error("Get my applications error:", error);

    res.status(500).json({
      message: "Failed to fetch applications",
    });
  }
});


module.exports = router;