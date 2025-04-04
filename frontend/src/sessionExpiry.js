import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";

const useSessionManagement = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if userToken exists in localStorage
    const token = localStorage.getItem("userToken");

    if (!token) {
      notification.warning({
        message: "Session expired!",
        description: "You are not logged in. Please log in to continue.",
      });
      navigate("/");
    }

    // Store a flag in sessionStorage to track if the tab is refreshed
    sessionStorage.setItem("isRefreshed", "true");

    const handleBeforeUnload = (event) => {
      if (!sessionStorage.getItem("isRefreshed")) {
        localStorage.clear(); // Clears storage only on full browser close
      }
      sessionStorage.removeItem("isRefreshed"); // Remove refresh flag after unload
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
};

export default useSessionManagement;
