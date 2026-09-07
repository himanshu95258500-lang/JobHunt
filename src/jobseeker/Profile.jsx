import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    title: "",
    about: "",
    skills: "",
    education: "",
    experience: "",
    resume: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        navigate("/login");
        return;
      }

      try {
        const loggedInUser = JSON.parse(storedUser);

        setUser(loggedInUser);

        const response = await fetch(
          "https://jobhunt-5q5m.onrender.com/api/auth/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Failed to load profile");
          return;
        }

        if (data.profile) {
          setProfile({
            fullName: data.user.name || "",
            email: data.user.email || "",
            phone: data.profile.phone || "",
            location: data.profile.location || "",
            title: data.profile.professional_title || "",
            about: data.profile.about || "",
            skills: data.profile.skills || "",
            education: data.profile.education || "",
            experience: data.profile.experience || "",
            resume: data.profile.resume || "",
          });
        } else {
          setProfile((previousProfile) => ({
            ...previousProfile,
            fullName: data.user.name || "",
            email: data.user.email || "",
          }));
        }

      } catch (error) {
        console.error("Load profile error:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
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

    try {
      const response = await fetch(
        "https://jobhunt-5q5m.onrender.com/api/auth/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: profile.fullName,
            phone: profile.phone,
            location: profile.location,
            professional_title: profile.title,
            about: profile.about,
            skills: profile.skills,
            education: profile.education,
            experience: profile.experience,
            resume: profile.resume,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to save profile");
        return;
      }

      alert("Profile saved successfully!");

      const updatedUser = {
        ...user,
        name: profile.fullName,
      };

      setUser(updatedUser);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      console.log("Profile API Response:", data);
    } catch (error) {
      console.error("Save profile error:", error);
      alert("Cannot connect to server");
    }
  };

  if (!user) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-page">

      {/* Header */}
      <header className="dashboard-header">

        <Link to="/" className="dashboard-logo">
          <span>●</span> JobHunt
        </Link>

        <nav className="dashboard-nav">
          <Link to="/jobseeker-dashboard">Dashboard</Link>
          <Link to="/find-jobs">Find Jobs</Link>
          <Link to="/jobseeker/profile">Profile</Link>
          <Link to="/jobseeker/applications">Applications</Link>
          <Link to="/jobseeker/saved-jobs">Saved Jobs</Link>
        </nav>

        <div className="dashboard-user">
          <span>Hi, {user.name}</span>
          <LogoutButton />
        </div>

      </header>

      {/* Main */}
      <main className="profile-container">

        {/* Page title */}
        <section className="profile-heading">
          <h1>My Profile</h1>
          <p>
            Keep your profile updated to improve your chances of getting hired.
          </p>
        </section>

        <form onSubmit={handleSubmit}>

          {/* Personal Information */}
          <section className="profile-card">

            <div className="profile-card-header">
              <h2>Personal Information</h2>
              <p>Tell recruiters a little about yourself.</p>
            </div>

            <div className="profile-form-grid">

              <div className="profile-form-group">
                <label htmlFor="fullName">Full Name</label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={profile.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="email">Email Address</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={profile.email}
                  readOnly
                />

                <small>Email cannot be changed here.</small>
              </div>

              <div className="profile-form-group">
                <label htmlFor="phone">Phone Number</label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={profile.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="location">Location</label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g. Delhi, India"
                  value={profile.location}
                  onChange={handleChange}
                />
              </div>

            </div>

          </section>

          {/* Professional Information */}
          <section className="profile-card">

            <div className="profile-card-header">
              <h2>Professional Information</h2>
              <p>Show recruiters what you can offer.</p>
            </div>

            <div className="profile-form-group">

              <label htmlFor="title">
                Professional Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Frontend Developer"
                value={profile.title}
                onChange={handleChange}
              />

            </div>

            <div className="profile-form-group">

              <label htmlFor="about">
                About Me
              </label>

              <textarea
                id="about"
                name="about"
                rows="5"
                placeholder="Write a short description about yourself..."
                value={profile.about}
                onChange={handleChange}
              />

            </div>

            <div className="profile-form-group">

              <label htmlFor="skills">
                Skills
              </label>

              <input
                id="skills"
                name="skills"
                type="text"
                placeholder="e.g. HTML, CSS, JavaScript, React, SQL"
                value={profile.skills}
                onChange={handleChange}
              />

              <small>
                Separate your skills with commas.
              </small>

            </div>

          </section>

          {/* Education & Experience */}
          <section className="profile-card">

            <div className="profile-card-header">
              <h2>Education & Experience</h2>
              <p>Add your academic and professional background.</p>
            </div>

            <div className="profile-form-group">

              <label htmlFor="education">
                Education
              </label>

              <textarea
                id="education"
                name="education"
                rows="4"
                placeholder="e.g. Bachelor of Computer Applications..."
                value={profile.education}
                onChange={handleChange}
              />

            </div>

            <div className="profile-form-group">

              <label htmlFor="experience">
                Experience
              </label>

              <textarea
                id="experience"
                name="experience"
                rows="4"
                placeholder="Describe your work experience..."
                value={profile.experience}
                onChange={handleChange}
              />

            </div>

          </section>

          {/* Resume */}
          <section className="profile-card">

            <div className="profile-card-header">
              <h2>Resume</h2>
              <p>Add your resume so recruiters can review your profile.</p>
            </div>

            <div className="resume-upload">

              <div className="resume-icon">
                📄
              </div>

              <div>
                <h3>Upload Resume</h3>

                <p>
                  PDF, DOC or DOCX files are recommended.
                </p>
              </div>

              <label
                htmlFor="resume"
                className="resume-button"
              >
                Choose File
              </label>

              <input
                id="resume"
                name="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files[0];

                  if (file) {
                    setProfile((previousProfile) => ({
                      ...previousProfile,
                      resume: file.name,
                    }));
                  }
                }}
              />

            </div>

            {profile.resume && (
              <p className="selected-resume">
                Selected: <strong>{profile.resume}</strong>
              </p>
            )}

          </section>

          {/* Save */}
          <div className="profile-actions">

            <button
              type="submit"
              className="save-profile-button"
            >
              Save Profile
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default Profile;