import React, { useEffect, useState } from 'react';
import { UserProfile, getAllUsers, toggleUserStatus, adminUpdateCredits, toggleUserAdminStatus, getAdminProjectsAndFiles, adminDeleteProjectFn, ProjectRecord, FileRecord } from '../../services/dbService';

interface AdminDashboardProps {
  onBack: () => void;
  onLoadUserProject?: (projectId: string, targetUid: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onLoadUserProject }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState<'createdAt' | 'lastLoginAt' | 'plan'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [viewingProjectsForUser, setViewingProjectsForUser] = useState<UserProfile | null>(null);
  const [userProjects, setUserProjects] = useState<ProjectRecord[]>([]);
  const [userFiles, setUserFiles] = useState<FileRecord[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

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

  const handleToggleAdminStatus = async (uid: string, currentStatus: boolean | undefined) => {
    try {
      const newStatus = !currentStatus;
      await toggleUserAdminStatus(uid, newStatus);
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isAdmin: newStatus } : u));
    } catch (err) {
      alert("Failed to update admin status.");
    }
  };

  const openProjectViewer = async (user: UserProfile) => {
    if (!user.uid) return;
    setViewingProjectsForUser(user);
    setLoadingProjects(true);
    try {
      const data = await getAdminProjectsAndFiles(user.uid);
      setUserProjects(data.projects);
      setUserFiles(data.files);
    } catch (err) {
      console.error(err);
      alert("Failed to load projects.");
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleAdminDeleteProject = async (projectId: string) => {
    if (!viewingProjectsForUser || !viewingProjectsForUser.uid) return;
    if (confirm("Are you sure you want to delete this project and all its associated files? This cannot be undone.")) {
      const success = await adminDeleteProjectFn(viewingProjectsForUser.uid, projectId);
      if (success) {
        setUserProjects(prev => prev.filter(p => p.id !== projectId));
        setUserFiles(prev => prev.filter(f => f.projectId !== projectId));
      } else {
        alert("Failed to delete project.");
      }
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
                      Last Signed In
                      {sortField === 'lastLoginAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>

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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(user.plan || '').trim().toLowerCase() === 'pay as you go' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
                      <div className="flex items-center gap-2">
                        <span>{user.credits} credits</span>
                        <button 
                          onClick={async () => {
                            const amt = prompt(`Enter new total credits for ${user.name} (or type e.g. +50 to add):`);
                            if (!amt) return;
                            const isAdd = amt.trim().startsWith('+');
                            const num = parseInt(amt.replace('+', '').trim(), 10);
                            if (isNaN(num)) return;
                            const newCredits = isAdd ? (user.credits || 0) + num : num;
                            const planStr = newCredits > 0 && user.plan === 'free' ? 'Pay as You Go' : user.plan;
                            try {
                              const success = await adminUpdateCredits(user.uid as string, newCredits, planStr);
                              if (success) {
                                setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, credits: newCredits, plan: planStr } : u));
                                alert("Success! Credits updated.");
                              } else {
                                alert("Failed to update user credits. Please try again.");
                              }
                            } catch(e) { alert("Failed to update user credits."); }
                          }}
                          className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-md text-[10px] font-bold transition-colors border border-indigo-200 dark:border-indigo-800"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleAdminStatus(user.uid as string, user.isAdmin)}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold transition-colors border ${user.isAdmin ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        >
                          {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => openProjectViewer(user)}
                          className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-md text-[10px] font-bold transition-colors border border-indigo-200 dark:border-indigo-800"
                        >
                          View Projects
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Project Viewer Modal */}
      {viewingProjectsForUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-xl font-bold dark:text-white">Projects: {viewingProjectsForUser.name || 'Unknown User'}</h2>
                <p className="text-sm text-slate-500">{viewingProjectsForUser.email}</p>
              </div>
              <button onClick={() => setViewingProjectsForUser(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900">
              {loadingProjects ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
              ) : userProjects.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-500 dark:text-slate-400">No projects found for this user.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProjects.map(project => {
                    const projectFiles = userFiles.filter(f => f.projectId === project.id);
                    return (
                      <div key={project.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm flex flex-col group relative">
                        <div 
                          className="aspect-[4/3] bg-slate-100 dark:bg-slate-900 relative cursor-pointer group/image"
                          onClick={() => {
                            if (onLoadUserProject && viewingProjectsForUser?.uid) {
                              onLoadUserProject(project.id, viewingProjectsForUser.uid);
                            }
                          }}
                        >
                          {project.thumbnailUrl ? (
                            <img src={project.thumbnailUrl} className="w-full h-full object-cover group-hover/image:opacity-80 transition-opacity" alt={project.name} />
                          ) : projectFiles.length > 0 && (projectFiles[0].stagedUrl || projectFiles[0].originalUrl) ? (
                            <img src={projectFiles[0].stagedUrl || projectFiles[0].originalUrl} className="w-full h-full object-cover group-hover/image:opacity-80 transition-opacity" alt={project.name} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 group-hover/image:opacity-80 transition-opacity">No Images</div>
                          )}
                          <div className="absolute bottom-2 left-2 z-10 transition-transform hover:scale-105">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAdminDeleteProject(project.id); }}
                              className="p-2 bg-slate-900/40 hover:bg-red-600 backdrop-blur-sm text-white rounded-lg shadow-sm transition-all border border-white/10 hover:border-red-500/50"
                              title="Delete Project"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 dark:text-white truncate">{project.name}</h3>
                            <p className="text-xs text-slate-500 mt-1">{projectFiles.length} files</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
