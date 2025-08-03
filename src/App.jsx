import React, { useState, useEffect, createContext, useContext } from 'react';

// API Configuration
const API_BASE_URL = 'http://localhost:5000'; // Replace with your actual API URL

// API helper functions
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Network error occurred');
  }
};

// CSS Styles
const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f5f5f5;
    color: #333;
    line-height: 1.6;
  }

  .app {
    min-height: 100vh;
  }

  /* Loading Spinner */
  .loading-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
  }

  .loading-content {
    text-align: center;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 2px solid #e5e5e5;
    border-top: 2px solid #0066cc;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-text {
    margin-top: 16px;
    color: #666;
  }

  /* Navbar Styles */
  .navbar {
    background-color: #0066cc;
    color: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .navbar-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
  }

  .navbar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 64px;
  }

  .navbar-brand {
    font-size: 20px;
    font-weight: bold;
  }

  .navbar-nav {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .navbar-link {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 8px 0;
    transition: color 0.2s;
  }

  .navbar-link:hover {
    color: #cce7ff;
  }

  .navbar-link.active {
    color: #cce7ff;
    font-weight: 600;
  }

  .navbar-user {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .navbar-welcome {
    font-size: 14px;
  }

  .logout-btn {
    background-color: #0052a3;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .logout-btn:hover {
    background-color: #003d7a;
  }

  /* Auth Pages */
  .auth-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 48px 24px;
  }

  .auth-header {
    text-align: center;
    max-width: 400px;
    margin: 0 auto;
    width: 100%;
  }

  .auth-title {
    margin-top: 24px;
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }

  .auth-subtitle {
    margin-top: 8px;
    font-size: 14px;
    color: #666;
  }

  .auth-link {
    color: #0066cc;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 500;
  }

  .auth-link:hover {
    color: #0052a3;
  }

  .auth-form-container {
    margin-top: 32px;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
  }

  .auth-form {
    background: white;
    padding: 32px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-radius: 8px;
  }

  .form-group {
    margin-bottom: 24px;
  }

  .form-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
  }

  .form-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.2s;
  }

  .form-input:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
  }

  .form-textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  .form-textarea:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
  }

  .btn-primary {
    width: 100%;
    background-color: #0066cc;
    color: white;
    border: none;
    padding: 12px 16px;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .btn-primary:hover:not(:disabled) {
    background-color: #0052a3;
  }

  .btn-primary:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .error-message {
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 12px 16px;
    border-radius: 4px;
    margin-bottom: 16px;
  }

  /* Main Content */
  .main-container {
    min-height: 100vh;
    background-color: #f5f5f5;
  }

  .content-wrapper {
    max-width: 800px;
    margin: 0 auto;
    padding: 32px 16px;
  }

  .page-title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 24px;
  }

  /* Post Card */
  .post-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 24px;
    margin-bottom: 16px;
    border: 1px solid #e5e5e5;
  }

  .post-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }

  .post-avatar {
    width: 40px;
    height: 40px;
    background-color: #0066cc;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    margin-right: 12px;
  }

  .post-author-info h3 {
    font-weight: 600;
    color: #333;
    margin-bottom: 2px;
  }

  .post-date {
    font-size: 12px;
    color: #666;
  }

  .post-content {
    color: #444;
    line-height: 1.6;
  }

  /* Create Post Form */
  .create-post-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 24px;
    margin-bottom: 24px;
  }

  .create-post-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .create-post-actions {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

  .btn-post {
    background-color: #0066cc;
    color: white;
    border: none;
    padding: 8px 24px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .btn-post:hover:not(:disabled) {
    background-color: #0052a3;
  }

  .btn-post:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  /* Profile Page */
  .profile-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 32px 16px;
  }

  .profile-header {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 24px;
    margin-bottom: 24px;
  }

  .profile-info {
    display: flex;
    align-items: center;
  }

  .profile-avatar {
    width: 80px;
    height: 80px;
    background-color: #0066cc;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    font-weight: bold;
    margin-right: 24px;
  }

  .profile-details h1 {
    font-size: 28px;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
  }

  .profile-email {
    color: #666;
    margin-bottom: 12px;
  }

  .profile-bio {
    color: #444;
    max-width: 600px;
    line-height: 1.6;
  }

  .profile-posts {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 24px;
  }

  .posts-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 24px;
  }

  .no-posts {
    text-align: center;
    padding: 32px;
  }

  .no-posts p {
    color: #666;
    margin-bottom: 8px;
  }

  .no-posts-link {
    color: #0066cc;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 500;
  }

  .no-posts-link:hover {
    color: #0052a3;
  }

  .posts-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .navbar-nav {
      gap: 16px;
    }

    .navbar-user {
      gap: 12px;
    }

    .navbar-welcome {
      display: none;
    }

    .content-wrapper {
      padding: 16px;
    }

    .profile-container {
      padding: 16px;
    }

    .profile-info {
      flex-direction: column;
      text-align: center;
    }

    .profile-avatar {
      margin-right: 0;
      margin-bottom: 16px;
    }

    .auth-form-container {
      padding: 0 16px;
    }
  }

  @media (max-width: 480px) {
    .auth-form {
      padding: 24px 16px;
    }

    .post-card {
      padding: 16px;
    }

    .create-post-container {
      padding: 16px;
    }
  }
