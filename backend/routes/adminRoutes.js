const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin dashboard statistics
router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const [users] = await db.promise().query(
        "SELECT COUNT(*) AS total_users FROM users"
      );

      const [jobseekers] = await db.promise().query(
        "SELECT COUNT(*) AS total_jobseekers FROM users WHERE role = 'jobseeker'"
      );

      const [recruiters] = await db.promise().query(
        "SELECT COUNT(*) AS total_recruiters FROM users WHERE role = 'recruiter'"
      );

      const [jobs] = await db.promise().query(
        "SELECT COUNT(*) AS total_jobs FROM jobs"
      );

      const [activeJobs] = await db.promise().query(
        "SELECT COUNT(*) AS active_jobs FROM jobs WHERE status = 'active'"
      );

      const [applications] = await db.promise().query(
        "SELECT COUNT(*) AS total_applications FROM applications"
      );

      res.status(200).json({
        message: "Admin statistics fetched successfully",
        stats: {
          total_users: users[0].total_users,
          total_jobseekers: jobseekers[0].total_jobseekers,
          total_recruiters: recruiters[0].total_recruiters,
          total_jobs: jobs[0].total_jobs,
          active_jobs: activeJobs[0].active_jobs,
          total_applications: applications[0].total_applications,
        },
      });
    } catch (error) {
      console.error("Admin stats error:", error);

      res.status(500).json({
        message: "Failed to fetch admin statistics",
      });
    }
  }
);

// Get all users
router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const [users] = await db.promise().query(
        `SELECT
          id,
          name,
          email,
          role,
          created_at
         FROM users
         ORDER BY created_at DESC`
      );

      res.status(200).json({
        message: "Users fetched successfully",
        users,
      });
    } catch (error) {
      console.error("Get users error:", error);

      res.status(500).json({
        message: "Failed to fetch users",
      });
    }
  }
);

// Delete a user
router.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const userId = req.params.id;
      const adminId = req.user.id;

      // Prevent admin from deleting their own account
      if (Number(userId) === Number(adminId)) {
        return res.status(400).json({
          message: "You cannot delete your own admin account",
        });
      }

      // Check that user exists
      const [users] = await db.promise().query(
        "SELECT id, role FROM users WHERE id = ?",
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Delete user
      await db.promise().query(
        "DELETE FROM users WHERE id = ?",
        [userId]
      );

      res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Delete user error:", error);

      res.status(500).json({
        message: "Failed to delete user",
      });
    }
  }
);

// Get all recruiters with company information
router.get(
  "/recruiters",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const [recruiters] = await db.promise().query(
        `SELECT
          u.id,
          u.name,
          u.email,
          u.created_at,
          c.id AS company_id,
          c.company_name,
          c.description,
          c.website,
          c.location
         FROM users u
         LEFT JOIN companies c
           ON u.id = c.recruiter_id
         WHERE u.role = 'recruiter'
         ORDER BY u.created_at DESC`
      );

      res.status(200).json({
        message: "Recruiters fetched successfully",
        recruiters,
      });
    } catch (error) {
      console.error("Get recruiters error:", error);

      res.status(500).json({
        message: "Failed to fetch recruiters",
      });
    }
  }
);

// Get all jobs for admin
router.get(
  "/jobs",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const [jobs] = await db.promise().query(
        `SELECT
          j.id,
          j.title,
          j.location,
          j.job_type,
          j.salary_min,
          j.salary_max,
          j.experience_required,
          j.application_deadline,
          j.status,
          j.created_at,
          c.company_name,
          u.name AS recruiter_name
         FROM jobs j
         JOIN companies c
           ON j.company_id = c.id
         JOIN users u
           ON j.recruiter_id = u.id
         ORDER BY j.created_at DESC`
      );

      res.status(200).json({
        message: "Jobs fetched successfully",
        jobs,
      });
    } catch (error) {
      console.error("Get admin jobs error:", error);

      res.status(500).json({
        message: "Failed to fetch jobs",
      });
    }
  }
);

// Delete job by admin
router.delete(
  "/jobs/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const jobId = req.params.id;

      const [jobs] = await db.promise().query(
        "SELECT id FROM jobs WHERE id = ?",
        [jobId]
      );

      if (jobs.length === 0) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      await db.promise().query(
        "DELETE FROM jobs WHERE id = ?",
        [jobId]
      );

      res.status(200).json({
        message: "Job deleted successfully",
      });
    } catch (error) {
      console.error("Admin delete job error:", error);

      res.status(500).json({
        message: "Failed to delete job",
      });
    }
  }
);
module.exports = router;