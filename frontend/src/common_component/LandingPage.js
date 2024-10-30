import React, { useState, useEffect } from 'react';
import Navbar from "./Navbar";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import dowData from './chart_data/dow_data_json.json';
import nasdaqData from './chart_data/nasdaq_j.json';
import sp500Data from './chart_data/snp500_j.json';
import applData from './chart_data/apple_clean.json'
import './styling/LandingPage.css';
import { format, subMonths, subDays } from 'date-fns';

const LandingPage = () => {
    const [news, setNews] = useState([]);
    const [selectedChart, setSelectedChart] = useState('DOW'); // Default to DOW
    const [dateRange, setDateRange] = useState('6months'); // Default to 6 months

    // Fetch chart data based on selected chart
    const originalData = {
        'DOW': dowData,
        'NASDAQ': nasdaqData,
        'S&P500': sp500Data,
        'APPL': applData
    }[selectedChart].slice().reverse();

    // Filter data based on selected date range
    const filteredData = originalData.filter(({ date }) => {
        const parsedDate = new Date(date);
        const today = new Date();

        switch (dateRange) {
            case '15days':
                return parsedDate >= subDays(today, 15);
            case '1month':
                return parsedDate >= subMonths(today, 1);
            case '6months':
                return parsedDate >= subMonths(today, 6);
            case '1year':
                return parsedDate >= subMonths(today, 12);
            case 'all':
            default:
                return true;
        }
    });

    const formatTick = (dateString) => {
        return format(new Date(dateString), 'yyyy-MM');
    };

    useEffect(() => {
        fetch(`https://newsapi.org/v2/top-headlines?category=business&language=en&apiKey=${process.env.REACT_APP_NEWS_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    setNews(data.articles.slice(0, 10)); // Limit to 10 articles
                }
            })
            .catch(error => console.error('Error fetching news:', error));
    }, []);

    return (
        <div className="landing-page">
            <Navbar />
            <h1>Welcome to Mock the Stock</h1>
            <div className="content">
                {/* News Sidebar */}
                <div className="news-sidebar">
                    <h2>Today's Headlines</h2>
                    <hr className="headline-separator" />
                    {news.map((article, index) => (
                        <div key={index} className="news-item">
                            <h3>
                                <a href={article.url} target="_blank" rel="noopener noreferrer">
                                    {article.title}
                                </a>
                            </h3>
                            {article.urlToImage && (
                                <a href={article.url} target="_blank" rel="noopener noreferrer">
                                    <img src={article.urlToImage} alt="news preview" />
                                </a>
                            )}
                            <hr className="news-separator" />
                        </div>
                    ))}
                </div>

                {/* Chart Section */}
                <div className="chart-section">
                    <h2>{selectedChart}</h2>

                    {/* Chart Selection Buttons and Date Range Dropdown */}
                    <div className="chart-controls">
                        <div className="chart-buttons">
                            <button onClick={() => setSelectedChart('DOW')}>DOW</button>
                            <button onClick={() => setSelectedChart('NASDAQ')}>NASDAQ</button>
                            <button onClick={() => setSelectedChart('S&P500')}>S&P500</button>
                            <button onClick={() => setSelectedChart('APPL')}>Apple</button>
                        </div>

                        <select
                            className="date-range-selector"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="15days">Last 15 Days</option>
                            <option value="1month">Last 1 Month</option>
                            <option value="6months">Last 6 Months</option>
                            <option value="1year">Last 1 Year</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>

                    {/* Responsive Chart Container */}
                    <ResponsiveContainer width="100%" height={600}>
                        <LineChart data={filteredData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatTick}
                            />
                            <YAxis domain={['dataMin', 'auto']} />
                            <Tooltip />
                            <Line type="natural" dataKey="Close" stroke="#8884d8" strokeWidth={1} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;