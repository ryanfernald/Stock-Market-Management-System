import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import '../News.css';

const categories = [
    { name: 'Business', value: 'business' },
    { name: 'Entertainment', value: 'entertainment' },
    { name: 'General', value: 'general' },
    { name: 'Health', value: 'health' },
    { name: 'Science', value: 'science' },
    { name: 'Sports', value: 'sports' },
    { name: 'Technology', value: 'technology' }
];

const News = () => {
    const [selectedCategory, setSelectedCategory] = useState('business'); // Default to Business
    const [articles, setArticles] = useState([]);
    
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
    
    
    // Update the search functionality
    const handleSearch = (event) => {
        event.preventDefault();
        const searchTerm = document.querySelector('.search-input').value;
        fetchNews(selectedCategory, searchTerm);  // Pass the query to fetchNews
    };

    const [currentArticle, setCurrentArticle] = useState(null);  // State to hold selected article

    const handleArticleClick = (article) => {
        setCurrentArticle(article);  // Set the clicked article to be displayed
    };


    return (
        <div>
            <Navbar />
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
                                <li key={index} onClick={() => handleArticleClick(article)}>
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

    )

export default News;

