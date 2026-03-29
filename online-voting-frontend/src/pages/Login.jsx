import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/signin' : '/api/auth/signup';
      const payload = isLogin
        ? { username: formData.username, password: formData.password }
        : formData;

      const response = await axios.post(endpoint, payload);

      if (isLogin) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));

        if (response.data.role === 'ROLE_VOTER' && !response.data.profileCompleted) {
          navigate('/complete-profile');
        } else if (response.data.role === 'ROLE_ADMINISTRATOR') {
          navigate('/admin');
        } else if (response.data.role === 'ROLE_OFFICER') {
          navigate('/officer');
        } else {
          navigate('/voter');
        }
      } else {
        setIsLogin(true);
        setError('Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 glass-panel rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </h2>

      {error && (
        <div className={`p-4 mb-4 text-sm rounded-lg border-l-4 ${error.includes('successful') ? 'bg-green-50 text-green-800 border-green-500' : 'bg-red-50 text-red-800 border-red-500'}`}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            name="username"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm bg-white/50"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm bg-white/50"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm bg-white/50"
            value={formData.password}
            onChange={handleChange}
          />
        </div>



        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold py-2.5 rounded-lg hover:from-indigo-700 hover:to-blue-600 focus:ring-4 focus:ring-blue-200 transition-all shadow-md mt-6 flex justify-center items-center"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          ) : (
            isLogin ? 'Sign In' : 'Sign Up'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => { setIsLogin(!isLogin); setError(''); }}
          className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          {isLogin ? 'Register now' : 'Login instead'}
        </button>
      </div>
    </div>
  );
}
