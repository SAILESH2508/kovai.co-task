/**
 * Auth service — wraps the /auth/google endpoint.
 */
import api from './api';

export const authService = {
  /**
   * Exchange a Google ID token for an application JWT.
   * @param {string} googleIdToken - The credential returned by Google Identity Services
   * @returns {Promise<{ access_token: string, token_type: string, user: object }>}
   */
  async googleLogin(googleIdToken) {
    const response = await api.post('/auth/google', { token: googleIdToken });
    return response.data;
  },
};
