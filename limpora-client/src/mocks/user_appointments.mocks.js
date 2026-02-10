import { http, HttpResponse } from 'msw'
import { isAuthenticated } from './base.mocks.js'
import { APP_COMISSION } from './base.mocks.js'


// “DB” en memoria
let appointments = [
  {
    id: 1,
    date: '2024-01-15T10:00:00.000Z',
    clientId: 1,
    providerId: 2,
    serviceId: 1,
    price: 100,
    comission: APP_COMISSION,
    totalAmount: 110,
    paymentMethod: 'card',
  },
  {
    id: 2,
    date: '2024-02-01T14:00:00.000Z',
    clientId: 1,
    providerId: 3,
    serviceId: 2,
    price: 80,
    comission: APP_COMISSION,
    totalAmount: 88,
    paymentMethod: 'cash',
  },
]

export const userAppointmentsHandlers = [

  // =========================
  // GET /user/appointments/:userId
  // =========================
  http.get('/api/user/appointments/:userId', ({ params }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { userId } = params

    const userAppointments = appointments.filter(
      (a) => a.clientId === Number(userId)
    )

    return HttpResponse.json(
      {
        success: true,
        data: userAppointments,
      },
      { status: 201 }
    )
  }),

  // =========================
  // POST /user/appointments
  // =========================
  http.post('/api/user/appointments', async ({ request }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const {
      date,
      clientId,
      serviceId,
      providerId,
      price,
      paymentMethod,
      totalAmount,
    } = await request.json()

    if (
      !date ||
      !clientId ||
      !serviceId ||
      !providerId ||
      !price ||
      !paymentMethod ||
      !totalAmount
    ) {
      return HttpResponse.json(
        { success: false, message: 'Invalid data' },
        { status: 400 }
      )
    }

    const newAppointment = {
      id: appointments.length + 1,
      date: new Date(date).toISOString(),
      clientId: Number(clientId),
      providerId: Number(providerId),
      serviceId: Number(serviceId),
      price: Number(price),
      comission: APP_COMISSION,
      totalAmount: Number(totalAmount),
      paymentMethod,
    }

    appointments.push(newAppointment)

    return HttpResponse.json(
      {
        success: true,
        data: newAppointment,
      },
      { status: 201 }
    )
  }),
]
