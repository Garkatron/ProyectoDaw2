import { API } from "../lib/api";
import useImageUpload from "./useImageUpload";

export const useProfileImageMe = () =>
    useImageUpload(
        () => API.media.me.profile.get(),
        (file) => API.media.me.profile.post({ file })
    );

export const useProfileImage = (id: number) =>
    useImageUpload(
        () => API.media.profile({ id }).get(),
        () => Promise.reject(new Error("Cannot upload profile image without authentication.")),
    );