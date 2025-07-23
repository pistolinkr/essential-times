import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { categoriesAPI } from '../utils/api';
import './Header.css';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="container">
          <div className="header-top-content">
            <div className="header-left">
              <Link to="/" className="logo">
                <h1>Essential Times</h1>
              </Link>
            </div>
            <div className="header-right">
              {user ? (
                <div className="user-menu">
                  <span className="user-name">
                    {user.role === 'admin' ? '관리자' : user.name}님 환영합니다
                  </span>
                  {user.role === 'reporter' && (
                    <Link to="/reporter" className="btn btn-primary">
                      기자 페이지
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" className="btn btn-primary">
                      관리자 페이지
                    </Link>
                  )}
                  <button onClick={handleLogout} className="btn btn-secondary">
                    로그아웃
                  </button>
                </div>
              ) : (
                location.pathname !== '/login' && (
                  <Link to="/login" className="btn btn-primary">
                    로그인
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      <nav className="header-nav">
        <div className="container">
          <ul className="nav-menu">
            <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>홈</Link></li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link 
                  to={`/category/${category.slug}`}
                  className={location.pathname === `/category/${category.slug}` ? 'active' : ''}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header; 