// API Configuration
const API_URL = 'https://9320-2607-ea00-107-3407-ace5-49a2-622-86f3.ngrok-free.app';

// Helper function for API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// API Functions - EXACTLY matching your Swagger UI


// POST /join-group
export async function joinGroup(email, invite_code) {
  return apiRequest('/join-group', {
    method: 'POST',
    body: JSON.stringify({ email, invite_code }),
  });
}

// POST /create-group
export async function createGroup(email, group_name) {
  return apiRequest('/create-group', {
    method: 'POST',
    body: JSON.stringify({ email, group_name }),
  });
}

// GET /groups/{group_id}/status
export async function getGroupStatus(group_id, date = null) {
  const params = date ? `?date=${date}` : '';
  return apiRequest(`/groups/${group_id}/status${params}`);
}


// GET /leaderboard (NOT /group/{code}/leaderboard)
export async function getLeaderboard() {
  return apiRequest('/leaderboard');
}

// GET /groups/{email}
export async function getUserGroups(email) {
  return apiRequest(`/groups/${email}`);
}

// GET /group/{group_code}
export async function getGroup(group_code) {
  return apiRequest(`/group/${group_code}`);
}


