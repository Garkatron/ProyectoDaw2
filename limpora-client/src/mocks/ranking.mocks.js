import { http, HttpResponse } from 'msw'
import { mockUser, isAuthenticated } from './base.mocks.js'

// Datos mockeados
const mockTopUsers = [
  {
    id: 1,
    name: 'Provider Pro',
    total_points: 1200,
    completed_appointments: 50,
    cancelled_appointments: 2,
    member_since: '2021-01-10',
    avg_rating: 4.8,
    total_reviews: 120,
  },
  {
    id: 2,
    name: 'Service Master',
    total_points: 980,
    completed_appointments: 40,
    cancelled_appointments: 4,
    member_since: '2022-03-15',
    avg_rating: 4.6,
    total_reviews: 80,
  },
  {
    id: 3,
    name: 'Top Helper',
    total_points: 750,
    completed_appointments: 32,
    cancelled_appointments: 6,
    member_since: '2023-02-01',
    avg_rating: 4.4,
    total_reviews: 45,
  },
]

const calculateMemberYears = (memberSince) =>
  Math.floor(
    (Date.now() - new Date(memberSince).getTime()) /
      (1000 * 60 * 60 * 24 * 365)
  )

export const rankingHandlers = [

  // =========================
  // GET TOP USERS
  // =========================
  http.get('/api/users/top', ({ request }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit')) || 10

    const rankedUsers = mockTopUsers
      .slice(0, limit)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
        member_years: calculateMemberYears(user.member_since),
      }))

    return HttpResponse.json({
      success: true,
      data: rankedUsers,
    })
  }),

  // =========================
  // GET USER RANKING
  // =========================
  http.get('/api/users/:userId/ranking', ({ params }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { userId } = params

    const user = mockTopUsers.find(
      (u) => u.id === Number(userId)
    )

    if (!user) {
      return HttpResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const ranking =
      mockTopUsers
        .sort((a, b) => b.total_points - a.total_points)
        .findIndex((u) => u.id === user.id) + 1

    return HttpResponse.json({
      success: true,
      data: {
        ...user,
        ranking,
        member_years: calculateMemberYears(user.member_since),
      },
    })
  }),
]
