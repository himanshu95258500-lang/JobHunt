import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import "./ManageUsers.css";

function ManageUsers() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    try {
      const loggedInUser = JSON.parse(storedUser);

      if (loggedInUser.role !== "admin") {
        navigate("/login");
        return;
      }

      setUser(loggedInUser);
      fetchUsers(token);
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const fetchUsers = async (token) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/users",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      console.log("Users:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch users"
        );
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error("Fetch users error:", error);
      alert(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      console.log("Delete User:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete user"
        );
      }

      setUsers((previousUsers) =>
        previousUsers.filter(
          (existingUser) => existingUser.id !== userId
        )
      );

      alert("User deleted successfully!");
    } catch (error) {
      console.error("Delete user error:", error);
      alert(error.message || "Something went wrong");
    }
  };

  if (!user || loading) {
    return <div className="manage-users-loading">Loading...</div>;
  }

  return (
    <div className="manage-users-page">

      {/* Header */}
      <header className="admin-header">

        <Link to="/" className="admin-logo">
          <span>●</span> JobHunt
        </Link>

        <nav className="admin-nav">
          <Link to="/admin-dashboard">Dashboard</Link>
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/recruiters">Recruiters</Link>
          <Link to="/admin/jobs">Jobs</Link>
        </nav>

        <div className="admin-user">
          <span>Hi, {user.name}</span>
          <LogoutButton />
        </div>

      </header>

      {/* Main */}
      <main className="manage-users-container">

        <div className="manage-users-heading">

          <div>
            <h1>Manage Users</h1>
            <p>
              View and manage all registered JobHunt users.
            </p>
          </div>

          <Link
            to="/admin-dashboard"
            className="back-dashboard-button"
          >
            ← Dashboard
          </Link>

        </div>

        {/* User count */}
        <div className="users-summary">
          <strong>{users.length}</strong>
          <span>Total Users</span>
        </div>

        {/* Table */}
        <section className="users-table-card">

          {users.length === 0 ? (

            <div className="users-empty">
              <h2>No users found</h2>
              <p>There are currently no registered users.</p>
            </div>

          ) : (

            <div className="users-table-wrapper">

              <table className="users-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Registered</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {users.map((registeredUser) => (

                    <tr key={registeredUser.id}>

                      <td>
                        {registeredUser.id}
                      </td>

                      <td>
                        <strong>
                          {registeredUser.name}
                        </strong>
                      </td>

                      <td>
                        {registeredUser.email}
                      </td>

                      <td>

                        <span
                          className={`user-role ${registeredUser.role}`}
                        >
                          {registeredUser.role}
                        </span>

                      </td>

                      <td>
                        {new Date(
                          registeredUser.created_at
                        ).toLocaleDateString()}
                      </td>

                      <td>

                        {registeredUser.id === user.id ? (

                          <span className="current-user">
                            Current Admin
                          </span>

                        ) : (

                          <button
                            className="delete-user-button"
                            onClick={() =>
                              deleteUser(
                                registeredUser.id
                              )
                            }
                          >
                            Delete
                          </button>

                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default ManageUsers;