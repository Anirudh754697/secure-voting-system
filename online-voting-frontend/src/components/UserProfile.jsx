import { useState } from 'react';

export default function UserProfile() {
  const [user] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  if (!user) return <p className="text-gray-500">Loading profile...</p>;

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-indigo-900 border-b pb-2">Account Details</h4>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
            <input
              type="text"
              value={user.username}
              disabled
              className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Username cannot be changed.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              defaultValue={user.email}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-sm">
            Save Changes
          </button>
        </div>

        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-emerald-800 border-b pb-2">Verified Identity</h4>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-24 h-24 text-emerald-900" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            </div>

            <p className="text-sm font-medium text-emerald-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Your documents have been securely verified and hashed.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs uppercase tracking-wider text-emerald-600 font-bold mb-1">State</span>
                  <span className="font-medium text-gray-800 bg-white px-3 py-1.5 border border-emerald-200 rounded-lg inline-block w-full">{user.state || 'Not Set'}</span>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider text-emerald-600 font-bold mb-1">District</span>
                  <span className="font-medium text-gray-800 bg-white px-3 py-1.5 border border-emerald-200 rounded-lg inline-block w-full">{user.district || 'Not Set'}</span>
                </div>
              </div>
              <div className="h-px bg-emerald-200/50 my-2"></div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-emerald-600 font-bold mb-1">Aadhar Card</span>
                <span className="font-mono text-gray-800 bg-emerald-100/50 px-3 py-1 rounded inline-block shadow-sm">XXXX-XXXX-XXXX (Verified)</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-emerald-600 font-bold mb-1">PAN Card</span>
                <span className="font-mono text-gray-800 bg-emerald-100/50 px-3 py-1 rounded inline-block shadow-sm">XXXXX1234X (Verified)</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-emerald-600 font-bold mb-1">EPIC / Voter ID</span>
                <span className="font-mono text-gray-800 bg-emerald-100/50 px-3 py-1 rounded inline-block shadow-sm">XXX1234567 (Verified)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
