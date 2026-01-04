/**
 * Safely retrieves a required environment variable from process.env.
 *
 * Throws an error if the specified environment variable is missing or empty.
 *
 * @param {string} name - The name of the environment variable.
 * @returns {string} The value of the environment variable.
 * @throws {Error} If the environment variable is not defined.
 */
export function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}
