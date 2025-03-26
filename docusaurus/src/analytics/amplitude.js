import * as amplitude from '@amplitude/analytics-browser';

let amplitudeInstance = null;

// Utility to get cookie by name
const getCookie = (name) => {
  if (typeof window !== 'undefined') {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  return null;
};

// Extract the Google Analytics Client ID from the _ga cookie
const getGoogleAnalyticsClientId = () => {
  const gaCookie = getCookie('_ga');
  if (gaCookie) {
    const parts = gaCookie.split('.');
    return parts.length === 4 ? `${parts[2]}.${parts[3]}` : null;
  }
  return null;
};

export const initializeAmplitude = () => {
  // Check if we're already initialized
  if (!amplitudeInstance && process.env.NODE_ENV === 'production') {
    // Extract the Google Analytics Client ID
    const googleAnalyticsClientId = getGoogleAnalyticsClientId();
    if (!googleAnalyticsClientId) {
      console.warn('Google Analytics Client ID not found in cookies.');
    }

    // Initialize Amplitude with the client ID as the deviceId
    amplitudeInstance = amplitude.init(
      '181a95e5a6b8053f7ffb7da9f0ef7ef4', // This key is Public
      googleAnalyticsClientId,
      {
        ...(googleAnalyticsClientId && { deviceId: googleAnalyticsClientId }),
        autocapture: true,
      }
    );
  }
};

export const amplitudeTrack = (eventName, eventProperties) => {
  if (amplitudeInstance) {
    try {
      const googleAnalyticsClientId = getGoogleAnalyticsClientId();
      amplitude.track({
        event_type: eventName,
        deviceId: googleAnalyticsClientId,
        event_properties: eventProperties,
      });
    } catch (error) {
      console.error('Error tracking Amplitude event:', error);
    }
  } else {
    console.error('Amplitude is not initialized.');
  }
};

if (typeof document !== 'undefined') {
  initializeAmplitude();
}
