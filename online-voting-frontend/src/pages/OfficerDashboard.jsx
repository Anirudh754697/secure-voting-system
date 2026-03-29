import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { indiaStatesDistricts } from '../data/indiaStatesDistricts';

export default function OfficerDashboard() {
  const [elections, setElections] = useState([]);
  const [message, setMessage] = useState('');

  // Forms state
  const [showElectionForm, setShowElectionForm] = useState(false);
  const [electionForm, setElectionForm] = useState({ title: '', description: '', startDate: '', endDate: '', jurisdictionLevel: 'NATIONAL', jurisdictionName: '' });
  const [selectedState, setSelectedState] = useState('');

  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [selectedElectionId, setSelectedElectionId] = useState(null);
  const [candidateForm, setCandidateForm] = useState({ name: '', description: '', partyAffiliation: '' });

  // Results view state
  const [resultsMode, setResultsMode] = useState(false);
  const [electionResults, setElectionResults] = useState(null);

  const navigate = useNavigate();

  const fetchElections = async () => {
    try {
      const { data } = await axios.get('/api/officer/elections');
      setElections(data);
    } catch {
      setMessage('Failed to load elections.');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || (user.role !== 'ROLE_OFFICER' && user.role !== 'ROLE_ADMINISTRATOR')) {
      navigate('/login');
      return;
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchElections();
  }, [navigate]);

  const createElection = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...electionForm };
      if (payload.jurisdictionLevel === 'NATIONAL') {
        payload.jurisdictionName = 'India';
      }
      await axios.post('/api/officer/elections', payload);
      setMessage('Election created!');
      setShowElectionForm(false);
      fetchElections();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create election.');
    }
  };

  const addCandidate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/officer/candidates', { ...candidateForm, electionId: selectedElectionId });
      setMessage('Candidate added!');
      setShowCandidateForm(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add candidate.');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/officer/elections/${id}/status?status=${status}`);
      setMessage(`Election status updated to ${status}`);
      fetchElections();
    } catch {
      setMessage('Failed to update status.');
    }
  };

  const viewResults = async (id) => {
    try {
      const { data } = await axios.get(`/api/officer/results/${id}`);
      setElectionResults(data);
      setResultsMode(true);
    } catch {
      setMessage('Failed to load results.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">Officer Dashboard</h2>
        <div className="space-x-4">
          <button onClick={() => setShowElectionForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
            + New Election
          </button>
          <button onClick={logout} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
            Logout
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg font-medium shadow-sm border-l-4 ${message.includes('Faile') ? 'bg-red-50 text-red-800 border-red-500' : 'bg-green-50 text-green-800 border-green-500'}`}>
          {message}
        </div>
      )}

      {/* Results View Modal / Section */}
      {resultsMode && electionResults && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Results: {electionResults.title}</h3>
            <button onClick={() => setResultsMode(false)} className="text-gray-500 hover:text-gray-800 font-medium bg-gray-100 px-4 py-2 rounded-md transition hover:bg-gray-200">Close Results</button>
          </div>
          <p className="text-gray-600 mb-6">Total Votes: <span className="font-bold text-indigo-600 text-2xl">{electionResults.totalVotes}</span></p>

          <div className="space-y-4">
            {electionResults.results.map(res => {
              const percentage = electionResults.totalVotes === 0 ? 0 : Math.round((res.voteCount / electionResults.totalVotes) * 100);
              return (
                <div key={res.id} className="border border-gray-100 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white shadow-sm">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-gray-800 text-lg">{res.name} <span className="text-sm font-medium text-indigo-500 ml-2 bg-indigo-50 px-2 py-0.5 rounded">({res.partyAffiliation})</span></span>
                    <span className="font-bold text-indigo-600 text-lg">{res.voteCount} votes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner mt-2">
                    <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-4 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1 font-medium">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Forms and Lists */}
      {!resultsMode && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Elections List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Manage Elections</h3>
              <div className="space-y-4">
                {elections.map(el => (
                  <div key={el.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 border border-gray-100 rounded-xl hover:shadow-md hover:border-indigo-100 transition-all gap-4">
                    <div>
                      <h4 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                        {el.title}
                        <span className={`text-[10px] px-2 py-1 uppercase font-bold tracking-wider rounded-full ${el.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : el.status === 'COMPLETED' ? 'bg-gray-200 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {el.status}
                        </span>
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">{el.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {el.status === 'UPCOMING' && <button onClick={() => updateStatus(el.id, 'ACTIVE')} className="text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 px-3 py-2 rounded-md border border-green-200 transition-colors">START ELECTION</button>}
                      {el.status === 'ACTIVE' && <button onClick={() => updateStatus(el.id, 'COMPLETED')} className="text-xs font-semibold bg-yellow-50 text-yellow-600 hover:bg-yellow-100 px-3 py-2 rounded-md border border-yellow-200 transition-colors">END ELECTION</button>}
                      <button onClick={() => { setSelectedElectionId(el.id); setShowCandidateForm(true); }} className="text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-2 rounded-md border border-indigo-200 transition-colors">+ CANDIDATE</button>
                      <button onClick={() => viewResults(el.id)} className="text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md border border-gray-300 transition-colors">RESULTS</button>
                    </div>
                  </div>
                ))}
                {elections.length === 0 && <div className="text-center py-8 text-gray-400">No elections found.</div>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Dynamic Form Area */}
            {showElectionForm && (
              <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100 border-t-4 border-t-indigo-500 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800 text-lg">Create Election</h3>
                  <button onClick={() => setShowElectionForm(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full w-8 h-8 flex items-center justify-center transition">×</button>
                </div>
                <form onSubmit={createElection} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Title</label>
                    <input required type="text" placeholder="General Election 2026" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={electionForm.title} onChange={e => setElectionForm({ ...electionForm, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Description</label>
                    <textarea placeholder="Election description..." className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={electionForm.description} onChange={e => setElectionForm({ ...electionForm, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Jurisdiction Level</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={electionForm.jurisdictionLevel} onChange={e => { setElectionForm({ ...electionForm, jurisdictionLevel: e.target.value, jurisdictionName: '' }); setSelectedState(''); }}>
                        <option value="NATIONAL">National Level (Lok Sabha)</option>
                        <option value="STATE">State Level (Vidhan Sabha)</option>
                        <option value="DISTRICT">District / Municipal Level</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Target Area Name</label>
                      {electionForm.jurisdictionLevel === 'NATIONAL' ? (
                        <input required disabled type="text" placeholder="Entire Country" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" value="India" readOnly />
                      ) : electionForm.jurisdictionLevel === 'STATE' ? (
                        <select required className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={electionForm.jurisdictionName} onChange={e => setElectionForm({ ...electionForm, jurisdictionName: e.target.value })}>
                          <option value="">Select State</option>
                          {Object.keys(indiaStatesDistricts).map((state) => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex gap-2">
                          <select required className="w-1/2 px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={selectedState} onChange={e => { setSelectedState(e.target.value); setElectionForm({ ...electionForm, jurisdictionName: '' }); }}>
                            <option value="">Select State</option>
                            {Object.keys(indiaStatesDistricts).map((state) => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                          <select required disabled={!selectedState} className="w-1/2 px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-400" value={electionForm.jurisdictionName} onChange={e => setElectionForm({ ...electionForm, jurisdictionName: e.target.value })}>
                            <option value="">Select District</option>
                            {selectedState && indiaStatesDistricts[selectedState]?.map((district) => (
                              <option key={district} value={district}>{district}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Start Date</label>
                      <input type="datetime-local" className="w-full px-2 py-2 border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-indigo-500 outline-none" value={electionForm.startDate} onChange={e => setElectionForm({ ...electionForm, startDate: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">End Date</label>
                      <input type="datetime-local" className="w-full px-2 py-2 border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-indigo-500 outline-none" value={electionForm.endDate} onChange={e => setElectionForm({ ...electionForm, endDate: e.target.value })} />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-md hover:bg-indigo-700 transition mt-2 shadow-sm border border-indigo-700">Save Election</button>
                </form>
              </div>
            )}

            {showCandidateForm && (
              <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 border-t-4 border-t-blue-500 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800 text-lg">Add Candidate</h3>
                  <button onClick={() => setShowCandidateForm(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full w-8 h-8 flex items-center justify-center transition">×</button>
                </div>
                <div className="bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-md mb-4 font-medium border border-blue-100">
                  Target Election ID: <span className="font-bold">{selectedElectionId}</span>
                </div>
                <form onSubmit={addCandidate} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Full Name</label>
                    <input required type="text" placeholder="John Doe" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={candidateForm.name} onChange={e => setCandidateForm({ ...candidateForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Party Affiliation</label>
                    <input required type="text" placeholder="Independent" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={candidateForm.partyAffiliation} onChange={e => setCandidateForm({ ...candidateForm, partyAffiliation: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Manifesto / Bio</label>
                    <textarea placeholder="Candidate biography..." className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm h-24 focus:ring-2 focus:ring-blue-500 outline-none" value={candidateForm.description} onChange={e => setCandidateForm({ ...candidateForm, description: e.target.value })} />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-md hover:bg-blue-700 transition mt-2 shadow-sm border border-blue-700">Save Candidate</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
