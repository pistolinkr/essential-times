import React from 'react';
import { Link } from 'react-router-dom';
import './ArticleCard.css';

const ArticleCard = ({ article }) => {
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

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="article-card">
      <div className="article-content">
        <div className="article-main">
          <h3 className="article-title">
            <Link to={`/article/${article.id}`}>
              {article.title}
            </Link>
          </h3>
          <p className="article-excerpt">
            {truncateText(article.content)}
          </p>
          <div className="article-meta">
            <span className="article-author">{article.author_name}</span>
            <span className="article-date">{formatDate(article.created_at)}</span>
            {article.category_name && (
              <span className="article-category">{article.category_name}</span>
            )}
          </div>
        </div>
        {article.image_url && (
          <div className="article-image">
            <img 
              src={`http://localhost:5001${article.image_url}`} 
              alt={article.title}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleCard; 