import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Election } from '../types';
import { electionService } from '../services/electionService';

const Elections: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      setLoading(true);
      const data = await electionService.getElections();
      setElections(data);
    } catch (err: any) {
      setError('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Elections</h1>
        <p className="mt-2 text-gray-600">
          View and participate in available elections
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {elections.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🗳️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No elections available</h3>
          <p className="text-gray-500">Check back later for upcoming elections.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {elections.map((election) => {
            const statusInfo = getElectionStatus(election);
            return (
              <div
                key={election._id}
                className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {election.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {election.description}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <span className="font-medium w-16">Start:</span>
                      <span>{formatDate(election.startDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-16">End:</span>
                      <span>{formatDate(election.endDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-16">By:</span>
                      <span>{election.createdBy.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {statusInfo.status === 'active' && (
                      <Link
                        to={`/elections/${election._id}/vote`}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md text-sm font-medium transition-colors"
                      >
                        Vote Now
                      </Link>
                    )}
                    
                    {(statusInfo.status === 'ended' || statusInfo.status === 'active') && (
                      <Link
                        to={`/elections/${election._id}/results`}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-center py-2 px-4 rounded-md text-sm font-medium transition-colors"
                      >
                        View Results
                      </Link>
                    )}
                    
                    {statusInfo.status === 'upcoming' && (
                      <div className="flex-1 bg-gray-300 text-gray-500 text-center py-2 px-4 rounded-md text-sm font-medium cursor-not-allowed">
                        Not Started
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Elections;