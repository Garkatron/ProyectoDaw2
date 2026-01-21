import { API } from "./base.service";

export const getUsers = () =>
  API.get("/user", { withCredentials: true });

export const deleteUser = (uid) =>
  API.delete(`/auth/uid/${uid}`, { withCredentials: true });

export const registerUser = (data) =>
  API.post("/auth/register", data, { withCredentials: true });

export const registerAdmin = (data) =>
  API.post("/auth/reg_admin", data, { withCredentials: true });


export const getCurrentUser = async () => {
  const { data } = await API.get("/user/me");
  return data.data;
};

export const getUserByUid = async (uid) => {
  const { data } = await API.get(`/user/uid/${uid}`);
  return data.data;
};

export const getUserByName = async (username) => {
  const { data } = await API.get(`/user/name/${username}`);
  return data.data;
};
