import { IdlenessDetector, JwtSessionManager, RefreshableJwtToken } from 'browser-user-session';
import { Scheduler } from 'simple-job-scheduler';
import SessionApi, { SessionCredentials } from '../../api/session/SessionApi';
import { UserWithExpiration } from './User';

const THRESHOLD_IN_MILLIS_TO_DETECT_EXPIRED_SESSION: number = 60 * 1000; // 1 minutes
const LOCAL_STORAGE_CURRENT_SESSION: string = 'user-session';
const HTTP_ERROR_ALREADY_EXPIRED_SESSION_TOKEN: string = 'ALREADY_EXPIRED_SESSION_TOKEN';

export default class SessionService {
  private readonly jwtSessionManager: JwtSessionManager<UserWithExpiration>;

  constructor(
    private readonly sessionApi: SessionApi,
    private readonly scheduler: Scheduler,
    private readonly idlenessDetector: IdlenessDetector,
  ) {
    this.jwtSessionManager = new JwtSessionManager<UserWithExpiration>(
      sessionApi,
      scheduler,
      idlenessDetector,
      {
        localStorageCurrentSession: LOCAL_STORAGE_CURRENT_SESSION,
        thresholdInMillisToDetectExpiredSession: THRESHOLD_IN_MILLIS_TO_DETECT_EXPIRED_SESSION,
        httpErrorAlreadyExpiredSessionToken: HTTP_ERROR_ALREADY_EXPIRED_SESSION_TOKEN,
      },
    );
  }

  // data access

  getSessionToken() {
    return this.jwtSessionManager.getSessionToken();
  }

  getCurrentUser() {
    return this.jwtSessionManager.getCurrentUser();
  }

  isAuthenticated() {
    return this.jwtSessionManager.isAuthenticated();
  }

  // actions

  authenticate(credentials: SessionCredentials) {
    return this
      .sessionApi
      .authenticate(credentials)
      .then((sessionToken: RefreshableJwtToken) => this.jwtSessionManager.registerNewSession(sessionToken));
  }

  disconnect() {
    this.jwtSessionManager.disconnect();
  }

  tryInitializingSessionFromStorage() {
    this.jwtSessionManager.tryInitializingSessionFromStorage();
  }

  synchronizeSessionFromOtherBrowserTags() {
    this.jwtSessionManager.synchronizeSessionFromOtherBrowserTabs();
  }
}
