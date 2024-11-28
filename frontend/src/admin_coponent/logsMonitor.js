import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Toolbar, MenuItem, Select, FormControl, InputLabel, Typography } from '@mui/material';
import AdminNavbar from './admin_nav'
const LogTable = () => {
  const [logs, setLogs] = useState([]);  // State for log data
  const [operation, setOperation] = useState('');  // State for filtering by operation
  const [opStatus, setOpStatus] = useState('');  // State for filtering by op_status

  // Fetch logs from the backend
  const fetchLogs = async () => {
    try {
      const response = await axios.get('/api/logs', {
        params: {
          operation: operation || undefined,
          op_status: opStatus || undefined,
        },
      });
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  // Fetch logs on component mount or when filters change
  useEffect(() => {
    fetchLogs();
  }, [operation, opStatus]);

  return (
    <div style={{ padding: '20px' }}>
      <AdminNavbar />
      <Typography variant="h6" gutterBottom>
        Logs
      </Typography>
      <Toolbar>
        {/* Dropdown for Operation Filter */}
        <FormControl style={{ marginRight: '20px', minWidth: '150px' }}>
          <InputLabel>Operation</InputLabel>
          <Select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="INSERT">INSERT</MenuItem>
            <MenuItem value="UPDATE">UPDATE</MenuItem>
            <MenuItem value="DELETE">DELETE</MenuItem>
          </Select>
        </FormControl>

        {/* Dropdown for op_status Filter */}
        <FormControl style={{ marginRight: '20px', minWidth: '150px' }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={opStatus}
            onChange={(e) => setOpStatus(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="SUCCESS">SUCCESS</MenuItem>
            <MenuItem value="FAILURE">FAILURE</MenuItem>
          </Select>
        </FormControl>
      </Toolbar>

      {/* Log Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Log ID</TableCell>
              <TableCell>Table Name</TableCell>
              <TableCell>Operation</TableCell>
              <TableCell>Affected Row ID</TableCell>
              <TableCell>Operation Time</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.log_id}>
                <TableCell>{log.log_id}</TableCell>
                <TableCell>{log.table_name}</TableCell>
                <TableCell>{log.operation}</TableCell>
                <TableCell>{log.affected_row_id}</TableCell>
                <TableCell>{new Date(log.operation_time).toLocaleString()}</TableCell>
                <TableCell>{log.user_id || 'N/A'}</TableCell>
                <TableCell>{log.details}</TableCell>
                <TableCell>{log.op_status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default LogTable;
