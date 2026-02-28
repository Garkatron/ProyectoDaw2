import { API } from "./base.service";


export const getAllServices = async () => {
    const res = await API.get(`/services`);
    return res.data.data;
}