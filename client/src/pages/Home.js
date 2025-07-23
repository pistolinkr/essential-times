import React, { useState, useEffect } from 'react';
import ArticleCard from '../components/ArticleCard';
import { articlesAPI } from '../utils/api';
import './Home.css';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async (page = 1) => {
    try {
      setLoading(true);
      const response = await articlesAPI.getAll(page, 10);
      setArticles(response.data.articles);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('기사를 불러오는 중 오류가 발생했습니다.');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    fetchArticles(page);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">기사를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="container">
        <div className="home-header">
          <h1>Essential Times</h1>
          <p>신뢰할 수 있는 뉴스와 정보를 제공합니다</p>
        </div>

        <div className="articles-section">
          <h2>최신 뉴스</h2>
          {articles.length === 0 ? (
            <div className="no-articles">
              <p>등록된 기사가 없습니다.</p>
            </div>
          ) : (
            <div className="articles-grid">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>

        {articles.length > 0 && (
          <div className="pagination">
            {pagination.hasPrev && (
              <button 
                className="btn btn-secondary"
                onClick={() => handlePageChange(pagination.current - 1)}
              >
                이전
              </button>
            )}
            
            <span className="page-info">
              {pagination.current} / {pagination.total}
            </span>
            
            {pagination.hasNext && (
              <button 
                className="btn btn-secondary"
                onClick={() => handlePageChange(pagination.current + 1)}
              >
                다음
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 