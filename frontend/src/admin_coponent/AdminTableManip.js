import React, { useState, useEffect } from 'react';
import AdminNavbar from './admin_nav.js'; // Import Admin Navbar
import './styling/AdminTableManip.css';

const AdminTableManip = () => {
    const [selectedTable, setSelectedTable] = useState('');
    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [activeTab, setActiveTab] = useState('delete'); // Default to deletion mode
    const [formData, setFormData] = useState({}); // For insertion

    const tableOptions = {
        'User': ['user_id', 'first_name', 'last_name', 'email'],
        'Stock': ['ticker_symbol', 'sector_id'],
        'MarketOrder': ['order_id', 'user_id', 'ticker_symbol', 'price_purchased', 'quantity', 'purchase_date', 'order_type'],
        'FundsDeposit': ['deposit_id', 'user_id', 'amount', 'time_initiated', 'cleared'],
        'FundsWithdraw': ['withdraw_id', 'user_id', 'amount', 'time_initiated', 'cleared'],
        'StockPrice': ['ticker_symbol', 'price', 'time_posted'],
    };

    // Fetch table data from backend
    const fetchTableData = async () => {
        if (!selectedTable) return;
    
        try {
            const response = await fetch(`http://127.0.0.1:5000/fetch_table?tableName=${selectedTable}`);
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    setColumns(Object.keys(data[0]));
                    setTableData(data);
                } else {
                    setColumns([]);
                    setTableData([]);
                }
            } else {
                const error = await response.json();
                alert(error.error || 'Error fetching table data');
            }
        } catch (error) {
            console.error('Error fetching table data:', error.message);
        }
    };

    // Handle table selection
    const handleTableChange = (e) => {
        const table = e.target.value;
        setSelectedTable(table);
        setFormData({});
        fetchTableData(); // Fetch data when table changes
    };

    // Handle insertion input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    // Submit new data to backend
    const handleInsert = async (e) => {
        e.preventDefault();

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

    // Delete row from backend
    const handleDeleteRow = async (row) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete this row?`);
        if (!confirmDelete) return;

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

    // Automatically fetch data when the table is selected
    useEffect(() => {
        if (selectedTable) {
            fetchTableData();
        }
    }, [selectedTable]);

    return (
        <div className='admin-container'>
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
                        {selectedTable && tableOptions[selectedTable].map((field) => (
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
