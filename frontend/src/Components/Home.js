// src/Components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import Footer from './Footer';

const Home = () => {
    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Welcome to the Collaborative Management Tool</h1>
                <p>Efficiently plan, execute, and monitor your projects with ease.</p>
                <div className="home-buttons">
                    <Link to="/team-lead-auth">
                        <button className="home-btn">Team Lead</button>
                    </Link>
                    <Link to="/employee-auth">
                        <button className="home-btn">Employee</button>
                    </Link>
                </div>
            </header>
            <section className="home-info">
                <div className="info-block">
                    <h3>Real-Time Collaboration</h3>
                    <p>Work together seamlessly with your team in real time.</p>
                </div>
                <div className="info-block">
                    <h3>Customizable Workflows</h3>
                    <p>Create workflows that suit your project's needs.</p>
                </div>
                <div className="info-block">
                    <h3>Integrated File Sharing</h3>
                    <p>Share documents and files with your team securely.</p>
                </div>
                <div className="info-block">
                    <h3>Robust Analytics</h3>
                    <p>Monitor progress and get insights with comprehensive reports.</p>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default Home;
