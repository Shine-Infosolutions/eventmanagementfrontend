// Session management utility
export const SessionManager = {
  // Check if user is logged in
  isLoggedIn() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const sessionToken = sessionStorage.getItem('token');
    const loginTime = sessionStorage.getItem('loginTime');
    
    if (!token) return false;
    
    // Check if session is still valid (24 hours)
    if (loginTime) {
      const now = Date.now();
      const sessionAge = now - parseInt(loginTime);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge > maxAge) {
        this.clearSession();
        return false;
      }
    }
    
    return true;
  },

  // Get current user
  getUser() {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get token
  getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  },

  // Clear session
  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('loginTime');
  },

  // Refresh session
  refreshSession() {
    const token = this.getToken();
    const user = this.getUser();
    
    if (token && user) {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('loginTime', Date.now().toString());
    }
  }
};