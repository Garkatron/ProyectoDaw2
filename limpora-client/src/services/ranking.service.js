import { API } from "./base.service";

export const getTopUsers = async (limit = 10) => {
  const { data } = await API.get(`/ranking/top?limit=${limit}`);
  return data.data;
};

export const getUserRanking = async (userId) => {
  const { data } = await API.get(`/ranking/user/${userId}`);
  return data.data;
};