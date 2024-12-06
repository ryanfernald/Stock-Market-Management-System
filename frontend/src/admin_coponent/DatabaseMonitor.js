import React, { useEffect, useState } from 'react';

function DatabaseMonitor() {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMetrics = () => {
            fetch('http://127.0.0.1:5000/api/performance', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("Fetched data:", data); // Log the fetched data

                    // Ensure the data is an array of arrays
                    if (Array.isArray(data) && data.every(item => Array.isArray(item) && item.length === 2)) {
                        setMetrics(data);
                        setError(null); // Clear any previous errors
                    } else {
                        console.error("Unexpected data format received:", data);
                        setMetrics([]);
                        setError("Unexpected data format received.");
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Fetch error:", error.message);
                    setLoading(false);
                    setError("Failed to fetch database metrics. Please try again later.");
                });
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 3600000); // Fetch every hour

        return () => clearInterval(interval); // Cleanup on component unmount
    }, []);

    if (loading) {
        return <p>Loading database metrics...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div>
            <h2>MySQL Database Performance</h2>
            {metrics.length === 0 ? (
                <p>No metrics available.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Table</th>
                            <th>Size (MB)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {metrics.map((metric, index) => (
                            <tr key={index}>
                                <td>{metric[0]}</td> {/* Table name */}
                                <td>{metric[1]}</td> {/* Size (MB) */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default DatabaseMonitor;
