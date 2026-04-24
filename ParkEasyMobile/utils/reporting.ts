// Error Reporting Utility
// This encapsulates the logic for sending uncaught errors to a production provider
// (e.g. Sentry, Crashlytics, etc.)

/**
 * Low-level helper to dispatch errors to production monitoring services.
 * In a real-world scenario, this would call Sentry.captureException or Firebase Crashlytics.
 */
export const reportError = (error: Error, extra?: any) => {
  // CONFIGURATION FLAG: Change to true once Sentry/Crashlytics is initialized
  const IS_PROVIDER_READY = false;

  if (IS_PROVIDER_READY) {
    // Example: Sentry.captureException(error, { extra });
    return;
  }

  // PRODUCTION FALLBACK: If no remote provider is configured, we must ensure
  // the error is recorded in the device logs or sent to an internal telemetry bridge.
  if (!__DEV__) {
    const diagnosticSource = '[ParkEasyTelemetry]';
    const payload = JSON.stringify({ message: error.message, stack: error.stack, context: extra });
    
    // Emit a loud failure signal to native logs/telemetry to ensure visibility
    console.error(`${diagnosticSource} CRITICAL_UNREPORTED_ERROR: ${payload}`);
    
    // Here we would typically also call a NativeModule to record to persistent storage
    // NativeModules.TelemetryLogger.logCritical(payload);
  }
};

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

  // TODO [TICKET-PE-104]: Integrate Sentry.captureException here for remote crash tracking
  // https://docs.sentry.io/platforms/react-native/
  try {
    // Delegate to the unified reporting helper
    reportError(error, { extra });
  } catch (reportingError) {
    console.error('[Reporting] Failed to dispatch error:', reportingError);
  }
};

export const initReporting = () => {
  if (__DEV__) return;

  /** 
   * PRODUCTION INITIALIZATION POINT:
   * Initialize monitoring services (e.g. Sentry.init()) here.
   * TODO [TICKET-PE-104]: Implement Sentry initialization for production release.
   */
};
