import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/admin/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">System Administrator</h2>
        <button onClick={logout} className="text-sm border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
          Sign Out
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">Registered Users</h3>
          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
            Total count: {users.length}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="animate-pulse flex flex-col items-center"><div className="h-10 w-10 bg-gray-200 rounded-full mb-4"></div><div className="h-4 w-24 bg-gray-100 rounded"></div></div></div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 text-xs uppercase tracking-wider font-bold">
                  <th className="p-4 border-b">ID</th>
                  <th className="p-4 border-b">Username</th>
                  <th className="p-4 border-b">Email</th>
                  <th className="p-4 border-b">Role Context</th>
                  <th className="p-4 border-b text-right">System Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u, i) => (
                  <tr key={u.id} className={`hover:bg-indigo-50/30 transition-colors text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="p-4 text-gray-400 font-mono text-xs">#{u.id.toString().padStart(4, '0')}</td>
                    <td className="p-4 font-bold text-gray-800">{u.username}</td>
                    <td className="p-4 text-gray-500 font-medium">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest border ${u.role === 'ROLE_ADMINISTRATOR' ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm' :
                        u.role === 'ROLE_OFFICER' ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' :
                          'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                        {u.role.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]"></span>
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-400">No users found in database.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
