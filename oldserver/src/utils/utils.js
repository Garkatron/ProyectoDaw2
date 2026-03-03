import googleapijson from "../configs/googleapijson.json" with { type: "json" };


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

import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];

export function getAuthUrl() {
  const oAuth2Client = new google.auth.OAuth2(
    requiredEnv('GOOGLE_CLIENT_ID'),
    requiredEnv('GOOGLE_CLIENT_SECRET'),
    requiredEnv('GOOGLE_REDIRECT_URI')
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',  // permite refresh token
    scope: SCOPES,
    prompt: 'consent',       // fuerza que pida permisos siempre
  });

  return authUrl;
}

export function newGoogleOauth2() {
  return new google.auth.OAuth2(
    requiredEnv('GOOGLE_CLIENT_ID'),
    requiredEnv('GOOGLE_CLIENT_SECRET'),
    requiredEnv('GOOGLE_REDIRECT_URI')
  );
}