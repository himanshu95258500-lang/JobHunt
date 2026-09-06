const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get recruiter company
router.get("/company", authMiddleware, async (req, res) => {
  try {
    const recruiterId = req.user.id;

    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Only recruiters can view company profile",
      });
    }

    const [companies] = await db.promise().query(
      `SELECT
        id,
        company_name,
        description,
        website,
        location,
        created_at
       FROM companies
       WHERE recruiter_id = ?
       LIMIT 1`,
      [recruiterId]
    );

    if (companies.length === 0) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    res.status(200).json({
      message: "Company fetched successfully",
      company: companies[0],
    });
  } catch (error) {
    console.error("Get company error:", error);

    res.status(500).json({
      message: "Failed to fetch company profile",
    });
  }
});

// Update recruiter company
router.put("/company", authMiddleware, async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const {
      company_name,
      description,
      website,
      location,
    } = req.body;

    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Only recruiters can update company profile",
      });
    }

    if (!company_name || !company_name.trim()) {
      return res.status(400).json({
        message: "Company name is required",
      });
    }

    const [result] = await db.promise().query(
      `UPDATE companies
       SET company_name = ?,
           description = ?,
           website = ?,
           location = ?
       WHERE recruiter_id = ?`,
      [
        company_name.trim(),
        description || null,
        website || null,
        location || null,
        recruiterId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    res.status(200).json({
      message: "Company profile updated successfully",
    });
  } catch (error) {
    console.error("Update company error:", error);

    res.status(500).json({
      message: "Failed to update company profile",
    });
  }
});

// Create Company
router.post("/company", authMiddleware, async (req, res) => {
  try {
    const { company_name, description, website, location } = req.body;

    const recruiterId = req.user.id;

    // Make sure only recruiters can create companies
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Only recruiters can create a company",
      });
    }

    if (!company_name) {
      return res.status(400).json({
        message: "Company name is required",
      });
    }

    // Check if recruiter already has a company
    const [existingCompany] = await db.promise().query(
      "SELECT id FROM companies WHERE recruiter_id = ?",
      [recruiterId]
    );

    if (existingCompany.length > 0) {
      return res.status(409).json({
        message: "You already have a company",
      });
    }

    const [result] = await db.promise().query(
      `INSERT INTO companies
       (recruiter_id, company_name, description, website, location)
       VALUES (?, ?, ?, ?, ?)`,
      [
        recruiterId,
        company_name,
        description || null,
        website || null,
        location || null,
      ]
    );

    res.status(201).json({
      message: "Company created successfully",
      companyId: result.insertId,
    });

  } catch (error) {
    console.error("Create company error:", error);

    res.status(500).json({
      message: "Failed to create company",
    });
  }
});

// Create Job
router.post("/jobs", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      job_type,
      salary_min,
      salary_max,
      experience_required,
      skills,
      application_deadline,
    } = req.body;

    const recruiterId = req.user.id;

    // Only recruiters can create jobs
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Only recruiters can create jobs",
      });
    }

    // Required fields
    if (!title || !description) {
      return res.status(400).json({
        message: "Job title and description are required",
      });
    }

    // Find recruiter's company
    const [companies] = await db.promise().query(
      "SELECT id FROM companies WHERE recruiter_id = ?",
      [recruiterId]
    );

    if (companies.length === 0) {
      return res.status(400).json({
        message: "Please create your company profile first",
      });
    }

    const companyId = companies[0].id;

    // Create job
    const [result] = await db.promise().query(
      `INSERT INTO jobs
      (
        recruiter_id,
        company_id,
        title,
        description,
        location,
        job_type,
        salary_min,
        salary_max,
        experience_required,
        skills,
        application_deadline
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recruiterId,
        companyId,
        title,
        description,
        location || null,
        job_type || "Full Time",
        salary_min || null,
        salary_max || null,
        experience_required || null,
        skills || null,
        application_deadline || null,
      ]
    );

    res.status(201).json({
      message: "Job posted successfully",
      jobId: result.insertId,
    });

  } catch (error) {
    console.error("Create job error:", error);

    res.status(500).json({
      message: "Failed to create job",
    });
  }
});

// Get Recruiter's Jobs
router.get("/jobs", authMiddleware, async (req, res) => {
  try {
    const recruiterId = req.user.id;

    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Only recruiters can view their jobs",
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
        c.company_name
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       WHERE j.recruiter_id = ?
       ORDER BY j.created_at DESC`,
      [recruiterId]
    );

    res.status(200).json({
      message: "Jobs fetched successfully",
      jobs: jobs,
    });
  } catch (error) {
    console.error("Get recruiter jobs error:", error);

    res.status(500).json({
      message: "Failed to fetch jobs",
    });
  }
});

// Close Job
router.put("/jobs/:id/close", authMiddleware, async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const jobId = req.params.id;

    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Only recruiters can close jobs",
      });
    }

    const [result] = await db.promise().query(
      `UPDATE jobs
       SET status = 'closed'
       WHERE id = ? AND recruiter_id = ?`,
      [jobId, recruiterId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.status(200).json({
      message: "Job closed successfully",
    });
  } catch (error) {
    console.error("Close job error:", error);

    res.status(500).json({
      message: "Failed to close job",
    });
  }
});

