// In development, use relative URLs to leverage Vite proxy
// In production, use the configured API base URL
// Force relative URLs in development (when running via Vite dev server)
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = (isDevelopment ? '' : import.meta.env.VITE_API_BASE_URL) || '';

/**
 * Generic API request handler
 */
async function apiRequest(endpoint, options = {}) {
  const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Log the request for debugging
  console.log(`[API] ${config.method || 'GET'} ${url}`, config.body ? JSON.parse(config.body) : '');

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    console.error(`Failed to fetch ${config.method || 'GET'} ${url}`);
    
    // Provide more helpful error messages
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      const backendUrl = API_BASE_URL || 'http://localhost:8000 (via proxy)';
      throw new Error(`Cannot connect to backend at ${backendUrl}. Make sure your FastAPI server is running and the dev server was restarted after proxy configuration.`);
    }
    throw error;
  }
}

/**
 * POST /join-group
 * Join an existing group using an invite code
 */
export async function joinGroup(inviteCode, email) {
  return apiRequest('/join-group', {
    method: 'POST',
    body: JSON.stringify({
      invite_code: inviteCode,
      email: email,
    }),
  });
}

/**
 * POST /create-group (ASSUMED - NOT YET IN BACKEND)
 * Create a new group
 * Expected request: { name: string, daily_limit_minutes: number, creator_email: string }
 * Expected response: { group_id: string, group_code: string, name: string, daily_limit_minutes: number }
 */
export async function createGroup(name, dailyLimitMinutes, creatorEmail) {
  return apiRequest('/create-group', {
    method: 'POST',
    body: JSON.stringify({
      name,
      daily_limit_minutes: dailyLimitMinutes,
      creator_email: creatorEmail,
    }),
  });
}

/**
 * GET /groups/{group_id}/status
 * Get current status of a group (health, usage, members)
 */
export async function getGroupStatus(groupId, date = null) {
  const params = date ? `?date=${date}` : '';
  return apiRequest(`/groups/${groupId}/status${params}`);
}

/**
 * GET /groups/{group_id}/streak
 * Get the current streak for a group
 */
export async function getGroupStreak(groupId, lookbackDays = 90) {
  return apiRequest(`/groups/${groupId}/streak?lookback_days=${lookbackDays}`);
}

/**
 * GET /leaderboard
 * Get global leaderboard of all groups
 */
export async function getLeaderboard(top = 10, lookbackDays = 90) {
  return apiRequest(`/leaderboard?top=${top}&lookback_days=${lookbackDays}`);
}

/**
 * GET /groups/{email} (ASSUMED - NOT YET IN BACKEND)
 * Get all groups for a given email
 * Expected response: [{ group_id: string, group_name: string, daily_limit_minutes: number, invite_code: string }]
 */
export async function getGroupsForEmail(email) {
  return apiRequest(`/groups/${email}`);
}

/**
 * GET /group/{group_code} (ASSUMED - NOT YET IN BACKEND)
 * Get basic group info by invite code
 * Expected response: { group_id: string, name: string, daily_limit_minutes: number, invite_code: string }
 */
export async function getGroupByCode(groupCode) {
  return apiRequest(`/group/${groupCode}`);
}

/**
 * POST /ingest
 * Submit usage data for a user
 */
export async function ingestUsage(email, logDate, usageBlob) {
  return apiRequest('/ingest', {
    method: 'POST',
    body: JSON.stringify({
      email,
      log_date: logDate,
      usage_blob: usageBlob,
    }),
  });
}
