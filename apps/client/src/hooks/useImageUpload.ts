import { useEffect, useState } from "react";
import { API } from "../lib/api";

type FetchFn = () => Promise<{ data?: { url?: string } | null; error?: unknown }>;
type UploadFn = (file: File) => Promise<{ data?: unknown; error?: { value?: unknown } | null }>;

type UseImageUploadReturn = {
    image: File | null;
    setImage: React.Dispatch<React.SetStateAction<File | null>>;
    submitting: boolean;
    error: string | null;
    handleAdd: (file: File) => Promise<void>;
};

const useImageUpload = (fetchFn: FetchFn, uploadFn: UploadFn): UseImageUploadReturn => {
    const [image, setImage] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchImage = async () => {
        const { data, error } = await fetchFn();
        if (data?.url) {
            try {
                const url = `${data.url}?t=${Date.now()}`;
                const response = await fetch(url);
                const blob = await response.blob();
                setImage(new File([blob], "image", { type: blob.type }));
            } catch {
                setImage(null);
            }
        } else {
            setImage(null);
        }
    };

    useEffect(() => {
        fetchImage();
    }, []);

    const handleAdd = async (file: File) => {
        setSubmitting(true);
        setError(null);
        const { error } = await uploadFn(file);
        if (error) {
            setError(
                typeof error.value === "string"
                    ? error.value
                    : "Error uploading image.",
            );
        } else {
            await fetchImage();
        }
        setSubmitting(false);
    };

    return { image, setImage, submitting, handleAdd, error };
};

export default useImageUpload;