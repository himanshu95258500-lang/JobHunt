import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove authentication information
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged out successfully");

    // Send user back to login
    navigate("/login");
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;