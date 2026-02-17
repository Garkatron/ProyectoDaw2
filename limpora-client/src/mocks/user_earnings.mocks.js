import { http, HttpResponse } from 'msw'
import { isAuthenticated, mockUser } from './base.mocks.js'
import { ROLES } from './base.mocks.js'

const mockEarningsByUser = {
  1: {       
    total: 1250,
    month: 420,
    year: 1250,
  },
}

const mockClosedAppointmentsByUser = {
  1: [          
    {
      id: 10,
      date: '2024-01-10T10:00:00.000Z',
      serviceId: 1,
      clientId: 5,
      price: 100,
      commission: 10,
      totalAmount: 90,
      status: 'closed',
    },
    {
      id: 11,
      date: '2024-02-02T15:00:00.000Z',
      serviceId: 2,
      clientId: 3,
      price: 80,
      commission: 8,
      totalAmount: 72,
      status: 'closed',
    },
  ],
}

const hasValidRole = () =>
  [ROLES.ADMIN, ROLES.PROVIDER].includes(mockUser.role)

export const userEarningsHandlers = [

  http.get('/api/v1/user/earnings/:userId', ({ params }) => {  
    if (!isAuthenticated) {
      return HttpResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (!hasValidRole()) {
      return HttpResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    const { userId } = params  

    const earnings = mockEarningsByUser[userId] ?? { total: 0, month: 0, year: 0 }
    const appointments = mockClosedAppointmentsByUser[userId] ?? []

    return HttpResponse.json(
      { success: true, data: { earnings, appointments } },
      { status: 200 }
    )
  }),
]