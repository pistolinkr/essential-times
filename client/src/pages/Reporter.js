import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI, categoriesAPI } from '../utils/api';
import './Reporter.css';

const Reporter = ({ user }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    image: null
  });

  useEffect(() => {
    fetchMyArticles();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchMyArticles = async () => {
    try {
      setLoading(true);
      const response = await articlesAPI.getMyArticles();
      setArticles(response.data);
    } catch (err) {
      setError('기사를 불러오는 중 오류가 발생했습니다.');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      if (editingArticle) {
        await articlesAPI.update(editingArticle.id, formData);
        setError('');
      } else {
        await articlesAPI.create(formData);
        setError('');
      }
      
      setFormData({ title: '', content: '', image: null });
      setShowCreateForm(false);
      setEditingArticle(null);
      fetchMyArticles();
    } catch (err) {
      setError(err.response?.data?.error || '기사 저장 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      category_id: article.category_id || '',
      image: null
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말로 이 기사를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await articlesAPI.delete(id);
      fetchMyArticles();
    } catch (err) {
      setError('기사 삭제 중 오류가 발생했습니다.');
    }
  };

  const cancelEdit = () => {
    setFormData({ title: '', content: '', category_id: '', image: null });
    setShowCreateForm(false);
    setEditingArticle(null);
    setError('');
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

  return (
    <div className="reporter-page">
      <div className="container">
        <div className="reporter-header">
          <h1>기자 페이지</h1>
          <p>{user.name}님, 기사를 작성하고 관리하세요</p>
        </div>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <div className="reporter-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            새 기사 작성
          </button>
        </div>

        {showCreateForm && (
          <div className="article-form-container">
            <div className="card">
              <h2>{editingArticle ? '기사 수정' : '새 기사 작성'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="title">제목</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="content">내용</label>
                  <textarea
                    id="content"
                    name="content"
                    className="form-control"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows="10"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category_id">카테고리</label>
                  <select
                    id="category_id"
                    name="category_id"
                    className="form-control"
                    value={formData.category_id}
                    onChange={handleInputChange}
                  >
                    <option value="">카테고리 선택</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="image">이미지 (선택사항)</label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    className="form-control"
                    onChange={handleInputChange}
                    accept="image/*"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingArticle ? '수정하기' : '작성하기'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cancelEdit}
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="my-articles">
          <h2>내 기사 목록</h2>
          {articles.length === 0 ? (
            <div className="no-articles">
              <p>작성한 기사가 없습니다.</p>
            </div>
          ) : (
            <div className="articles-list">
              {articles.map((article) => (
                <div key={article.id} className="article-item">
                  <div className="article-info">
                    <h3>{article.title}</h3>
                    <p className="article-excerpt">
                      {article.content.length > 100
                        ? article.content.substring(0, 100) + '...'
                        : article.content}
                    </p>
                    <div className="article-meta">
                      <span>작성일: {formatDate(article.created_at)}</span>
                      {article.image_url && (
                        <span className="has-image">이미지 포함</span>
                      )}
                    </div>
                  </div>
                  <div className="article-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEdit(article)}
                    >
                      수정
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(article.id)}
                    >
                      삭제
                    </button>
                    <Link
                      to={`/article/${article.id}`}
                      className="btn btn-primary"
                    >
                      보기
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reporter; 