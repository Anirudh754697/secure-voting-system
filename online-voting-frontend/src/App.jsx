import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import VoterDashboard from './pages/VoterDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CompleteProfile from './pages/CompleteProfile';
import Background3D from './components/Background3D';

function App() {
  return (
    <BrowserRouter>
      <Background3D />
      <div className="min-h-screen flex flex-col font-sans relative z-10 text-slate-900">
        <header className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
              SecureVote
            </h1>
          </div>
        </header>
        
        <main className="flex-grow pt-24 px-4 pb-12">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/voter" element={<VoterDashboard />} />
            <Route path="/officer" element={<OfficerDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
