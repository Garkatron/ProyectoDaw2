import { API } from "./base.service";

export const getReviewsByUsername = async (username) => {
  const { data } = await API.get(`/user/reviews/name/${username}`);
  return data.data;
};