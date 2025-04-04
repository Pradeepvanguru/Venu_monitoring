// src/App.js
import React, { useState,useEffect,navigate } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Home from './Components/Home';
import About from './Components/About';
import Contact from './Components/Contact';
import Navbar from './Components/Navbar';
import TeamLeadAuth from './Components/TeamLeadAuth';
import EmployeeAuth from './Components/EmployeeAuth';
import TeamLeadInterface from './Components/TeamLeadInterface';
import EmployeeDashboard from './Components/EmployeeDashboard';
import CreateTask from './Components/CreateTask';
import FileModules from './Components/FileModules';
// import Deadlines from './Components/Deadlines';
import ChatPage from './ChatsComponents/ChatPage';
import TaskModules from './Components/EmployeeInterface';
import Profile from './ChatsComponents/Profile';
import ForgotPassword from './Components/forgot';
import { notification } from 'antd';
import useSessionManagement from './sessionExpiry';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const App = () => {
    useSessionManagement()
    // State for authentication
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate=useNavigate()
    

    // Handle logout logic
    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.clear();
    };

    // Conditional rendering of Navbar on certain pages
    const NavbarWrapper = ({ children }) => {
        const location = useLocation();
        const showNavbar = ['/', '/about', '/contact'].includes(location.pathname);

        return (
            <>
                {showNavbar && <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />}
                {children}
            </>
        );
    };



    return (
        <NavbarWrapper>
        <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
                
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/team-lead-auth" element={<TeamLeadAuth setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/employee-auth" element={<EmployeeAuth setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/team-lead-interface" element={<TeamLeadInterface />} />
                {/* <Route path="/employee-interface" element={<EmployeeInterface />} />  */}
                <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
                <Route path="/create-task" element={<CreateTask />} />
                <Route path="/file-modules" element={<FileModules />} />
                <Route path="/task-modules/:moduleId" element={<TaskModules />} />
                <Route path='/profile' element={<Profile />}/>
                <Route path='/forgot' element={<ForgotPassword />} />
                {/* <Route path="/deadlines" element={<Deadlines />} /> */}
                <Route path="/queries" element={<ChatPage />} />
                {/* Specific route for employee task by moduleId */}
            </Routes>
        </NavbarWrapper>
    );
};

export default App;
