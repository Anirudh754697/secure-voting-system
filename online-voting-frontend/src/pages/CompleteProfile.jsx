import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { indiaStatesDistricts } from '../data/indiaStatesDistricts';

export default function CompleteProfile() {
  const [formData, setFormData] = useState({ aadharNumber: '', panNumber: '', epicNumber: '', state: '', district: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/complete-profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.profileCompleted = true;
        user.state = formData.state;
        user.district = formData.district;
        localStorage.setItem('user', JSON.stringify(user));
      }

      navigate('/voter');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-20 p-8 glass-panel rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl">
      <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
        Complete Your Profile
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Provide details to verify your identity.
      </p>

      {error && (
        <div className="p-4 mb-4 text-sm rounded-lg border-l-4 bg-red-50 text-red-800 border-red-500">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
          <input
            type="text"
            name="aadharNumber"
            required
            minLength={12}
            maxLength={12}
            pattern="\d{12}"
            title="Aadhar Number must be exactly 12 digits"
            placeholder="12 digit Aadhar Number"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm bg-white/50"
            value={formData.aadharNumber}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PAN Card Number</label>
          <input
            type="text"
            name="panNumber"
            required
            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
            title="PAN Card format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)"
            placeholder="e.g. ABCDE1234F"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm bg-white/50"
            value={formData.panNumber}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Voter ID (EPIC) Number</label>
          <input
            type="text"
            name="epicNumber"
            required
            pattern="[A-Z]{3}[0-9]{7}"
            title="EPIC format: 3 letters followed by 7 digits (e.g., ABC1234567)"
            placeholder="e.g. ABC1234567"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm bg-white/50"
            value={formData.epicNumber}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              name="state"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm bg-white/50"
              value={formData.state}
              onChange={(e) => {
                setFormData({ ...formData, state: e.target.value, district: '' });
              }}
            >
              <option value="">Select State</option>
              {Object.keys(indiaStatesDistricts).map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select
              name="district"
              required
              disabled={!formData.state}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm bg-white/50 disabled:bg-gray-100 disabled:text-gray-400"
              value={formData.district}
              onChange={handleChange}
            >
              <option value="">Select District</option>
              {formData.state && indiaStatesDistricts[formData.state]?.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold py-2.5 rounded-lg hover:from-indigo-700 hover:to-blue-600 focus:ring-4 focus:ring-blue-200 transition-all shadow-md mt-6 flex justify-center items-center disabled:opacity-50"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          ) : (
            'Complete Profile'
          )}
        </button>
      </form>
    </div>
  );
}
