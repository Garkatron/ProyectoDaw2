
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
    src: t.String()
  }),
  getImageResponse: t.Object({
    url: t.String()
  }),

  
  fileBody: t.Object({
    file: t.File(),
  }),


};


export type MediaModel = {
    [k in keyof typeof MediaModel]: UnwrapSchema<(typeof MediaModel)[k]>;
};
