// Error Reporting Utility
// This encapsulates the logic for sending uncaught errors to a production provider
// (e.g. Sentry, Crashlytics, etc.)

/**
 * Capture and report an exception to the production monitoring service.
 * @param error The error object to report.
 * @param extra Any extra context information (e.g. componentStack).
 */
export const captureException = (error: Error, extra?: any) => {
  if (__DEV__) {
    // In development, we just log to console to avoid noise
    console.error('[Reporting] DEV: Skipping remote report for:', error.message, extra);
    return;
  }

  try {
    // TODO: Wire up your production provider here
    // Example (Sentry):
    // Sentry.Native.captureException(error, { extra });
    
    // Example (Firebase Crashlytics):
    // crashlytics().recordError(error);

    console.info('[Reporting] PROD: Error would be sent to provider:', error.message);
  } catch (reportingError) {
    console.error('[Reporting] Failed to send error to provider:', reportingError);
  }
};

/**
 * Initialize the error reporting service (call this during app bootstrap).
 */
export const initReporting = () => {
  if (__DEV__) return;

  // TODO: Initialize your provider here
  // Example (Sentry):
  // Sentry.init({ dsn: 'YOUR_SENTRY_DSN' });
};
