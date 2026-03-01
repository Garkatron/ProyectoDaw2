import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId:    Bun.env.FIREBASE_PROJECT_ID,
            clientEmail:  Bun.env.FIREBASE_CLIENT_EMAIL,
            privateKey:   Bun.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    })
}

export const firebaseAuth = getAuth()
