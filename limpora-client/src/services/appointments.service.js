import { API } from "./base.service";

export const getAppointments = async (id) => {
  const { data } = await API.get(`/user/appointments/user/${id}`, { withCredentials: true });
  return data.data;
};

export const getProviderAppointments = async (id) => {
  const { data } = await API.get(`/user/appointments/provider/${id}`, { withCredentials: true });
  return data.data;
};


export const getUserServiceById = async (id, serviceId) => {
  const { data } = await API.get(`/user/appointments/${id}/${serviceId}`, { withCredentials: true });
  return data.data;
};

export const addAppointment = async ({ date, clientId, serviceId, providerId, price, paymentMethod, totalAmount }) => {
  const { data } = await API.post(
    `/user/appointments`,
    { date, clientId, serviceId, providerId, price, paymentMethod, totalAmount },
    { withCredentials: true }
  );
  return data.data;
};

export const addUserService = async (id, serviceId, price, isActive) => {
  const { data } = await API.post(
    `/user/appointments/${id}`,
    { service_id: serviceId, is_active: isActive, price },
    { withCredentials: true }
  );
  return data.data;
};

export const updateUserService = async (id, serviceId, price, isActive) => {
  const { data } = await API.patch(
    `/user/appointments/${id}/${serviceId}`,
    { is_active: isActive, price },
    { withCredentials: true }
  );
  return data.data;
};

export const deleteUserService = async (id, serviceId) => {
  const { data } = await API.patch(
    `/user/appointments/${id}/${serviceId}`,
    { withCredentials: true }
  );
  return data.data;
};