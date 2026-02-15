import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGroupsForEmail } from '../api/client';
import './MyGroupsPage.css';

function MyGroupsPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem('userEmail') || '');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSearched(false);

    try {
      const result = await getGroupsForEmail(email);
      setGroups(result);
      setSearched(true);

      // Save email for convenience
      localStorage.setItem('userEmail', email);
    } catch (err) {
      setError(err.message || 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <button
          className="back-button secondary"
          onClick={() => navigate('/')}
        >
          ← Back
        </button>
      </div>

      <div className="castle-icon-small">🏰</div>
      <h1>My Castles</h1>
      <p className="mb-4">View all groups you're part of</p>

      {error && (
        <div className="message error">{error}</div>
      )}

      <form onSubmit={handleSearch}>
        <div className="form-group">
          <label htmlFor="email">Your Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Find My Groups'}
        </button>
      </form>

      {searched && groups.length === 0 && (
        <div className="empty-state card mt-3">
          <p>No groups found for this email.</p>
          <button
            className="secondary mt-2"
            onClick={() => navigate('/join')}
          >
            Join a Group
          </button>
        </div>
      )}

      {groups.length > 0 && (
        <div className="groups-list mt-3">
          <h3>Your Groups</h3>
          {groups.map((group) => (
            <div
              key={group.group_id}
              className="group-card card"
              onClick={() => navigate(`/group/${group.group_id}`)}
            >
              <div className="group-header">
                <h3>{group.group_name || group.name}</h3>
                <span className="group-code">{group.invite_code}</span>
              </div>
              <div className="group-info">
                <span className="info-item">
                  🕐 {group.daily_limit_minutes} min/day
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyGroupsPage;
