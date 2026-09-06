import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./public/Login.jsx";
import JobSeekerDashboard from "./jobseeker/JobSeekerDashboard.jsx";
import Profile from "./jobseeker/Profile.jsx";
import Applications from "./jobseeker/Applications.jsx";
import SavedJobs from "./jobseeker/SavedJobs.jsx";
import Register from "./public/Register.jsx";
import CompanyProfile from "./recruiter/CompanyProfile.jsx";
import RecruiterDashboard from "./recruiter/RecruiterDashboard.jsx";
import MyJobs from "./recruiter/MyJobs.jsx";
import EditJob from "./recruiter/EditJob.jsx";
import CreateJob from "./recruiter/CreateJob.jsx";
import Applicants from "./recruiter/Applicants.jsx";
import JobDetails from "./public/JobDetails.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import ManageUsers from "./admin/ManageUsers.jsx";
import ManageRecruiters from "./admin/ManageRecruiters.jsx";
import ManageJobs from "./admin/ManageJobs.jsx";


import App from "./App.jsx";
import FindJobs from "./public/FindJobs.jsx";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster />
      <Routes>

        <Route path="/" element={<App />} />

        <Route path="/find-jobs" element={<FindJobs />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/jobseeker-dashboard"
          element={<JobSeekerDashboard />}
        />

        <Route
          path="/jobseeker/profile"
          element={<Profile />}
        />

        <Route
          path="/jobseeker/applications"
          element={<Applications />}
        />

        <Route
          path="/jobseeker/saved-jobs"
          element={<SavedJobs />}
        />

        <Route
          path="/recruiter/company"
          element={<CompanyProfile />}
        />

        <Route
          path="/recruiter-dashboard"
          element={<RecruiterDashboard />}
        />

        <Route
          path="/recruiter/jobs/create"
          element={<CreateJob />}
        />

        <Route path="/recruiter/jobs" element={<MyJobs />} />

        <Route
          path="/recruiter/jobs/:id/edit"
          element={<EditJob />}
        />

        <Route path="/recruiter/applicants" element={<Applicants />} />

        <Route path="/jobs/:id" element={<JobDetails />} />

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/users"
          element={<ManageUsers />}
        />

        <Route
          path="/admin/recruiters"
          element={<ManageRecruiters />}
        />

        <Route
          path="/admin/jobs"
          element={<ManageJobs />}
        />


      </Routes>
    </BrowserRouter>
  </StrictMode>
);