import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { joinGroup } from '../api/client';
import './JoinGroupPage.css';

function JoinGroupPage() {
  const navigate = useNavigate();
  const { groupCode } = useParams();
  
  const [formData, setFormData] = useState({
    inviteCode: groupCode || '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (groupCode) {
      setFormData(prev => ({ ...prev, inviteCode: groupCode }));
    }
  }, [groupCode]);

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
      const result = await joinGroup(formData.inviteCode, formData.email);
      
      // Save email to localStorage for convenience
      localStorage.setItem('userEmail', formData.email);
      
      // Navigate to the group dashboard
      navigate(`/group/${result.group_id}`);
    } catch (err) {
      setError(err.message || 'Failed to join group');
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
      <h1>Join Castle</h1>
      <p className="mb-4">Enter your details to join an existing group</p>

      {error && (
        <div className="message error">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="inviteCode">Invite Code</label>
          <input
            type="text"
            id="inviteCode"
            name="inviteCode"
            value={formData.inviteCode}
            onChange={handleChange}
            placeholder="Enter invite code"
            required
            autoFocus={!groupCode}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Your Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
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
          {loading ? 'Joining...' : 'Join Castle'}
        </button>
      </form>

      <div className="help-card card mt-3">
        <p>
          <strong>Don't have an invite code?</strong><br />
          Ask the group creator to share their invite link or code with you.
        </p>
      </div>
    </div>
  );
}

export default JoinGroupPage;
