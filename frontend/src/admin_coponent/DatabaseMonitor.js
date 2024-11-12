import React, { useEffect, useState } from 'react';

function DatabaseMonitor() {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch performance data every 10 seconds
        const fetchMetrics = () => {
            fetch('http://127.0.0.1:5000/api/performance')
                .then((response) => response.json())
                .then((data) => {
                    console.log("Fetched data:", data); // Log the fetched data structure
                    if (Array.isArray(data)) {
                        setMetrics(data);
                        setError(null); // Clear any previous errors
                    } else {
                        console.error("Data is not in the expected array format:", data);
                        setMetrics([]);
                        setError("Unexpected data format received.");
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching database metrics:", error);
                    setLoading(false);
                    setError("Failed to fetch database metrics. Please try again later.");
                });
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 36000000); // Fetch hour

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
                                <td>{metric[1]}</td> {/* Size_MB */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default DatabaseMonitor;
