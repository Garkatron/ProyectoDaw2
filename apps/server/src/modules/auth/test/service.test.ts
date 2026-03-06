// ? This file aims to test the Auth service (Unit testing).

import { describe, it, expect, mock, beforeEach, spyOn } from "bun:test";
import { AuthService } from "../service";
import { AuthQueries } from "../queries";
import { NotificationService } from "../../notification/service";
import { firebaseAuth } from "../../../libs/firebase";
import { treaty } from "@elysiajs/eden";
import { authController } from "..";
import { UserRole } from "@limpora/common/*";

const app = treaty(authController);

mock.module("../../../libs/firebase", () => ({
    firebaseAuth: {
        createUser: mock(() => Promise.resolve({ uid: "firebase-uid-123" })),
        setCustomUserClaims: mock(() => Promise.resolve()),
        getUser: mock(() =>
            Promise.resolve({
                uid: "firebase-uid-123",
                email: "test@test.com",
            }),
        ),
        verifyIdToken: mock(() => Promise.resolve({ uid: "firebase-uid-123" })),
        revokeRefreshTokens: mock(() => Promise.resolve()),
    },
}));

describe("AuthController", () => {
    describe("POST /auth/register", () => {
        it("Should return 200 with a created user", async () => {
            spyOn(AuthService, "register").mockResolvedValue({
                username: "testuser",
                email: "test@test.com",
            });

            const { data, status } = await app.auth.register.post({
                username: "testuser",
                email: "test@test.com",
                password: "password123",
                role: UserRole.Client,
            });

            expect(status).toBe(200);
            expect(data?.email).toBe("test@test.com");
        });
    });
});
