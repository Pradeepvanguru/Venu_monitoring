// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Import createRoot from react-dom/client
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router
import App from './App'; // Import your App component
// import { BrowserRouter, unstable_HistoryRouter as HistoryRouter } from "react-router-dom";

const routerFutureFlags = {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
};

const root = ReactDOM.createRoot(document.getElementById('root'));  // Create root using createRoot
root.render(
  <Router future={routerFutureFlags}>  {/* Make sure Router wraps the entire application */}
    <App />
  </Router>
);
