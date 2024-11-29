import React, { useState } from 'react';
import AdminNavbar from './admin_nav.js'; // Import Admin Navbar
// import axios from 'axios';

const AdminInsert = () => {
    const [selectedTable, setSelectedTable] = useState('');
    const [formData, setFormData] = useState({});
    
    // Define table options and fields for each table
    const tableOptions = {
        'User': ['user_id', 'first_name', 'last_name', 'email'],
        'Stock' : ['ticker_symbol', 'sector_id'],
        'MarketOrder': ['order_id', 'user_id', 'ticker_symbol', 'price_purchased', 'quantity', 'purchase_date', 'order_type'],
        'FundsDeposit': ['deposit_id', 'user_id', 'amount', 'time_initiated', 'cleared'],
        'FundsWithdraw': ['withdraw_id', 'user_id', 'amount', 'time_initiated', 'cleared'],
        'StockPrice': ['ticker_symbol', 'price', 'time_posted'],
    };

    const handleTableChange = (e) => {
        const table = e.target.value;
        setSelectedTable(table);
        setFormData({}); // Clear previous form data when changing the table
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent form default behavior
    
        try {
            // Construct the payload
            const payload = {
                tableName: selectedTable,
                data: formData
            };
    
            // Setup the request options
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            };
    
            // Perform the fetch call
            const response = await fetch('http://127.0.0.1:5000/Admin/insertion', requestOptions);
    
            // Check if the response is successful
            if (response.ok) {
                //const result = await response.json();
                alert(`Data inserted into ${selectedTable} successfully!`);
            } else {
                // Handle non-success responses
                const errorData = await response.json();
                console.error('Error inserting data:', errorData);
                alert(`Failed to insert data: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            // Handle network or unexpected errors
            console.error('Error inserting data:', error.message);
            alert('Failed to insert data due to a network error.');
        }
    };
    

    return (
        <div>
            <AdminNavbar />
            <h2>Admin Insert Data</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Select Table:
                    <select value={selectedTable} onChange={handleTableChange}>
                        <option value="">Select a table</option>
                        {Object.keys(tableOptions).map(table => (
                            <option key={table} value={table}>{table}</option>
                        ))}
                    </select>
                </label>

                {/* Display form fields based on selected table */}
                {selectedTable && tableOptions[selectedTable].map(field => (
                    <div key={field}>
                        <label>{field}:</label>
                        <input
                            type="text"
                            name={field}
                            value={formData[field] || ''}
                            onChange={handleInputChange}
                        />
                    </div>
                ))}

                <button type="submit">Insert Data</button>
            </form>
        </div>
    );
};

export default AdminInsert;
