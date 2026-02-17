import { setupWorker } from 'msw/browser';
import { handlers } from './handlers.mocks.js';

export const mocksWorker = setupWorker(...handlers);