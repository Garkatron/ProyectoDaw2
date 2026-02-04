import { API } from "./base.service";

export const sendVerifycationCode = async (code) => {
  const { data } = await API.post(`/auth/vec`, {
    code
  }, { withCredentials: true }
  );
  return data.data;
};

export const sendVerifycationEmail = async (userId, email) => {
  const { data } = await API.post(
    `/auth/sevcode`,
    { id: userId, email },
    { withCredentials: true }
  );
  return data.data;
};
