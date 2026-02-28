import { API } from "./base.service";
import axios from 'axios';

export const getReviewsByUsername = async (username) => {
  const { data } = await API.get(`/user/reviews/name/${username}`);
  return data.data;
};

export const getReviewsByUserId = (userId) =>
  API.get(`/user/reviews/reviewer/${userId}`).then(r => r.data.data);

export const getReviewsByReviewedId = (userId) =>
  API.get(`/user/reviews/reviewed/${userId}`).then(r => r.data.data);

export const addReview = (data) =>
  API.post(`/user/reviews`, data).then(r => r.data);

export const getAverageRating = (userId) =>
  API.get(`/user/reviews/reviewed/${userId}/average-rating`).then(r => r.data.data);