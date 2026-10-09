import { apiPost } from '../api/client';

const VISITOR_STORAGE_KEY = 'mesh-analytics-visitor-id';

export const getAnalyticsVisitorId = () => {
  try {
    const existingId = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existingId) return existingId;

    const visitorId = window.crypto.randomUUID();
    window.localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
    return visitorId;
  } catch (error) {
    console.warn('Analytics visitor ID could not be stored:', error);
    return undefined;
  }
};

export const trackAnalyticsEvent = (type, details = {}) => {
  try {
    const visitorId = getAnalyticsVisitorId();
    if (!visitorId) return Promise.resolve();

    return apiPost('/analytics/event', {
      visitorId,
      type,
      ...details,
    }).catch((error) => {
      console.warn('Analytics event could not be recorded:', error);
    });
  } catch (error) {
    console.warn('Analytics event could not be recorded:', error);
    return Promise.resolve();
  }
};
