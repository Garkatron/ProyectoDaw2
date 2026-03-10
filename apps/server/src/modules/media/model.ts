
import { t, type UnwrapSchema } from "elysia";

export const MediaModel = {
  
    postImageBody: t.Object({
        file: t.File({ format: "image/*" }),
        name: t.String({ minLength: 1, maxLength: 50 }),
        folder: t.String({ minLength: 1, maxLength: 50 }),
    }),
    postImageResponse: t.Object({
        public_url: t.String(),
        id: t.String(),
    }),

    getImageBody: t.Object({
        src: t.String(),
    }),
    getImageResponse: t.Object({
        url: t.String(),
    }),

    fileBody: t.Object({
        file: t.File(),
    }),

    profileParams: t.Object({
        id: t.Numeric(),
    }),

    bannerParams: t.Object({
        id: t.Numeric(),
    }),

    allowedTypes: t.Union([
        t.Literal("image/jpeg"),
        t.Literal("image/png"),
        t.Literal("image/webp"),
    ]),

    maxFileSize: t.Number({ maximum: 5 * 1024 * 1024 }),

    invalidType: t.Literal("Invalid file type. Allowed: image/jpeg, image/png, image/webp"),
    fileTooLarge: t.Literal("File too large. Max: 5242880 bytes"),
    uploadFailed: t.String(),
    incompleteResponse: t.String(),
};


export type MediaModel = {
    [k in keyof typeof MediaModel]: UnwrapSchema<(typeof MediaModel)[k]>;
};
