import { API } from "./base.service";

export const getUserServices = async (userId) => {
    const res = await API.get(`/user/services/${userId}`);
    return res.data.data;
};

export const addUserService = async (userId, service_id, price) => {
    const res = await API.post(`/user/services/${userId}`, {
        service_id,
        price
    });
    return res.data.data;
};


export const deleteUserService = async (userId, service_id) => {
    const res = await API.delete(`/user/services/${userId}/${service_id}`);
    return res.data.data;
};

