import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminNavbar from "./admin_nav";
import './styling/logsMonitor.css'
const LogsMonitor = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get("/admin_fetch_log?page=1&limit=50");
        setLogs(response.data); // Directly setting the raw data from the backend
      } catch (error) {
        console.error("Error fetching logs:", error);
        setError("Failed to fetch logs. Please try again.");
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="logs-monitor">
      <AdminNavbar />
      <div className="table-container"> {/* Add this wrapper for table layout adjustments */}
        {error && <p className="error-message">{error}</p>}
        {logs.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Table Name</th>
                <th>Operation</th>
                <th>Affected Row ID</th>
                <th>Operation Time</th>
                <th>User ID</th>
                <th>Details</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index}>
                  <td>{log[0]}</td> {/* log_id */}
                  <td>{log[1]}</td> {/* table_name */}
                  <td>{log[2]}</td> {/* operation */}
                  <td>{log[3]}</td> {/* affected_row_id */}
                  <td>{log[4]}</td> {/* operation_time */}
                  <td>{log[5]}</td> {/* user_id */}
                  <td>{log[6]}</td> {/* details */}
                  <td>{log[7]}</td> {/* op_status */}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No logs to display.</p>
        )}
      </div>
    </div>
  );
};

export default LogsMonitor;
