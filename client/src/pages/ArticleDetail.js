import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articlesAPI } from '../utils/api';
import './ArticleDetail.css';

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await articlesAPI.getById(id);
      setArticle(response.data);
    } catch (err) {
      setError('기사를 불러오는 중 오류가 발생했습니다.');
      console.error('Error fetching article:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">기사를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container">
        <div className="error-container">
          <h2>기사를 찾을 수 없습니다</h2>
          <p>{error || '요청하신 기사가 존재하지 않습니다.'}</p>
          <Link to="/" className="btn btn-primary">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="article-detail">
      <div className="container">
        <div className="article-header">
          <Link to="/" className="back-link">
            ← 홈으로 돌아가기
          </Link>
        </div>

        <article className="article-content">
          <header className="article-header-content">
            <h1 className="article-title">{article.title}</h1>
            <div className="article-meta">
              <span className="article-author">기자: {article.author_name}</span>
              <span className="article-date">{formatDate(article.created_at)}</span>
            </div>
          </header>

          {article.image_url && (
            <div className="article-image-container">
              <img
                src={`http://localhost:5001${article.image_url}`}
                alt={article.title}
                className="article-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="article-body">
            {article.content.split('\n').map((paragraph, index) => (
              <p key={index} className="article-paragraph">
                {paragraph}
              </p>
            ))}
          </div>

          <footer className="article-footer">
            <div className="article-tags">
              <span className="tag">Essential Times</span>
              <span className="tag">뉴스</span>
            </div>
          </footer>
        </article>

        <div className="related-articles">
          <h3>관련 기사</h3>
          <p>더 많은 기사를 확인하려면 <Link to="/">홈페이지</Link>를 방문하세요.</p>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail; 