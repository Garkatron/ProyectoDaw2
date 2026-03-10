import { API } from "../lib/api";
import useImageUpload from "./useImageUpload";

export const useProfileImage = () =>
    useImageUpload(
        () => API.media.me.profile.get(),
        (file) => API.media.me.profile.post({ file })
    );

