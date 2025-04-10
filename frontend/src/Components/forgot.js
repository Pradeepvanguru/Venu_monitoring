import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const ForgotPassword = () => {
  const [step, setStep] = useState("forgot"); // forgot, otp, reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role,setRole]=useState('')
  const navigate = useNavigate();

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_URL}/auth/api/send-otp`, { email });
      setStep("otp");
      notification.success({ message: "OTP sent successfully!" });
    } catch (err) {
      setError("Failed to send OTP. Try again.");
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_URL}/auth/api/verify-otp`, { email, otp });
      setStep("reset");
      notification.success({ message: "OTP verified successfully!" });
    } catch (err) {
      setError("Invalid OTP. Try again.");
    }
    setLoading(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const res = await axios.post(`${process.env.REACT_APP_URL}/auth/api/reset-password`, { email, newPassword });
  
      notification.success({ message: "Password reset successfully!" });
  
      const userRole = res.data.role; // Extract role from response
  
      if (userRole === "employee") {
        navigate("/employee-auth");
      } else if (userRole === "team-lead") {
        navigate("/team-lead-auth");
      } else {
        navigate("/"); // Default navigation
      }
    } catch (err) {
      setError("Failed to reset password. Try again.");
    }
  
    setLoading(false);
  };
  
  const styles = {
    container: {
      width: "500px",
      margin: "50px auto",
      padding: "30px",
      textAlign: "center",
      border: "1px solid #ccc",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      backgroundColor: "#fff",
    },
    form: {
      display: "flex",
      flexDirection: "column",
    },
    input: {
      margin: "10px 0",
      padding: "10px",
      fontSize: "16px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      color: "#333",
      width: "100%",
    },
    button: {
      padding: "10px",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      cursor: "pointer",
      borderRadius: "5px",
      fontSize: "16px",
    },
    error: {
      color: "red",
      fontSize: "14px",
    },
    passwordContainer: {
      position: "relative",
      width: "100%",
    },
    eyeIcon: {
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      fontSize: "18px",
    },
    
    
  }

  return (
    <div style={styles.container}>
      {error && <p style={styles.error}>{error}</p>}
      {step === "forgot" && (
        <form onSubmit={handleForgotSubmit} style={styles.form}>
          <h4>Forgot Password</h4>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "OTP sending wait..." : "Send OTP"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleOtpSubmit} style={styles.form}>
          <h4>Verify OTP</h4>
          
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={handleResetSubmit} style={styles.form}>
          <h4>Reset Password</h4>
          <div style={styles.passwordContainer}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={styles.input}
            />
            <span onClick={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Resetting..." : "Reset"}
          </button>
        </form>
      )}
      <style>
        {
          `label{
          margin-left:-930px;
          }
          `
        }
      </style>
    </div>
  );
};



export default ForgotPassword;
