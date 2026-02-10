import { authHandlers } from './auth.mocks';
import { userHandlers } from './user.mocks';
import { userServicesHandlers } from './user_services.mocks';
import { userAppointmentsHandlers } from './user_appointments.mocks';
import { userEarningsHandlers } from './user_earnings.mocks';
import { userReviewsHandlers } from './user_reviews.mocks';
import { servicesHandlers } from './services.mocks';
import { rankingHandlers } from './ranking.mocks';

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...userServicesHandlers,
  ...userAppointmentsHandlers,
  ...userEarningsHandlers,
  ...userReviewsHandlers,
  ...servicesHandlers,
  ...userHandlers,
  ...rankingHandlers,
];
