import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import { categoriesAPI } from '../utils/api';
import './CategoryPage.css';

const CategoryPage = () => {
  const { slug } = useParams();
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    fetchCategoryArticles();
  }, [slug]);

  const fetchCategoryArticles = async (page = 1) => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getArticlesByCategory(slug, page, 10);
      setArticles(response.data.articles);
      setPagination(response.data.pagination);
      
      // Get category info from first article or fetch separately
      if (response.data.articles.length > 0) {
        setCategory({ name: response.data.articles[0].category_name, slug });
      }
    } catch (err) {
      setError('기사를 불러오는 중 오류가 발생했습니다.');
      console.error('Error fetching category articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    fetchCategoryArticles(page);
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
    <div className="category-page">
      <div className="container">
        <div className="category-header">
          <h1>{category?.name || '카테고리'}</h1>
          <p>{category?.name} 관련 최신 뉴스를 확인하세요</p>
        </div>

        <div className="articles-section">
          {articles.length === 0 ? (
            <div className="no-articles">
              <p>이 카테고리에 등록된 기사가 없습니다.</p>
              <Link to="/" className="btn btn-primary">
                홈으로 돌아가기
              </Link>
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

export default CategoryPage; 