router.delete("/jobs/:id", authMiddleware, async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const jobId = req.params.id;

    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Only recruiters can delete jobs",
      });
    }

    const [jobs] = await db.promise().query(
      `SELECT id
       FROM jobs
       WHERE id = ? AND recruiter_id = ?`,
      [jobId, recruiterId]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        message: "Job not found or you are not allowed to delete it",
      });
    }

    await db.promise().query(
      "DELETE FROM jobs WHERE id = ? AND recruiter_id = ?",
      [jobId, recruiterId]
    );

    res.status(200).json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete recruiter job error:", error);

    res.status(500).json({
      message: "Failed to delete job",
    });
  }
});

// Get Single Job
router.get("/jobs/:id", authMiddleware, async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const jobId = req.params.id;

    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Only recruiters can view jobs",
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
        c.company_name
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       WHERE j.id = ? AND j.recruiter_id = ?`,
      [jobId, recruiterId]
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
    console.error("Get single job error:", error);

    res.status(500).json({
      message: "Failed to fetch job",
    });
  }
});

// Update Job
router.put("/jobs/:id", authMiddleware, async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const jobId = req.params.id;

    const {
      title,
      description,
      location,
      job_type,
      salary_min,
      salary_max,
      experience_required,
      skills,
      application_deadline,
    } = req.body;

    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Only recruiters can update jobs",
      });
    }

    if (!title || !description) {
      return res.status(400).json({
        message: "Job title and description are required",
      });
    }

    const [result] = await db.promise().query(
      `UPDATE jobs
       SET title = ?,
           description = ?,
           location = ?,
           job_type = ?,
           salary_min = ?,
           salary_max = ?,
           experience_required = ?,
           skills = ?,
           application_deadline = ?
       WHERE id = ? AND recruiter_id = ?`,
      [
        title,
        description,
        location || null,
        job_type,
        salary_min || null,
        salary_max || null,
        experience_required || null,
        skills || null,
        application_deadline || null,
        jobId,
        recruiterId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.status(200).json({
      message: "Job updated successfully",
    });

  } catch (error) {
    console.error("Update job error:", error);

    res.status(500).json({
      message: "Failed to update job",
    });
  }
});

// Reopen Job
router.put("/jobs/:id/reopen", authMiddleware, async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const jobId = req.params.id;

    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Only recruiters can reopen jobs",
      });
    }

    const [result] = await db.promise().query(
      `UPDATE jobs
       SET status = 'active'
       WHERE id = ? AND recruiter_id = ?`,
      [jobId, recruiterId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.status(200).json({
      message: "Job reopened successfully",
    });

  } catch (error) {
    console.error("Reopen job error:", error);

    res.status(500).json({
      message: "Failed to reopen job",
    });
  }
});

// Get Applicants for Recruiter's Jobs
router.get("/applicants", authMiddleware, async (req, res) => {
  try {
    const recruiterId = req.user.id;

    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Only recruiters can view applicants",
      });
    }

    const [applicants] = await db.promise().query(
      `SELECT
        a.id AS application_id,
        a.status,
        a.cover_letter,
        a.applied_at,
        j.id AS job_id,
        j.title AS job_title,
        u.id AS applicant_id,
        u.name AS applicant_name,
        u.email AS applicant_email,
        p.phone,
        p.location,
        p.professional_title,
        p.skills,
        p.education,
        p.experience,
        p.resume
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN users u ON a.job_seeker_id = u.id
       LEFT JOIN job_seeker_profiles p ON u.id = p.user_id
       WHERE j.recruiter_id = ?
       ORDER BY a.applied_at DESC`,
      [recruiterId]
    );

    res.status(200).json({
      message: "Applicants fetched successfully",
      applicants,
    });

  } catch (error) {
    console.error("Get applicants error:", error);

    res.status(500).json({
      message: "Failed to fetch applicants",
    });
  }
});

// Update application status
router.put("/applications/:applicationId/status", authMiddleware, async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const applicationId = req.params.applicationId;
    const { status } = req.body;

    // Only recruiters can update application status
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Only recruiters can update application status",
      });
    }

    // Allowed application statuses
    const allowedStatuses = [
      "Applied",
      "Shortlisted",
      "Interview",
      "Rejected",
      "Hired",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid application status",
      });
    }

    // Make sure this application belongs to a job posted by this recruiter
    const [applications] = await db.promise().query(
      `SELECT a.id
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ? AND j.recruiter_id = ?`,
      [applicationId, recruiterId]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    // Update status
    await db.promise().query(
      `UPDATE applications
       SET status = ?
       WHERE id = ?`,
      [status, applicationId]
    );

    res.status(200).json({
      message: "Application status updated successfully",
      status,
    });

  } catch (error) {
    console.error("Update application status error:", error);

    res.status(500).json({
      message: "Failed to update application status",
    });
  }
});
module.exports = router;