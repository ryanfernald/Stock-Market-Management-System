import React, { useState } from 'react';
import { auth, database } from '../firbaseconfig.js'; // Import database and auth
import { ref, set } from "firebase/database"; // Import Firestore methods
import './styling/ServiceRequest.css';
import UserNavbar from "./UserNavBar"; // Import the UserNavbar component

const ServiceRequest = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const UserId = auth.currentUser ? auth.currentUser.uid : 'Unknown User';
      const newRequestRef = ref(database, '/ServeReq/' + Date.now()); // Creates a unique path for each request
      await set(newRequestRef, {
        userId: UserId,
        title: title,
        date: date,
        desc: description
      });
      alert("Your Request has been submitted! A member of our support staff will reach out to you.");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("There was an error submitting the request.");
    }
  };

  return (
    <div className="service-request-page">
      <UserNavbar /> {/* Display the navbar at the top */}
      <form onSubmit={handleSubmit} className="service-request-form">
        <div>
          <label>Title:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Date:</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <label>Description:</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
};

export default ServiceRequest;
