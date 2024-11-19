import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import UserNavbar from "./UserNavBar";
import "./styling/UserMoveMoney.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const UserMoveMoney = () => {
    const [tab, setTab] = useState("deposit");
    const [balance, setBalance] = useState({
        net_balance: 0,
        net_market_orders: 0,
        total_deposit: 0,
        total_withdraw: 0,
     })
    const [amount, setAmount] = useState("");
    const [searchParams] = useSearchParams();
    const userId = localStorage.getItem("uid"); // Replace this with dynamic user ID

    // Fetch user balance
    useEffect(() => {
        fetch(`http://127.0.0.1:5000/user_b/balance/${userId}`)
            .then((response) => {
                console.log(response); // Log raw response
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log(data); // Log parsed JSON
                if (data !== undefined) {
                    setBalance({
                        net_balance: data.net_balance || 0,
                        net_market_orders: data.net_market_orders || 0,
                        total_deposit: data.total_deposit || 0,
                        total_withdraw: data.total_withdraw || 0,
                     });
                } else {
                    console.error("Invalid data format:", data);
                }
            })
            .catch((error) => console.error("Error fetching balance:", error));
    }, []);

    // Handle deposit or withdraw
    const handleAction = (type) => {
        if (!amount || parseFloat(amount) <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        if (type === "withdraw" && parseFloat(amount) > balance.net_balance) {
            alert("Insufficient balance for this withdrawal.");
            return;
        }

        if (type === "withdraw") {
            setTab("withdraw");
        }
    
        fetch(`http://127.0.0.1:5000/user_b/${type}_funds/${userId}/${amount}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if (data.status === "success") {
                    alert(data.message);
                    // Fetch updated balance from the server
                    return fetch(`http://127.0.0.1:5000/user_b/balance/${userId}`);
                } else {
                    throw new Error(data.message || "An error occurred.");
                }
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((updatedBalanceData) => {
                console.log("Updated balance data:", updatedBalanceData);
                if (updatedBalanceData.balance !== undefined) {
                    setBalance(updatedBalanceData);
                } else {
                    console.error("Invalid updated balance format:", updatedBalanceData);
                }
                setAmount("");
            })
            .catch((error) => console.error("Error:", error));
    };

    // New function to handle withdrawals
const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) {
        alert("Please enter a valid withdrawal amount.");
        return;
    }

    fetch(`http://127.0.0.1:5000/user_b/withdraw_funds/${userId}/${amount}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            if (data.status === "success") {
                alert(data.message);
                // Fetch the updated balance
                return fetch(`http://127.0.0.1:5000/user_b/balance/${userId}`);
            } else {
                throw new Error(data.message || "An error occurred.");
            }
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((updatedBalanceData) => {
            console.log("Updated balance data after withdrawal:", updatedBalanceData);
            if (updatedBalanceData.net_balance !== undefined) {
                setBalance(updatedBalanceData);
            } else {
                console.error("Invalid updated balance format:", updatedBalanceData);
            }
            setAmount("");
        })
        .catch((error) => console.error("Error during withdrawal:", error));
};

    // Determine tab to display
    useEffect(() => {
        const currentTab = searchParams.get("tab");
        if (currentTab === "withdraw") {
            setTab("withdraw");
        }
    }, [searchParams]);

    return (
        <>
            <UserNavbar />
            <div className="user-move-money">
                <div className="tabs">
                    <button
                        className={`tab ${tab === "deposit" ? "active" : ""}`}
                        onClick={() => setTab("deposit")}
                    >
                        Deposit
                    </button>
                    <button
                        className={`tab ${tab === "withdraw" ? "active" : ""}`}
                        onClick={() => setTab("withdraw")}
                    >
                        Withdraw
                    </button>
                </div>
                <div className="tab-content">
                    {tab === "deposit" ? (
                        <>
                            <div id="balance-details">
                                <p>Net Balance: ${balance.net_balance.toFixed(2)}</p>
                                <p>Total Deposits: ${balance.total_deposit.toFixed(2)}</p>
                                <p>Total Withdrawals: ${balance.total_withdraw.toFixed(2)}</p>
                                <p>Net Market Orders: ${balance.net_market_orders.toFixed(2)}</p>
                            </div>
                            <input
                                type="number"
                                placeholder="Enter deposit amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <button onClick={() => handleAction("add")}>Deposit</button>
                        </>
                    ) : (
                        <>
                            <div id="balance-details">
                                <p>Net Balance: ${balance.net_balance.toFixed(2)}</p>
                                <p>Total Deposits: ${balance.total_deposit.toFixed(2)}</p>
                                <p>Total Withdrawals: ${balance.total_withdraw.toFixed(2)}</p>
                                <p>Net Market Orders: ${balance.net_market_orders.toFixed(2)}</p>
                            </div>
                            <input
                                type="number"
                                placeholder="Enter withdrawal amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <button onClick={handleWithdraw}>Withdraw</button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserMoveMoney;