import { API } from "./base.service";

export const sendVerifycationCode = async (code) => {
  const { data } = await API.get(`/vec`, {
    code
  });
  return data.data;
};

export const sendVerifycationEmail = async (userId, email) => {
  const { data } = await API.get(`/sevcode`, {
    id: userId,
    email
  });
  return data.data;
};