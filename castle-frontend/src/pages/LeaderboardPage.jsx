import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LeaderboardPage.css';

function LeaderboardPage() {
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/leaderboard?top=50&lookback_days=30');
            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard');
            }
            const data = await response.json();
            setLeaderboard(data.leaderboard);
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
            setError('Could not load leaderboard. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const getMedalEmoji = (rank) => {
        switch (rank) {
            case 0: return '🥇';
            case 1: return '🥈';
            case 2: return '🥉';
            default: return rank + 1;
        }
    };

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <button className="back-button" onClick={() => navigate('/')}>
                    ← Back
                </button>
                <h1>Global Leaderboard</h1>
                <p className="subtitle">Top defending groups this month</p>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading rankings...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p>{error}</p>
                    <button className="retry-button" onClick={fetchLeaderboard}>Retry</button>
                </div>
            ) : (
                <div className="leaderboard-content">
                    {leaderboard.length === 0 ? (
                        <div className="empty-state">
                            <p>No active groups yet. Be the first to start a streak!</p>
                        </div>
                    ) : (
                        <>
                            <div className="podium-section">
                                {/* Silver - 2nd Place */}
                                {leaderboard[1] && (
                                    <div className="podium-spot silver">
                                        <div className="pedestal">
                                            <span className="rank">2</span>
                                        </div>
                                        <div className="group-info">
                                            <h3>{leaderboard[1].group_name}</h3>
                                            <p className="streak">🔥 {leaderboard[1].current_streak_days} days</p>
                                        </div>
                                    </div>
                                )}

                                {/* Gold - 1st Place */}
                                {leaderboard[0] && (
                                    <div className="podium-spot gold">
                                        <div className="crown">👑</div>
                                        <div className="pedestal">
                                            <span className="rank">1</span>
                                        </div>
                                        <div className="group-info">
                                            <h3>{leaderboard[0].group_name}</h3>
                                            <p className="streak">🔥 {leaderboard[0].current_streak_days} days</p>
                                        </div>
                                    </div>
                                )}

                                {/* Bronze - 3rd Place */}
                                {leaderboard[2] && (
                                    <div className="podium-spot bronze">
                                        <div className="pedestal">
                                            <span className="rank">3</span>
                                        </div>
                                        <div className="group-info">
                                            <h3>{leaderboard[2].group_name}</h3>
                                            <p className="streak">🔥 {leaderboard[2].current_streak_days} days</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {leaderboard.length > 3 && (
                                <div className="rankings-list">
                                    {leaderboard.slice(3).map((group, index) => (
                                        <div key={group.group_id} className="ranking-item">
                                            <div className="rank-badge">{index + 4}</div>
                                            <div className="group-details">
                                                <h3>{group.group_name}</h3>
                                            </div>
                                            <div className="streak-badge">
                                                🔥 {group.current_streak_days}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default LeaderboardPage;
