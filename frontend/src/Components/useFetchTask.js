import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Get moduleId from URL
import axios from 'axios';

const useFetchTask = () => {
    const { moduleId } = useParams(); // Get moduleId from URL
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalDays, setTotalDays] = useState(0);
    const [daysSubmitted, setDaysSubmitted] = useState(0);

    useEffect(() => {
        const fetchTaskData = async () => {
            try {
                setLoading(true);
                if (!moduleId) throw new Error('Module ID not found.');

                const response = await axios.get(`${process.env.REACT_APP_URL}/api/task-modules/${moduleId}`);
                const task = response.data;

                const daysBetween = Math.ceil((new Date(task.endDate) - new Date(task.startDate)) / (1000 * 60 * 60 * 24));
                setTotalDays(daysBetween);
                setDaysSubmitted(task.submissions ? task.submissions.length : 0);

                setTask(task);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching task data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchTaskData();
    }, [moduleId]);

    return { task, loading, error, totalDays, daysSubmitted };
};

export default useFetchTask;
