import React, { useEffect, useState } from 'react';
import { database } from '../firbaseconfig.js';
import { ref, onValue, update } from "firebase/database";
import DatabaseMonitor from './DatabaseMonitor'; // Import DatabaseMonitor
import AdminNavbar from './admin_nav.js'; // Import Admin Navbar
import './styling/AdminDashboard.css'; // Import the new CSS file
import Modal from 'react-modal';

const AdminDashboard = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null); // Selected ticket details
  const [note, setNote] = useState(""); // Note text
  const [status, setStatus] = useState(""); // Ticket status

  useEffect(() => {
    const serviceRef = ref(database, '/ServeReq/');
    onValue(serviceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requestsArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setServiceRequests(requestsArray);
      }
    });
  }, []);

  // Open modal with selected ticket details
  const handleOpenModal = (request) => {
    setSelectedRequest(request);
    setNote(request.notes || "");
    setStatus(request.ticket_status || "open");
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedRequest(null);
  };

  // Update note in Firebase
  const handleUpdateNote = () => {
    if (selectedRequest) {
      const requestRef = ref(database, `/ServeReq/${selectedRequest.id}`);
      update(requestRef, { notes: note });
    }
  };

  // Update ticket status in Firebase
  const handleUpdateStatus = (newStatus) => {
    if (selectedRequest) {
      const requestRef = ref(database, `/ServeReq/${selectedRequest.id}`);
      update(requestRef, { ticket_status: newStatus });
      setStatus(newStatus);
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminNavbar /> {/* Navbar at the top */}

      <div className="dashboard-content">
        {/* Left Side - Service Requests */}
        <div className="left-side">
          <div className="service-requests">
            <h2>Service Requests</h2>
            <ul>
              {serviceRequests.map(request => (
                <li key={request.id} onClick={() => handleOpenModal(request)}>
                  <h3>{request.title}</h3>
                  <p><strong>Date:</strong> {request.date}</p>
                  <p><strong>Description:</strong> {request.desc}</p>
                  <p><strong>User ID:</strong> {request.userId}</p>
                  <p><strong>Status:</strong> {request.ticket_status}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side - Database Performance */}
        <div className="right-side">
          <div className="database-performance">
            <DatabaseMonitor />
          </div>
        </div>
      </div>

      {/* Modal for Ticket Details */}
      <Modal
        isOpen={!!selectedRequest}
        onRequestClose={handleCloseModal}
        contentLabel="Ticket Details"
        className="ticket-modal"
      >
        {selectedRequest && (
          <>
            <h2>{selectedRequest.title}</h2>
            <p><strong>Date:</strong> {selectedRequest.date}</p>
            <p><strong>Description:</strong> {selectedRequest.desc}</p>
            <p><strong>User ID:</strong> {selectedRequest.userId}</p>

            <label>
              <strong>Notes:</strong>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={handleUpdateNote} // Update note on blur
              />
            </label>

            <label>
              <strong>Status:</strong>
              <select
                value={status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
              >
                <option value="open">Open</option>
                <option value="inprogress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </label>

            <button onClick={handleCloseModal}>Close</button>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
