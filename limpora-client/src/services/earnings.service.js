// earnings.service.js
import { API } from "./base.service";

export const getUserEarnings = async (userId) => {
  const { data } = await API.get(`/user/earnings/${userId}`);
  return data.data;
};