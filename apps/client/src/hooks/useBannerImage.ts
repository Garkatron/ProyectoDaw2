import { API } from "../lib/api";
import useImageUpload from "./useImageUpload";

export const useBannerImageMe = () =>
    useImageUpload(
        () => API.media.me.banner.get(),
        (file) => API.media.me.banner.post({ file })
    );