import React, { useState, useEffect } from 'react';
import './styling/News.css';
import UserNavbar from './UserNavBar';

const categories = [
    { name: 'Business', value: 'business' },
    { name: 'Entertainment', value: 'entertainment' },
    { name: 'General', value: 'general' },
    { name: 'Health', value: 'health' },
    { name: 'Science', value: 'science' },
    { name: 'Sports', value: 'sports' },
    { name: 'Technology', value: 'technology' }
];

const NewsLoggedIn = () => {
    const [selectedCategory, setSelectedCategory] = useState('business'); // Default to Business
    const [articles, setArticles] = useState([]);
    const [currentArticle, setCurrentArticle] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchNews(selectedCategory);
    }, [selectedCategory]);

    const fetchNews = (category, query = '') => {
        const apiKey = process.env.REACT_APP_NEWS_API_KEY;
        let url = `https://newsapi.org/v2/top-headlines?category=${category}&language=en&apiKey=${apiKey}`;
        if (query) {
            url = `https://newsapi.org/v2/everything?q=${query}&language=en&apiKey=${apiKey}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    const filteredArticles = data.articles.filter(article => article.title !== '[Removed]');
                    setArticles(filteredArticles);
                    if (filteredArticles.length > 0) {
                        setCurrentArticle(filteredArticles[0]);  // Automatically select the first article
                    }
                }
            })
            .catch(error => console.error('Error fetching news:', error));
    };


    // Load saved search query from sessionStorage on initial load
    useEffect(() => {
        const savedQuery = sessionStorage.getItem("newsSearchQuery");
        if (savedQuery) {
        setSearchTerm(savedQuery);  // Set search input to saved query
        fetchNews(selectedCategory, savedQuery);  // Automatically search with the saved query
        sessionStorage.removeItem("newsSearchQuery");  // Clear after loading
        }
    }, [selectedCategory]);

    // Update search term on input change
    const handleSearchInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = (event) => {
        event.preventDefault();
        fetchNews(selectedCategory, searchTerm);
    };

    return (
        <div>


            <UserNavbar />
            <div className='container'>

                <h1 className="news-header">News</h1>

                {/* Category Navbar */}
                <div className="category-navbar">
                    {categories.map((category) => (
                        <button
                            key={category.value}
                            className={`category-button ${selectedCategory === category.value ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category.value)}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                <hr className="separator" />

                <div className="news-content">
                    {/* Sidebar with Articles */}
                    <div className="news-sidebar">
                        <form className="search-form" onSubmit={handleSearch}>
                            <input type="text" className="search-input" placeholder="Search for news..." />
                            <button className="search-button" type="submit">Search</button>
                            <ul className="news-list">
                                {articles.map((article, index) => (
                                    <li key={index} onClick={() => setCurrentArticle(article)}>
                                        {article.title}
                                    </li>
                                ))}
                            </ul>
                        </form>
                    </div>

                    {/* Preview section */}
                    <div className="news-preview">
                        {currentArticle ? (
                            <div>
                                <h2>{currentArticle.title}</h2>
                                {currentArticle.urlToImage && <img src={currentArticle.urlToImage} alt="News preview" />}
                                <p>{currentArticle.description}</p>
                                <a href={currentArticle.url} target="_blank" rel="noopener noreferrer">Read more</a>
                            </div>
                        ) : (
                            articles.length > 0 && (
                                <div>
                                    <h2>{articles[0].title}</h2>
                                    {articles[0].urlToImage && <img src={articles[0].urlToImage} alt="News preview" />}
                                    <p>{articles[0].description}</p>
                                    <a href={articles[0].url} target="_blank" rel="noopener noreferrer">Read more</a>
                                </div>
                            )
                        )}
                    </div>

                </div>
            </div>
        </div>

    )
}

export default NewsLoggedIn;

