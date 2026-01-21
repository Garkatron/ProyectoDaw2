import { API } from "./base.service";



export const loginService = async (email, password) => {
  const { data } = await API.post("/auth/login", {
    email,
    password
  });
  return data;
};

export const registerService = async (name, email, password, role) => {
  try {
    const { data } = await API.post("/auth/register", {
      name,
      email,
      password,
      role
    });

    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.errors?.[0] ||
      error.message ||
      "Register failed";

    throw new Error(errorMessage);
  }
};

export const getGoogleLoginUrl = () => {
  window.location.href = "/api/v1/auth/google-url";
};
