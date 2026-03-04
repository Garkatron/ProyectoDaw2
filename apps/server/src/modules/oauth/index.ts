import Elysia from "elysia";
import { OAuthService } from "./service";


export const servicesController = new Elysia({ prefix: '/google' })
.post("2", async ({ redirect }) => OAuthService.redirectToGoogle(redirect));