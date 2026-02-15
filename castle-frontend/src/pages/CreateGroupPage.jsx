import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGroup } from '../api/client';
import './CreateGroupPage.css';

function CreateGroupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    dailyLimitMinutes: '',
    creatorEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await createGroup(
        formData.name,
        parseInt(formData.dailyLimitMinutes),
        formData.creatorEmail
      );
      
      setSuccess(result);
    } catch (err) {
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const inviteLink = `${window.location.origin}/join/${success.group_code || success.invite_code}`;
    
    return (
      <div className="container">
        <div className="success-content">
          <div className="success-icon">✅</div>
          <h1>Castle Created!</h1>
          <p>Your group has been created successfully.</p>

          <div className="card mt-3">
            <h3>Share this with your friends</h3>
            <div className="invite-section">
              <div className="form-group">
                <label>Invite Code</label>
                <div className="code-display">{success.group_code || success.invite_code}</div>
              </div>
              
              <div className="form-group">
                <label>Invite Link</label>
                <input 
                  type="text" 
                  value={inviteLink}
                  readOnly
                  onClick={(e) => e.target.select()}
                />
              </div>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  alert('Link copied to clipboard!');
                }}
              >
                Copy Invite Link
              </button>
            </div>
          </div>

          <div className="card mt-3">
            <h3>Group Details</h3>
            <div className="detail-row">
              <span>Name:</span>
              <strong>{success.name}</strong>
            </div>
            <div className="detail-row">
              <span>Daily Limit:</span>
              <strong>{success.daily_limit_minutes} minutes</strong>
            </div>
          </div>

          <button 
            className="mt-3 w-full"
            onClick={() => navigate(`/group/${success.group_id}`)}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
      <h1>Create Your Castle</h1>
      <p className="mb-4">Set up a new group challenge</p>

      {error && (
        <div className="message error">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Group Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Weekend Warriors"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dailyLimitMinutes">Daily Limit (minutes)</label>
          <input
            type="number"
            id="dailyLimitMinutes"
            name="dailyLimitMinutes"
            value={formData.dailyLimitMinutes}
            onChange={handleChange}
            placeholder="e.g., 120"
            min="1"
            required
          />
          <small>Total screen time allowed per day for the entire group</small>
        </div>

        <div className="form-group">
          <label htmlFor="creatorEmail">Your Email</label>
          <input
            type="email"
            id="creatorEmail"
            name="creatorEmail"
            value={formData.creatorEmail}
            onChange={handleChange}
            placeholder="your@email.com"
            required
          />
        </div>

        <button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Castle'}
        </button>
      </form>

      <div className="info-note card mt-3">
        <p><strong>Note:</strong> This endpoint (/create-group) is not yet implemented in the backend. You'll need to add it to your FastAPI server.</p>
      </div>
    </div>
  );
}

export default CreateGroupPage;
