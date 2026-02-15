import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGroupStatus, getGroupStreak } from '../api/client';
import './GroupDashboard.css';

function GroupDashboard() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState(null);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch status and streak in parallel
      const [statusData, streakData] = await Promise.all([
        getGroupStatus(groupId),
        getGroupStreak(groupId).catch(() => null), // Streak might fail, that's ok
      ]);

      setStatus(statusData);
      setStreak(streakData);
    } catch (err) {
      setError(err.message || 'Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
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
        <div className="message error">{error}</div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="container">
        <div className="message error">Group not found</div>
      </div>
    );
  }

  const healthPercent = status.health_percent;
  const isAlive = status.alive;
  const usagePercent = Math.min(100, Math.round((status.used_minutes / status.limit_minutes) * 100));

  const getHealthColor = () => {
    if (healthPercent >= 70) return 'success';
    if (healthPercent >= 30) return 'warning';
    return 'danger';
  };

  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="container">
      <div className="page-header">
        <button 
          className="back-button secondary"
          onClick={() => navigate('/')}
        >
          ← Home
        </button>
      </div>

      {/* Status Badge */}
      <div className="status-header">
        <div className={`castle-status ${isAlive ? 'alive' : 'broken'}`}>
          <div className="castle-icon-large">
            {isAlive ? '🏰' : '💥'}
          </div>
          <div className={`badge ${isAlive ? 'success' : 'danger'}`}>
            {isAlive ? 'Castle Standing' : 'Castle Broken'}
          </div>
        </div>
      </div>

      {/* Health Card */}
      <div className="card health-card">
        <div className="card-header">
          <h2>Today's Health</h2>
          <span className="date">{new Date(status.date).toLocaleDateString()}</span>
        </div>
        
        <div className="health-display">
          <div className="health-number">{healthPercent}%</div>
          <div className="progress-bar">
            <div 
              className={`progress-bar-fill ${getHealthColor()}`}
              style={{ width: `${healthPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="usage-stats">
          <div className="stat">
            <span className="stat-label">Used</span>
            <span className="stat-value">{formatMinutes(status.used_minutes)}</span>
          </div>
          <div className="stat-divider">/</div>
          <div className="stat">
            <span className="stat-label">Limit</span>
            <span className="stat-value">{formatMinutes(status.limit_minutes)}</span>
          </div>
        </div>

        <div className="usage-bar">
          <div className="usage-bar-label">Daily Usage</div>
          <div className="progress-bar">
            <div 
              className={`progress-bar-fill ${usagePercent >= 100 ? 'danger' : usagePercent >= 80 ? 'warning' : 'success'}`}
              style={{ width: `${usagePercent}%` }}
            ></div>
          </div>
          <div className="usage-bar-percent">{usagePercent}%</div>
        </div>
      </div>

      {/* Streak Card */}
      {streak && (
        <div className="card streak-card">
          <div className="streak-icon">🔥</div>
          <div className="streak-number">{streak.current_streak_days}</div>
          <div className="streak-label">Day Streak</div>
          <p className="streak-subtitle">
            {streak.current_streak_days === 0 
              ? 'Start your streak today!'
              : `Keep it going!`
            }
          </p>
        </div>
      )}

      {/* Members Leaderboard */}
      <div className="card members-card">
        <h3>Today's Usage</h3>
        {status.members && status.members.length > 0 ? (
          <div className="members-list">
            {status.members.map((member, index) => (
              <div key={member.email} className="member-row">
                <div className="member-rank">#{index + 1}</div>
                <div className="member-info">
                  <div className="member-email">{member.email}</div>
                  <div className="member-usage">{formatMinutes(member.total_minutes)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-members">No usage data yet today</p>
        )}
      </div>

      <button 
        className="refresh-button secondary w-full mt-3"
        onClick={loadGroupData}
      >
        🔄 Refresh
      </button>
    </div>
  );
}

export default GroupDashboard;
