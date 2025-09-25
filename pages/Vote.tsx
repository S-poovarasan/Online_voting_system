import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ElectionDetails, Candidate } from '../types';
import { electionService } from '../services/electionService';

const Vote: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [electionData, setElectionData] = useState<ElectionDetails | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

  const loadElectionData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await electionService.getElectionById(id!);
      setElectionData(data);
    } catch (err: any) {
      setError('Failed to load election data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkVoteStatus = useCallback(async () => {
    try {
      const voteCheck = await electionService.checkVote(id!);
      setHasVoted(voteCheck.hasVoted);
    } catch (err: any) {
      console.error('Failed to check vote status:', err);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadElectionData();
      checkVoteStatus();
    }
  }, [id, loadElectionData, checkVoteStatus]);

  const handleCandidateSelect = (candidateId: string) => {
    setSelectedCandidate(candidateId);
  };

  const handleSubmitVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await electionService.castVote(id!, selectedCandidate);
      navigate(`/elections/${id}/results`, { 
        state: { message: 'Vote cast successfully!' }
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cast vote');
    } finally {
      setSubmitting(false);
    }
  };

  const isElectionActive = () => {
    if (!electionData) return false;
    const now = new Date();
    const start = new Date(electionData.election.startDate);
    const end = new Date(electionData.election.endDate);
    return electionData.election.isActive && now >= start && now <= end;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!electionData) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Election not found</h1>
        </div>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-800 mb-2">Vote Already Cast</h1>
          <p className="text-green-700 mb-4">
            You have already voted in this election. Thank you for participating!
          </p>
          <button
            onClick={() => navigate(`/elections/${id}/results`)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium"
          >
            View Results
          </button>
        </div>
      </div>
    );
  }

  if (!isElectionActive()) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <div className="text-yellow-600 text-6xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-yellow-800 mb-2">Election Not Active</h1>
          <p className="text-yellow-700 mb-4">
            This election is not currently active for voting.
          </p>
          <button
            onClick={() => navigate('/elections')}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-md font-medium"
          >
            Back to Elections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {electionData.election.title}
        </h1>
        <p className="text-gray-600 mb-4">
          {electionData.election.description}
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Voting Instructions:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Select one candidate by clicking on their card</li>
            <li>• Review your selection before submitting</li>
            <li>• You can only vote once in this election</li>
            <li>• Your vote is confidential and secure</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Select a Candidate ({electionData.candidates.length} candidates)
        </h2>
        
        {electionData.candidates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No candidates available for this election.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {electionData.candidates.map((candidate: Candidate) => (
              <div
                key={candidate._id}
                onClick={() => handleCandidateSelect(candidate._id)}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                  selectedCandidate === candidate._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  {candidate.photo ? (
                    <img
                      src={candidate.photo}
                      alt={candidate.name}
                      className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center">
                      <span className="text-2xl text-gray-500">👤</span>
                    </div>
                  )}
                  
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {candidate.name}
                  </h3>
                  
                  <p className="text-sm text-blue-600 mb-2 font-medium">
                    {candidate.party}
                  </p>
                  
                  {candidate.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {candidate.description}
                    </p>
                  )}
                  
                  {selectedCandidate === candidate._id && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        ✓ Selected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {electionData.candidates.length > 0 && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/elections')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitVote}
            disabled={!selectedCandidate || submitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? 'Submitting Vote...' : 'Cast Vote'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Vote;