`;

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Navigation State Management
const useNavigation = () => {
  const [currentPage, setCurrentPage] = useState(() => {
    const stored = sessionStorage.getItem('currentPage');
    return stored || 'home';
  });

  const navigate = (page) => {
    setCurrentPage(page);
    sessionStorage.setItem('currentPage', page);
  };

  return { currentPage, navigate };
};

// Navbar Component
const Navbar = ({ onNavigate, currentPage }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          <div>
            <h1 className="navbar-brand">Mini LinkedIn</h1>
          </div>
          
          <div className="navbar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`navbar-link ${currentPage === item.id ? 'active' : ''}`}
              >
                {item.label}
              </button>
            ))}
            <div className="navbar-user">
              <span className="navbar-welcome">Welcome, {user?.name}!</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// PostCard Component
const PostCard = ({ post }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (

    

    <div className="post-card">
      <div className="post-header">
        <div className="post-avatar">
          {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="post-author-info">
          <h3>{post.author?.name || 'Unknown User'}</h3>
          <p className="post-date">{formatDate(post.createdAt)}</p>
        </div>
      </div>
      
      <div className="post-content">
        {post.content}
      </div>
    </div>
  );
};

// Login Page
const Login = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiCall('/api/auth/login', {
        method: 'POST',
        body: formData,
      });
      
      const { user, token } = response;
      login(user, token);
      onNavigate('home');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2 className="auth-title">Sign in to Mini LinkedIn</h2>
        <p className="auth-subtitle">
          Don't have an account?{' '}
          <button 
            onClick={() => onNavigate('register')}
            className="auth-link"
          >
            Register here
          </button>
        </p>
      </div>

      <div className="auth-form-container">
        <div className="auth-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Register Page
const Register = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiCall('/api/auth/register', {
        method: 'POST',
        body: formData,
      });
      
      const { user, token } = response;
      login(user, token);
      onNavigate('home');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2 className="auth-title">Join Mini LinkedIn</h2>
        <p className="auth-subtitle">
          Already have an account?{' '}
          <button 
            onClick={() => onNavigate('login')}
            className="auth-link"
          >
            Sign in here
          </button>
        </p>
      </div>

      <div className="auth-form-container">
        <div className="auth-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio" className="form-label">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              className="form-textarea"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Home Page
const Home = ({ onNavigate }) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  // Fetch all posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await apiCall('/api/posts');
      setPosts(response);
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setPosting(true);
    try {
      const response = await apiCall('/api/posts', {
        method: 'POST',
        body: { content: newPost },
      });
      setPosts([response, ...posts]); // Add new post to the beginning
      setNewPost('');
    } catch (err) {
      setError('Failed to create post');
      console.error('Error creating post:', err);
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="main-container">
        <Navbar onNavigate={onNavigate} currentPage="home" />
        <div className="content-wrapper">
          <div className="loading-content">
            <div className="spinner"></div>
            <p className="loading-text">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <Navbar onNavigate={onNavigate} currentPage="home" />
      
      <div className="content-wrapper">
        <h1 className="page-title">Home Feed</h1>
        
        {/* Create Post Form */}
        <div className="create-post-container">
          <h2 className="create-post-title">What's on your mind?</h2>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your thoughts..."
            className="form-textarea"
            rows="3"
            required
          />
          <div className="create-post-actions">
            <button
              onClick={handleCreatePost}
              disabled={posting || !newPost.trim()}
              className="btn-post"
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Posts Feed */}
        <div>
          {posts.length === 0 ? (
            <div className="post-card">
              <div className="no-posts">
                <p>No posts yet. Be the first to share something!</p>
              </div>
            </div>
          ) : (
            posts.map((post, index) => (
              <PostCard key={post.id || post._id || index} post={post} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Profile Page
const Profile = ({ onNavigate }) => {
  const { user } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const response = await apiCall(`/api/posts/user/${user.id}`);
      setUserPosts(response);
    } catch (err) {
      setError('Failed to fetch your posts');
      console.error('Error fetching user posts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main-container">
        <Navbar onNavigate={onNavigate} currentPage="profile" />
        <div className="profile-container">
          <div className="loading-content">
            <div className="spinner"></div>
            <p className="loading-text">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <Navbar onNavigate={onNavigate} currentPage="profile" />
      
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-info">
            <div className="profile-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="profile-details">
              <h1>{user?.name}</h1>
              <p className="profile-email">{user?.email}</p>
              {user?.bio && (
                <p className="profile-bio">{user.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Posts Section */}

        

        <div className="profile-posts">
          <h2 className="posts-title">My Posts ({userPosts.length})</h2>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {userPosts.length === 0 ? (
            <div className="no-posts">
              <p>You haven't posted anything yet.</p>
              <button 
                onClick={() => onNavigate('home')}
                className="no-posts-link"
              >
                Create your first post →
              </button>
            </div>
          ) : (
            <div className="posts-list">
              {userPosts.map((post, index) => (
                <PostCard key={post.id || post._id || index} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Router Component
const AppRouter = () => {
  const { currentPage, navigate } = useNavigation();
  const { isAuthenticated } = useAuth();

  // Determine which page to show
  const getCurrentPage = () => {
    if (!isAuthenticated) {
      return currentPage === 'register' ? 'register' : 'login';
    }
    return currentPage === 'profile' ? 'profile' : 'home';
  };

  const renderPage = () => {
    const page = getCurrentPage();
    
    switch (page) {
      case 'login':
        return <Login onNavigate={navigate} />;
      case 'register':
        return <Register onNavigate={navigate} />;
      case 'home':
        return <Home onNavigate={navigate} />;
      case 'profile':
        return <Profile onNavigate={navigate} />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="app">
      <style>{styles}</style>
      {renderPage()}
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;