// Configuration de l'API
export const API_CONFIG = {
  // BASE_URL: 'https://mvcp-cellule.onrender.com',
  BASE_URL: 'http://localhost:4000',
  TIMEOUT: 30000, // 30 secondes
  ENDPOINTS: {
    // Authentication
    AUTH: '/auth',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    RESET_PASSWORD: '/auth/reset-password',
    
    // Users/Pastors
    USERS: '/users',
    PENDING_PASTORS: '/users/pending',
    APPROVE_PASTOR: '/users/approve',
    CELL_LEADERS: '/cell-leaders', 
    
    // Reports
    REPORTS: '/reports',
    
    // Cells
    CELLS: '/cells',
    
    // Groups
    GROUPS: '/groups',
    
    // Districts
    DISTRICTS: '/districts',
    
    // Events
    EVENTS: '/events',
    PUBLIC_EVENTS: '/events/public',
    
    // Resources
    RESOURCES: '/resources',
    
    // Communications
    COMMUNICATIONS: '/communications',
    PENDING_COMMUNICATIONS: '/communications/pending',
    MY_PROPOSALS: '/communications/my-proposals',
    
    // Prayer Requests
    PRAYER_REQUESTS: '/prayer-requests',
    
    // Public
    FEATURED_TESTIMONY: '/public/featured-testimony',
  }
};

// Helper pour construire les URLs complètes
export const buildUrl = (endpoint: string, params?: Record<string, string>): string => {
  const url = new URL(endpoint, API_CONFIG.BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  return url.toString();
};
