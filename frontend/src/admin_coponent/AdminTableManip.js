import React, { useState, useEffect, useCallback } from 'react';
import AdminNavbar from './admin_nav.js'; // Import Admin Navbar
import './styling/AdminTableManip.css';

const AdminTableManip = () => {
    const [selectedTable, setSelectedTable] = useState('');
    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [activeTab, setActiveTab] = useState('delete'); // Default to deletion mode
    const [formData, setFormData] = useState({}); // For insertion

    // Update the static table options to reflect the new schema
    const tableOptions = {
        'User': ['user_id', 'email'],
        'UserData': ['email', 'first_name', 'last_name'],
        'Sector': ['sector_id', 'sector_name'],
        'Stock': ['ticker_symbol', 'sector_id'],
        'StockPrice': ['ticker_symbol', 'price', 'time_posted'],
        'MarketOrder': ['order_id', 'user_id', 'ticker_symbol', 'price_purchased', 'quantity', 'purchase_date', 'order_type'],
        'UserBalance': ['user_id', 'balance_usd'],
        'FundsDeposit': ['deposit_id', 'user_id', 'amount', 'time_initiated', 'cleared'],
        'FundsWithdraw': ['withdraw_id', 'user_id', 'amount', 'time_initiated', 'cleared'],
        'Watchlist': ['user_id', 'ticker_symbol'],
        'News': ['news_id', 'news_content', 'time_posted'],
        'SavedNews': ['user_id', 'news_id'],
        'Log': ['log_id', 'table_name', 'operation', 'affected_row_id', 'operation_time', 'user_id', 'details', 'op_status'],
    };

    // Fetch table data from the backend
    const fetchTableData = useCallback(async () => {
        if (!selectedTable) return;

        try {
            const response = await fetch(`http://127.0.0.1:5000/fetch_table?tableName=${selectedTable}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const data = await response.json();
                setTableData(data);
                setColumns(Object.keys(data[0] || {})); // Extract columns dynamically
            } else {
                const error = await response.json();
                alert(error.error || 'Error fetching table data');
            }
        } catch (error) {
            console.error('Error fetching table data:', error.message);
        }
    }, [selectedTable]);

    // Handle table selection
    const handleTableChange = (e) => {
        const table = e.target.value;
        setSelectedTable(table);
        setColumns(tableOptions[table]); // Set columns based on the selected table
        setFormData({});
        fetchTableData(); // Fetch data when table changes
    };

    // Handle input change for insertion
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    // Submit new data to the backend
    const handleInsert = async (e) => {
        e.preventDefault();

        if (!selectedTable || Object.keys(formData).length === 0) {
            alert('Please fill out the form completely.');
            return;
        }

        try {
            const payload = {
                tableName: selectedTable,
                data: formData,
            };

            const response = await fetch('http://127.0.0.1:5000/Admin/insertion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert(`Data inserted into ${selectedTable} successfully!`);
                setFormData({});
                fetchTableData(); // Refresh table data after insertion
            } else {
                const errorData = await response.json();
                alert(`Failed to insert data: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            alert('Failed to insert data due to a network error.');
        }
    };

    // Handle row deletion
    const handleDeleteRow = async (row) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete this row?`);
        if (!confirmDelete) return;
    
        console.log('Deleting row:', row); // Debug: Log row data
    
        try {
            const response = await fetch('http://127.0.0.1:5000/delete_row', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableName: selectedTable, row }),
            });
    
            if (response.ok) {
                alert('Row deleted successfully!');
                fetchTableData(); // Refresh table data after deletion
            } else {
                const error = await response.json();
                alert(error.error || 'Error deleting the row');
            }
        } catch (error) {
            console.error('Error deleting row:', error.message);
        }
    };

    useEffect(() => {
        if (selectedTable) {
            fetchTableData();
        }
    }, [selectedTable, fetchTableData]); // Added fetchTableData as a dependency

    return (
        <div className="admin-container">
            <AdminNavbar />
            <h2>Admin Table Management</h2>

            <div className="toolbar">
                <select value={selectedTable} onChange={handleTableChange}>
                    <option value="">Select a table</option>
                    {Object.keys(tableOptions).map((table) => (
                        <option key={table} value={table}>{table}</option>
                    ))}
                </select>

                <div className="tabs">
                    <button
                        className={activeTab === 'insert' ? 'active' : ''}
                        onClick={() => setActiveTab('insert')}
                    >
                        Insert
                    </button>
                    <button
                        className={activeTab === 'delete' ? 'active' : ''}
                        onClick={() => setActiveTab('delete')}
                    >
                        Delete
                    </button>
                </div>

                {activeTab === 'insert' && (
                    <form className="insert-form" onSubmit={handleInsert}>
                        {columns.map((field) => (
                            <input
                                key={field}
                                type="text"
                                name={field}
                                placeholder={field}
                                value={formData[field] || ''}
                                onChange={handleInputChange}
                            />
                        ))}
                        <button type="submit">Insert</button>
                    </form>
                )}
            </div>

            <div className="table-container">
                {selectedTable && columns.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                {columns.map((col) => (
                                    <th key={col}>{col}</th>
                                ))}
                                {activeTab === 'delete' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {columns.map((col) => (
                                        <td key={`${rowIndex}-${col}`}>{row[col]}</td>
                                    ))}
                                    {activeTab === 'delete' && (
                                        <td>
                                            <button onClick={() => handleDeleteRow(row)}>Delete</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>{selectedTable ? 'No data available for this table.' : 'Please select a table.'}</p>
                )}
            </div>
        </div>
    );
};

export default AdminTableManip;
