import React, { useEffect, useState } from 'react';
import { UserProfile, getAllUsers, toggleUserStatus } from '../../services/dbService';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState<'createdAt' | 'lastLoginAt' | 'plan'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (err: any) {
        console.error("Error fetching users for admin:", err);
        setError("Could not load users. Please ensure Firebase Security Rules allow your admin account to read the 'users' collection.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleToggleStatus = async (uid: string, currentStatus: boolean | undefined) => {
    try {
      const newStatus = !currentStatus;
      await toggleUserStatus(uid, newStatus);
      // Update local state instantly
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isDisabled: newStatus } : u));
    } catch (err) {
      alert("Failed to update user status.");
    }
  };

  const handleSort = (field: 'createdAt' | 'lastLoginAt' | 'plan') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to newest first when switching fields
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortField === 'plan') {
      const aVal = a.plan || '';
      const bVal = b.plan || '';
      const cmp = aVal.localeCompare(bVal);
      return sortDirection === 'asc' ? cmp : -cmp;
    }
    const aValue = a[sortField] || 0;
    const bValue = b[sortField] || 0;
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const handleBulkEmail = () => {
    const bccEmails = users.map(u => u.email).filter(Boolean).join(',');
    window.location.href = `mailto:?bcc=${bccEmails}`;
  };

  return (
    <div className="w-full px-[20px] py-[20px] bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={handleBulkEmail}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors"
          >
            Bulk Email All Users
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors"
          >
            Exit Dashboard
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-6 border border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Users</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {loading ? '...' : users.length}
            </dd>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-indigo-200 dark:border-indigo-900 transition-colors">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-indigo-500 dark:text-indigo-400 truncate">Marketing Links</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 mt-2 space-y-2">
              <div><a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 underline">Instagram Profile</a></div>
              <div><a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 underline">Facebook Page</a></div>
            </dd>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">User Directory</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Track user plans and credit usage.</p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 overflow-x-auto max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading user data...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">No users found.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none" onClick={() => handleSort('plan')}>
                    <div className="flex items-center gap-1">
                      Plan
                      {sortField === 'plan' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credits</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center gap-1">
                      Joined
                      {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none" onClick={() => handleSort('lastLoginAt')}>
                    <div className="flex items-center gap-1">
                      Signed In
                      {sortField === 'lastLoginAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700" src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email || 'User'}`} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'Unknown Name'}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <a href={`mailto:${user.email}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center gap-1 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                              {user.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.plan === 'Pay as You Go' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {user.credits} credits
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleToggleStatus(user.uid as string, user.isDisabled)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${user.isDisabled ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-800/50' : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/50'}`}
                      >
                        {user.isDisabled ? 'Enable Profile' : 'Disable Profile'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
