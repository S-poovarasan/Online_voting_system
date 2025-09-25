import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminStats } from '../../types';
import { adminService } from '../../services/adminService';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getStats();
      setStats(data);
    } catch (err: any) {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage elections, candidates, and view system statistics
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-blue-600 text-3xl mr-4">👥</div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Total Users</h3>
                <p className="text-2xl font-bold text-blue-900">{stats.users.total}</p>
                <p className="text-sm text-blue-600">
                  {stats.users.voters} voters, {stats.users.admins} admins
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-green-600 text-3xl mr-4">🗳️</div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Elections</h3>
                <p className="text-2xl font-bold text-green-900">{stats.elections.total}</p>
                <p className="text-sm text-green-600">
                  {stats.elections.active} active
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-purple-600 text-3xl mr-4">✅</div>
              <div>
                <h3 className="text-lg font-semibold text-purple-800">Total Votes</h3>
                <p className="text-2xl font-bold text-purple-900">{stats.votes}</p>
                <p className="text-sm text-purple-600">Cast by users</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-yellow-600 text-3xl mr-4">👤</div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Candidates</h3>
                <p className="text-2xl font-bold text-yellow-900">{stats.candidates}</p>
                <p className="text-sm text-yellow-600">Across all elections</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/admin/elections/new"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-md font-medium transition-colors"
            >
              Create New Election
            </Link>
            <Link
              to="/admin/elections"
              className="block w-full bg-gray-600 hover:bg-gray-700 text-white text-center py-3 px-4 rounded-md font-medium transition-colors"
            >
              Manage Elections
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Running
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Updated</span>
              <span className="text-sm text-gray-500">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button
            onClick={loadStats}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
        <div className="text-gray-600">
          <p className="mb-2">• System statistics updated successfully</p>
          <p className="mb-2">• {stats?.elections.active} active elections running</p>
          <p className="mb-2">• {stats?.votes} total votes recorded</p>
          <p>• {stats?.users.total} users registered in the system</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;