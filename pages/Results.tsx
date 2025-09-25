import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ElectionResults } from '../types';
import { electionService } from '../services/electionService';

const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const message = location.state?.message;
  
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [loading, setLoading] = useState(true);

  const loadResults = useCallback(async () => {
    try {
      setLoading(true);
      const data = await electionService.getElectionResults(id!);
      setResults(data);
    } catch (err: any) {
      console.error('Failed to load election results:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadResults();
    }
  }, [id, loadResults]);

  const getPercentage = (voteCount: number, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return ((voteCount / totalVotes) * 100).toFixed(1);
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

  const isElectionEnded = () => {
    if (!results) return false;
    return new Date() > new Date(results.election.endDate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Results not found</h1>
        </div>
      </div>
    );
  }

  const winner = results.candidates.length > 0 ? results.candidates[0] : null;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {message && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {message}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Election Results: {results.election.title}
        </h1>
        <p className="text-gray-600 mb-4">
          {results.election.description}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800">Total Votes</h3>
            <p className="text-2xl font-bold text-blue-900">{results.totalVotes}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800">Candidates</h3>
            <p className="text-2xl font-bold text-green-900">{results.candidates.length}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-800">Status</h3>
            <p className="text-lg font-semibold text-purple-900">
              {isElectionEnded() ? 'Completed' : 'In Progress'}
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Start:</strong> {formatDate(results.election.startDate)}</p>
          <p><strong>End:</strong> {formatDate(results.election.endDate)}</p>
          <p><strong>Created by:</strong> {results.election.createdBy.name}</p>
        </div>
      </div>

      {results.hasVoted && results.userVote && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">Your Vote</h3>
          <p className="text-green-700">
            You voted for: <strong>{results.userVote.name}</strong> ({results.userVote.party})
          </p>
        </div>
      )}

      {winner && isElectionEnded() && results.totalVotes > 0 && (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-center">
            <div className="text-yellow-600 text-4xl mb-2">🏆</div>
            <h2 className="text-2xl font-bold text-yellow-800 mb-2">Winner</h2>
            <p className="text-xl text-yellow-700">
              <strong>{winner.name}</strong> ({winner.party})
            </p>
            <p className="text-yellow-600">
              {winner.voteCount} votes ({getPercentage(winner.voteCount, results.totalVotes)}%)
            </p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Results Breakdown</h2>
        
        {results.candidates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No candidates in this election.
          </div>
        ) : (
          <div className="space-y-4">
            {results.candidates.map((candidate, index) => (
              <div
                key={candidate._id}
                className={`border rounded-lg p-6 ${
                  index === 0 && isElectionEnded() && results.totalVotes > 0
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {candidate.photo ? (
                      <img
                        src={candidate.photo}
                        alt={candidate.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xl text-gray-500">👤</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {candidate.name}
                        {index === 0 && isElectionEnded() && results.totalVotes > 0 && (
                          <span className="ml-2 text-yellow-600">👑</span>
                        )}
                      </h3>
                      <p className="text-blue-600 font-medium">{candidate.party}</p>
                      {candidate.description && (
                        <p className="text-sm text-gray-600 mt-1">{candidate.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {candidate.voteCount}
                    </p>
                    <p className="text-sm text-gray-600">
                      {getPercentage(candidate.voteCount, results.totalVotes)}%
                    </p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      index === 0 && isElectionEnded() && results.totalVotes > 0
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${results.totalVotes > 0 ? (candidate.voteCount / results.totalVotes) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-4">
        <Link
          to="/elections"
          className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
        >
          Back to Elections
        </Link>
        
        {!results.hasVoted && !isElectionEnded() && (
          <Link
            to={`/elections/${id}/vote`}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Cast Your Vote
          </Link>
        )}
        
        <button
          onClick={loadResults}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
        >
          Refresh Results
        </button>
      </div>
    </div>
  );
};

export default Results;