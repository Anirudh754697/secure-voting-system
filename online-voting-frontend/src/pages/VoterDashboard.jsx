import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserProfile from '../components/UserProfile';
import VotingGuide from '../components/VotingGuide';

export default function VoterDashboard() {
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  // OpenCV & Face Detection States
  const [cvReady, setCvReady] = useState(false);
  const [multipleFacesWarning, setMultipleFacesWarning] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const videoRef = useRef(null);
  const canvasRef = useRef(null); // Used for capturing video frames for OpenCV
  const classifierRef = useRef(null);

  const detectionIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchElections();

    // Initialize OpenCV and load Haar cascade
    const initOpenCV = () => {
      const checkCv = setInterval(async () => {
        if (window.cv && window.cv.Mat) {
          clearInterval(checkCv);
          try {
            const res = await fetch('/models/haarcascade_frontalface_default.xml');
            const buffer = await res.arrayBuffer();
            const pInt8 = new Uint8Array(buffer);
            // Create the virtual file in OpenCV so CascadeClassifier can load it
            try {
              window.cv.FS_createDataFile('/', 'haarcascade_frontalface_default.xml', pInt8, true, false, false);
            } catch {
              // File might already exist if re-rendered rapidly
            }

            classifierRef.current = new window.cv.CascadeClassifier();
            classifierRef.current.load('haarcascade_frontalface_default.xml');
            setCvReady(true);
            console.log('OpenCV and Haar cascade loaded.');
          } catch (err) {
            console.error('Error loading Haar cascade:', err);
          }
        }
      }, 200);
    };

    initOpenCV();
  }, [navigate]);

  // Manage camera lifecycle
  useEffect(() => {
    if (selectedElection && cvReady) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [selectedElection, cvReady]);

  // Manage countdown warning lifecycle
  useEffect(() => {
    if (multipleFacesWarning) {
      if (!countdownIntervalRef.current) {
        countdownIntervalRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
              setSelectedElection(null);
              setMessage('Make sure no one is beside you while casting the vote.');
              return 10;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        setCountdown(10);
      }
    }
  }, [multipleFacesWarning]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setMessage('Camera access is required to vote securely.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setMultipleFacesWarning(false);
    setCountdown(10);
  };

  const processFrame = () => {
    if (
      !videoRef.current ||
      videoRef.current.readyState !== 4 ||
      !canvasRef.current ||
      !classifierRef.current ||
      !window.cv
    ) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Draw current video frame to hidden canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Read image data from canvas into an OpenCV Mat
      let src = window.cv.imread(canvas);
      let gray = new window.cv.Mat();

      // Convert to grayscale for Haar cascade
      window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY, 0);

      let faces = new window.cv.RectVector();
      // Detect faces (image, rects, scaleFactor, minNeighbors, flags, minSize, maxSize)
      classifierRef.current.detectMultiScale(gray, faces, 1.1, 3, 0);

      if (faces.size() > 1) {
        setMultipleFacesWarning(true);
      } else {
        setMultipleFacesWarning(false);
      }

      // Prevent memory leaks in WASM
      src.delete();
      gray.delete();
      faces.delete();
    } catch (err) {
      console.error('OpenCV detection error:', err);
    }
  };

  const handleVideoPlay = () => {
    if (!videoRef.current) return;

    // Run detection loop 2 times a second
    detectionIntervalRef.current = setInterval(() => {
      processFrame();
    }, 500);
  };

  const fetchElections = async () => {
    try {
      const { data } = await axios.get('/api/voter/elections');
      setElections(data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const selectElection = async (election) => {
    setSelectedElection(election);
    setMessage('');
    try {
      const { data } = await axios.get(`/api/voter/elections/${election.id}/candidates`);
      setCandidates(data);
    } catch (err) {
      console.error('Failed to load candidates:', err);
      setMessage('Failed to load candidates.');
    }
  };

  const castVote = async (candidateId) => {
    try {
      await axios.post('/api/voter/vote', {
        electionId: selectedElection.id,
        candidateId
      });
      setMessage('Vote cast successfully!');
      setTimeout(() => setSelectedElection(null), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to cast vote.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 min-h-[calc(100vh-8rem)] relative">
      {/* Hidden canvas used explicitly for OpenCV processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Warning Overlay */}
      {multipleFacesWarning && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md text-center border-l-8 border-red-500 animate-pulse">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Multiple Faces Detected!</h2>
            <p className="text-gray-600 mb-4">Please ensure you are alone while casting your vote.</p>
            <div className="text-5xl font-black text-red-600">
              {countdown}s
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-max z-10">
        <h2 className="text-xl font-bold text-indigo-900 mb-6 border-b pb-4">Menu</h2>
        <nav className="flex flex-col space-y-2 flex-grow">
          <button
            onClick={() => { setActiveTab('dashboard'); setSelectedElection(null); }}
            className={`text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              Elections
            </div>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              My Profile
            </div>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'guide' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Voting Guide
            </div>
          </button>
        </nav>

        <button onClick={logout} className="mt-8 text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Log Out
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow z-10 w-full overflow-hidden">
        {activeTab === 'profile' && <UserProfile />}
        {activeTab === 'guide' && <VotingGuide />}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-gray-800">Available Elections</h2>
            </div>

            {message && (
              <div className={`p-4 rounded-xl font-medium shadow-sm border-l-4 ${message.includes('success') ? 'bg-emerald-50 text-emerald-800 border-emerald-500' : 'bg-red-50 text-red-800 border-red-500'}`}>
                {message}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl"><div className="animate-pulse flex flex-col items-center"><div className="h-12 w-12 bg-indigo-200 rounded-full mb-4"></div><div className="h-4 w-32 bg-indigo-100 rounded"></div></div></div>
            ) : !selectedElection ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {elections.length === 0 ? <p className="text-slate-100 col-span-full text-center py-8 bg-slate-900/40 rounded-xl backdrop-blur-md border border-slate-600/30">No active elections found.</p> : null}
                {elections.map(el => (
                  <div key={el.id} className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl transition-all p-6 border border-slate-200 flex flex-col">
                    {el.jurisdictionLevel && (
                      <div className="mb-3">
                        <span className={`text-[10px] px-2.5 py-1 uppercase font-bold tracking-wider rounded-md border ${el.jurisdictionLevel === 'NATIONAL' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
                          {el.jurisdictionLevel} • {el.jurisdictionName}
                        </span>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{el.title}</h3>
                    <p className="text-gray-600 mb-6 flex-grow">{el.description}</p>
                    <button
                      onClick={() => selectElection(el)}
                      className="w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold py-2.5 rounded-xl transition-colors border border-indigo-100 shadow-sm"
                    >
                      View Candidates & Vote
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-slate-200 relative">

                {/* Camera Verification UI */}
                <div className="absolute top-6 right-6 flex flex-col items-end z-20">
                  <span className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Security Feed</span>
                  <div className={`overflow-hidden rounded-xl border-2 shadow-lg ${multipleFacesWarning ? 'border-red-500' : 'border-emerald-400'}`}>
                    <video
                      ref={videoRef}
                      onPlay={handleVideoPlay}
                      autoPlay
                      muted
                      className="w-32 h-24 object-cover transform scale-x-[-1]"
                    />
                  </div>
                  {!cvReady && <span className="text-xs text-indigo-500 mt-1 animate-pulse">Loading OpenCV...</span>}
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100 pr-40">
                  <button onClick={() => setSelectedElection(null)} className="text-gray-500 hover:text-indigo-600 font-medium flex items-center gap-2 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back
                  </button>
                  <h3 className="text-2xl font-bold text-gray-800">Candidates for {selectedElection.title}</h3>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {candidates.length === 0 ? <p className="text-gray-500 col-span-full text-center py-8">No candidates available yet.</p> : null}
                  {candidates.map(cand => (
                    <div key={cand.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-indigo-400 hover:shadow-xl transition-all text-center flex flex-col transform hover:-translate-y-1">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-50 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-indigo-500 font-serif ring-4 ring-white shadow-sm">
                        {cand.name.charAt(0)}
                      </div>
                      <h4 className="text-xl font-bold text-gray-800">{cand.name}</h4>
                      <p className="text-sm font-semibold text-indigo-600 mb-2">{cand.partyAffiliation}</p>
                      <p className="text-sm text-gray-500 mb-6 flex-grow">{cand.description}</p>
                      <button
                        onClick={() => castVote(cand.id)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-800 text-white py-3 rounded-xl transition-all font-semibold shadow-md active:scale-95"
                      >
                        Cast Vote
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
