import * as amplitude from '@amplitude/analytics-browser';

let amplitudeInstance = null;

// Utility to get cookie by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Extract the Google Analytics Client ID from the _ga cookie
const getGoogleAnalyticsClientId = () => {
  const gaCookie = getCookie('_ga');
  if (gaCookie) {
    const parts = gaCookie.split('.');
    return parts.length === 4 ? `${parts[2]}.${parts[3]}` : null;
  }
  return 'localhost';
};

export const initializeAmplitude = () => {
  const apiKey = process.env.REACT_APP_AMPLITUDE_API_KEY;

  // Check if we're already initialized
  if (!amplitudeInstance) {
    // Extract the Google Analytics Client ID
    const googleAnalyticsClientId = getGoogleAnalyticsClientId();
    if (!googleAnalyticsClientId) {
      console.warn('Google Analytics Client ID not found in cookies.');
    }

    // Initialize Amplitude with the client ID as the deviceId
    amplitudeInstance = amplitude.init(apiKey, googleAnalyticsClientId, {
      deviceId: googleAnalyticsClientId, // Fallback to default deviceId if GA ID is not found
      autocapture: true,
    });
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

initializeAmplitude();
