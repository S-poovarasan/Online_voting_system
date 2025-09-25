import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Election } from '../../types';
import { adminService } from '../../services/adminService';

const AdminElections: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllElections();
      setElections(data);
    } catch (err: any) {
      setError('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteElection = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this election? This action cannot be undone.')) {
      return;
    }

    try {
      await adminService.deleteElection(id);
      await loadElections(); // Reload the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete election');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getElectionStatus = (election: Election) => {
    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);

    if (!election.isActive) {
      return { status: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' };
    } else if (now < start) {
      return { status: 'upcoming', label: 'Upcoming', color: 'bg-yellow-100 text-yellow-800' };
    } else if (now >= start && now <= end) {
      return { status: 'active', label: 'Active', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'ended', label: 'Ended', color: 'bg-red-100 text-red-800' };
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Elections</h1>
          <p className="mt-2 text-gray-600">
            Create, edit, and manage all elections in the system
          </p>
        </div>
        <Link
          to="/admin/elections/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
        >
          Create New Election
        </Link>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {elections.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🗳️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No elections found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first election.</p>
          <Link
            to="/admin/elections/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
          >
            Create Election
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {elections.map((election) => {
              const statusInfo = getElectionStatus(election);
              return (
                <li key={election._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {election.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {election.description}
                      </p>
                      
                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                        <span>Start: {formatDate(election.startDate)}</span>
                        <span>End: {formatDate(election.endDate)}</span>
                        <span>By: {election.createdBy.name}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/elections/${election._id}/candidates`}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Candidates
                      </Link>
                      <Link
                        to={`/elections/${election._id}/results`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Results
                      </Link>
                      <Link
                        to={`/admin/elections/${election._id}/edit`}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteElection(election._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminElections;