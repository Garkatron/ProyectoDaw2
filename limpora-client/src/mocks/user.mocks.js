import { http, HttpResponse } from 'msw'

/* ---------------- MOCK DATA ---------------- */

const users = [
  {
    id: 1,
    uid: 'firebase-mock-uid',
    name: 'Test User',
    email: 'test@test.com',
    role: 'provider',
  },
  {
    id: 2,
    uid: 'uid-2',
    name: 'Ana Gómez',
    email: 'ana@test.com',
    role: 'client',
  }
]
/* ---------------- HANDLERS ---------------- */

export const userHandlers = [

  /* ===== GET ALL USERS ===== */
  http.get('/api/v1/user', () => {
    return HttpResponse.json({
      success: true,
      data: users
    })
  }),

  /* ===== GET USER BY ID ===== */
  http.get('/api/v1/user/id/:id', ({ params }) => {
    const { id } = params

    if (!id || id === 'undefined') {
      return HttpResponse.json(
        { success: false, message: 'Valid user ID is required' },
        { status: 400 }
      )
    }

    const user = users.find(u => u.id === Number(id))

    if (!user) {
      return HttpResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: user
    })
  }),

  /* ===== GET USER BY UID ===== */
  http.get('/api/v1/user/uid/:uid', ({ params }) => {
    const { uid } = params

    if (!uid || uid === 'undefined') {
      return HttpResponse.json(
        { success: false, message: 'Valid user UID is required' },
        { status: 400 }
      )
    }

    const user = users.find(u => u.uid === uid)

    if (!user) {
      return HttpResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: user
    })
  }),

  /* ===== GET USER BY NAME ===== */
  http.get('/api/v1/user/name/:name', ({ params }) => {
    const { name } = params

    if (!name || name === 'undefined') {
      return HttpResponse.json(
        { success: false, message: 'Valid user name is required' },
        { status: 400 }
      )
    }

    const user = users.find(u =>
      u.name.toLowerCase().includes(name.toLowerCase())
    )

    if (!user) {
      return HttpResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: user
    })
  })
]
