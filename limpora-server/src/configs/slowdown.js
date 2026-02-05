
export const SLOWDOWN_CONFIG = {
    windowMs: 15 * 60 * 1000,
    delayAfter: 50,
    delayMs: () => 500,
    maxDelayMs: 3000,
    skipSuccessfulRequests: false
};