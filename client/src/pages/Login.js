import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import './Login.css';

const Login = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('user-login'); // 'user-login', 'reporter-login', 'register'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      onLogin(user);
      
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'reporter') {
        navigate('/reporter');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authAPI.register(formData);
      setSuccess('회원가입이 완료되었습니다! 로그인해주세요.');
      setActiveTab('user-login');
      setFormData({ email: '', password: '', name: '', role: 'user' });
    } catch (err) {
      setError(err.response?.data?.error || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
    setFormData({ email: '', password: '', name: '', role: 'user' });
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="login-form">
      {error && <div className="alert alert-error">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="email">이메일</label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-control"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="이메일을 입력하세요"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">비밀번호</label>
        <input
          type="password"
          id="password"
          name="password"
          className="form-control"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary login-btn"
        disabled={loading}
      >
        {loading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="login-form">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="form-group">
        <label htmlFor="name">이름</label>
        <input
          type="text"
          id="name"
          name="name"
          className="form-control"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="이름을 입력하세요"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">이메일</label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-control"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="이메일을 입력하세요"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">비밀번호</label>
        <input
          type="password"
          id="password"
          name="password"
          className="form-control"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      <div className="form-group">
        <label htmlFor="role">회원 유형</label>
        <select
          id="role"
          name="role"
          className="form-control"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="user">일반 사용자</option>
          <option value="reporter">기자</option>
        </select>
      </div>

      <button
        type="submit"
        className="btn btn-primary login-btn"
        disabled={loading}
      >
        {loading ? '회원가입 중...' : '회원가입'}
      </button>
    </form>
  );

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-container">
          <div className="login-header">
            <h1>Essential Times</h1>
            <p>로그인하여 기사 관리 시스템에 접속하세요</p>
          </div>

          <div className="login-tabs">
            <button
              className={`tab-button ${activeTab === 'user-login' ? 'active' : ''}`}
              onClick={() => handleTabChange('user-login')}
            >
              일반 사용자 로그인
            </button>
            <button
              className={`tab-button ${activeTab === 'reporter-login' ? 'active' : ''}`}
              onClick={() => handleTabChange('reporter-login')}
            >
              기자 로그인
            </button>
            <button
              className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => handleTabChange('register')}
            >
              회원가입
            </button>
          </div>

          <div className="login-form-container">
            {activeTab === 'register' ? renderRegisterForm() : renderLoginForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 