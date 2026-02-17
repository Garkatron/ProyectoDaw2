import { API } from "./base.service";
import axios from 'axios';

export const getReviewsByUsername = async (username) => {
  const { data } = await API.get(`/user/reviews/name/${username}`);
  return data.data;
};

export const addReview = async ({ content, rating, userId, providerId }) => {
  const res = await axios.post('/api/v1/user/reviews', 
    { content, rating, userId, providerId }, 
    { withCredentials: true }
  );
  return res.data;
};