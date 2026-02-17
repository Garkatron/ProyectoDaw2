import { http, HttpResponse } from 'msw'
import { mockUser, isAuthenticated } from "./base.mocks.js";

export const authHandlers = [

  // =========================
  // LOGIN
  // =========================
  http.post('/api/v1/v1/auth/login', async ({ request }) => {
    const { email, password } = await request.json()

    if (email === 'test@test.com' && password === '123456') {
      isAuthenticated = true

      return HttpResponse.json({
        success: true,
        data: {
          id: mockUser.id,
          uid: mockUser.uid,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
        details: ['Login exitoso'],
      })
    }

    return HttpResponse.json(
      {
        success: false,
        errors: [{ code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas' }],
      },
      { status: 401 }
    )
  }),

  // =========================
  // REGISTER
  // =========================
  http.post('/api/v1/v1/auth/register', async ({ request }) => {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return HttpResponse.json(
        {
          success: false,
          errors: [{ code: 'BAD_REQUEST', message: 'Datos incompletos' }],
        },
        { status: 400 }
      )
    }

    return HttpResponse.json(
      {
        success: true,
        data: {
          id: 2,
          uid: 'firebase-new-mock-uid',
          email,
          role: 'client',
        },
        details: ['Usuario registrado correctamente'],
      },
      { status: 201 }
    )
  }),

  // =========================
  // ME
  // =========================
  http.get('/api/v1/auth/me', () => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: mockUser,
    })
  }),

  // =========================
  // LOGOUT
  // =========================
  http.post('/api/v1/auth/logout', () => {
    isAuthenticated = false

    return HttpResponse.json({
      success: true,
      details: ['Logout exitoso'],
    })
  }),
]
