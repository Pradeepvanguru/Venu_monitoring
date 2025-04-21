import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const StyledCard = ({ title, content, onAction }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const handleClick = async () => {
        setIsLoading(true);
        try {
            await onAction();
            setStatus('success');
        } catch (error) {
            setStatus('error');
        }
        setIsLoading(false);
        setTimeout(() => setStatus(null), 3000);
    };

    return (
        <div className="styled-card" style={styles.card}>
            <div className="card-content" style={styles.cardContent}>
                <h3 style={styles.title}>{title}</h3>
                <p style={styles.text}>{content}</p>
                
                <button 
                    onClick={handleClick} 
                    style={styles.button}
                    className={`action-button ${isLoading ? 'loading' : ''}`}
                >
                    {isLoading ? (
                        <div className="loader" style={styles.loader}></div>
                    ) : 'Action'}
                </button>

                {status && (
                    <div 
                        className={`status-message ${status}`}
                        style={{
                            ...styles.statusMessage,
                            ...(status === 'success' ? styles.success : styles.error)
                        }}
                    >
                        {status === 'success' ? (
                            <><FaCheckCircle /> Success!</>
                        ) : (
                            <><FaTimesCircle /> Error!</>
                        )}
                    </div>
                )}
            </div>

            <style>
                {`
                    .styled-card {
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                    }
                    
                    .styled-card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 10px 20px rgba(0,0,0,0.2);
                    }

                    .action-button {
                        transition: all 0.3s ease;
                        position: relative;
                        overflow: hidden;
                    }

                    .action-button:hover {
                        transform: scale(1.05);
                    }

                    .action-button:active {
                        transform: scale(0.95);
                    }

                    .action-button.loading {
                        pointer-events: none;
                        opacity: 0.8;
                    }

                    .loader {
                        animation: spin 1s linear infinite;
                    }

                    .status-message {
                        animation: slideIn 0.3s ease;
                    }

                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }

                    @keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}
            </style>
        </div>
    );
};

const styles = {
    card: {
        background: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        margin: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        fontFamily: "'Segoe UI', 'Roboto', sans-serif"
    },
    cardContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    title: {
        fontSize: '24px',
        color: '#2c3e50',
        marginBottom: '8px',
        fontWeight: '600'
    },
    text: {
        fontSize: '16px',
        color: '#34495e',
        lineHeight: '1.6'
    },
    button: {
        background: '#3498db',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '44px'
    },
    loader: {
        width: '20px',
        height: '20px',
        border: '3px solid #ffffff',
        borderTop: '3px solid transparent',
        borderRadius: '50%'
    },
    statusMessage: {
        padding: '12px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '500'
    },
    success: {
        background: '#d4edda',
        color: '#155724',
        border: '1px solid #c3e6cb'
    },
    error: {
        background: '#f8d7da',
        color: '#721c24',
        border: '1px solid #f5c6cb'
    }
};

export default StyledCard;