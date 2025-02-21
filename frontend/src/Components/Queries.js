// src/components/Queries.js
import React, { useState } from 'react';
import './Queries.css'; // Assuming Queries-specific CSS

const Queries = () => {
    const [query, setQuery] = useState('');
    const [message, setMessage] = useState('');
    const [queries, setQueries] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (query.trim() === '') {
            setMessage('Query cannot be empty!');
            return;
        }

        // Simulate sending the query (replace with actual API call if needed)
        const newQuery = {
            id: queries.length + 1,
            content: query,
            timestamp: new Date().toLocaleString()
        };
        
        setQueries([...queries, newQuery]);
        setQuery('');
        setMessage('Your query has been sent to the Team Lead!');

        // Clear the success message after 3 seconds
        setTimeout(() => {
            setMessage('');
        }, 3000);
    };

    return (
        <div className="queries-interface">
            {/* Render the fixed EmployeeSidebar */}
               
            {/* The main content will be shifted due to the sidebar */}
            <main className="main-content">
                <div className="queries-container">
                    <h2>Instant Queries</h2>
                    <form className="query-form" onSubmit={handleSubmit}>
                        <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Type your query here..."
                            rows="4"
                            required
                        ></textarea>
                        <button type="submit">Send Query</button>
                    </form>

                    {message && <p className="success-message">{message}</p>}

                    <div className="previous-queries">
                        <h3>Your Previous Queries</h3>
                        {queries.length === 0 ? (
                            <p>No queries sent yet.</p>
                        ) : (
                            <ul>
                                {queries.map((q) => (
                                    <li key={q.id}>
                                        <span>{q.timestamp}</span> - {q.content}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Queries;
