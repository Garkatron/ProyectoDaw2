import { API } from "./base.service";



export const loginService = async (email, password) => {
  const { data } = await API.post("/auth/login", {
    email,
    password
  });
  return data;
};

export const registerService = async (name, email, password, role) => {
  if (!name || !email || !password) {
    throw new Error("All fields required: Name, Email, Password, Role");
  }

  const { data } = await API.post("/auth/register", {
    name,
    email,
    password,
    role
  }, { withCredentials: true });

  return data;
};

export const getGoogleLoginUrl = () => {
  window.location.href = "/api/v1/auth/google-url";
};
