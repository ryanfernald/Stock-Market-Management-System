import React, { useState, useEffect } from 'react';
import Navbar from './UserNavBar';
import './styling/Settings.css';

const Settings = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '********',
  });

  const [editableFields, setEditableFields] = useState({
    first_name: false,
    last_name: false,
    phone: false,
    email: false,
    password: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error("No access token found");
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/auth/user/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          email: data.email,
          password: '********',
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleEditClick = (field) => {
    setEditableFields({ ...editableFields, [field]: true });
  };

  const handleSaveClick = async (field) => {
    setEditableFields({ ...editableFields, [field]: false });

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error("No access token found");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/user/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const updatedData = await response.json();
      setFormData(updatedData);
      console.log('User data successfully updated');
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Navbar />
      <div className="settings-page-container">
        <div className="user-info-container">
          <div className="user-initials">
            {formData.first_name[0]}{formData.last_name[0]}
          </div>
          <div className="user-details">
            <h2>{formData.first_name} {formData.last_name}</h2>
            <p>Last sign-in: October 8, 2024 at 9:45 AM</p>
          </div>
        </div>

        <div className="settings-content">
          {/* Left Column: Fields */}
          <div className="settings-left-column">
            <div className="settings-field">
              <label>First Name</label>
              {editableFields.first_name ? (
                <input
                  className="settings-input"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{formData.first_name}</p>
              )}
              <button onClick={() => handleEditClick('first_name')} className="edit-save-btn">
                {editableFields.first_name ? "Save" : "Edit"}
              </button>
            </div>

            <div className="settings-field">
              <label>Last Name</label>
              {editableFields.last_name ? (
                <input
                  className="settings-input"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{formData.last_name}</p>
              )}
              <button onClick={() => handleEditClick('last_name')} className="edit-save-btn">
                {editableFields.last_name ? "Save" : "Edit"}
              </button>
            </div>

            <div className="settings-field">
              <label>Phone</label>
              {editableFields.phone ? (
                <input
                  className="settings-input"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{formData.phone}</p>
              )}
              <button onClick={() => handleEditClick('phone')} className="edit-save-btn">
                {editableFields.phone ? "Save" : "Edit"}
              </button>
            </div>

            <div className="settings-field">
              <label>Email</label>
              {editableFields.email ? (
                <input
                  className="settings-input"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{formData.email}</p>
              )}
              <button onClick={() => handleEditClick('email')} className="edit-save-btn">
                {editableFields.email ? "Save" : "Edit"}
              </button>
            </div>

            {/* Password Field */}
            <div className="settings-field">
              <label>Password</label>
              {editableFields.password ? (
                <input
                  className="settings-input"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{formData.password}</p>
              )}
              <button onClick={() => handleEditClick('password')} className="edit-save-btn">
                {editableFields.password ? "Save" : "Edit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;