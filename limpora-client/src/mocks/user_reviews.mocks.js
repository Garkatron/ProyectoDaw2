import { http, HttpResponse } from 'msw'
import { isAuthenticated, mockUser } from './base.mocks.js'


// =========================
// Mock DB
// =========================
let reviews = [
  {
    id: 1,
    content: 'Excelente servicio',
    rating: 5,
    userId: 1,
    providerId: 2,
    client_name: 'Juan',
  },
  {
    id: 2,
    content: 'Muy bueno, recomendado',
    rating: 4,
    userId: 3,
    providerId: 2,
    client_name: 'María',
  },
  {
    id: 3,
    content: 'Podría mejorar',
    rating: 3,
    userId: 1,
    providerId: 3,
    client_name: 'Juan',
  },
]

const usersByName = {
  juan: { id: 1, name: 'Juan' },
  maria: { id: 3, name: 'María' },
}

const hasReviewRole = () =>
  [ROLES.ADMIN, ROLES.CLIENT].includes(mockUser.role)

// =========================
// Helpers
// =========================
const average = (arr) =>
  arr.length === 0
    ? 0
    : Number(
        (
          arr.reduce((sum, r) => sum + r.rating, 0) / arr.length
        ).toFixed(2)
      )

// =========================
// Handlers
// =========================
export const userReviewsHandlers = [

  // -------------------------------------------------
  // GET /user/reviews
  // -------------------------------------------------
  http.get('/api/user/reviews', () => {
    return HttpResponse.json(
      {
        success: true,
        data: reviews,
        message: reviews.length === 0 ? 'No reviews yet' : undefined,
      },
      { status: 200 }
    )
  }),

  // -------------------------------------------------
  // GET /user/reviews/user/:userId
  // -------------------------------------------------
  http.get('/api/user/reviews/user/:userId', ({ params }) => {
    const userId = Number(params.userId)

    if (isNaN(userId)) {
      return HttpResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const result = reviews.filter((r) => r.userId === userId)

    return HttpResponse.json(
      {
        success: true,
        data: result,
        message: result.length === 0 ? 'No reviews for this user' : undefined,
      },
      { status: 200 }
    )
  }),

  // -------------------------------------------------
  // GET /user/reviews/provider/:providerId
  // -------------------------------------------------
  http.get('/api/user/reviews/provider/:providerId', ({ params }) => {
    const providerId = Number(params.providerId)

    const result = reviews.filter(
      (r) => r.providerId === providerId
    )

    return HttpResponse.json(
      { success: true, data: result },
      { status: 201 }
    )
  }),

  // -------------------------------------------------
  // GET /user/reviews/provider/:providerId/average-rating
  // -------------------------------------------------
  http.get(
    '/api/user/reviews/provider/:providerId/average-rating',
    ({ params }) => {
      const providerId = Number(params.providerId)

      const providerReviews = reviews.filter(
        (r) => r.providerId === providerId
      )

      return HttpResponse.json(
        {
          success: true,
          data: {
            average: average(providerReviews),
            total_reviews: providerReviews.length,
          },
        },
        { status: 201 }
      )
    }
  ),

  // -------------------------------------------------
  // POST /user/reviews
  // -------------------------------------------------
  http.post('/api/user/reviews', async ({ request }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (!hasReviewRole()) {
      return HttpResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    const { content, rating, userId, providerId } =
      await request.json()

    if (!content || !rating || !userId || !providerId) {
      return HttpResponse.json(
        { success: false, message: 'Invalid data' },
        { status: 400 }
      )
    }

    const newReview = {
      id: reviews.length + 1,
      content,
      rating: Number(rating),
      userId: Number(userId),
      providerId: Number(providerId),
      client_name: mockUser.name ?? 'Anonymous',
    }

    reviews.push(newReview)

    return HttpResponse.json(
      { success: true, data: newReview },
      { status: 201 }
    )
  }),

  // -------------------------------------------------
  // GET /user/reviews/name/:username
  // -------------------------------------------------
  http.get('/api/user/reviews/name/:username', ({ params }) => {
    const username = params.username.toLowerCase()
    const user = usersByName[username]

    if (!user) {
      return HttpResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const result = reviews
      .filter((r) => r.userId === user.id)
      .map((r) => ({
        id: r.id,
        reviewer: r.client_name,
        rating: r.rating,
        text: r.content,
        avatarColor: 'bg-indigo-100',
      }))

    return HttpResponse.json(
      { success: true, data: result },
      { status: 200 }
    )
  }),
]
