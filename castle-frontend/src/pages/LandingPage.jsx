import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="landing-content">
        <div className="hero">
          <div className="castle-icon">🏰</div>
          <h1>Castle</h1>
          <p className="tagline">Defend your castle together</p>
          <p className="description">
            Challenge your friends to stay under your daily screen time limit.
            Every day your group succeeds, your castle stands strong.
          </p>
        </div>

        <div className="actions">
          <button 
            className="primary-button"
            onClick={() => navigate('/create')}
          >
            Create Group
          </button>
          <button 
            className="secondary-button"
            onClick={() => navigate('/join')}
          >
            Join Group
          </button>
          <button 
            className="secondary-button"
            onClick={() => navigate('/my-groups')}
          >
            My Groups
          </button>
        </div>

        <div className="info-card card">
          <h3>How it works</h3>
          <ol className="steps">
            <li>Create or join a group</li>
            <li>Set a daily screen time limit</li>
            <li>Share your usage each day</li>
            <li>Keep your castle alive by staying under the limit</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
