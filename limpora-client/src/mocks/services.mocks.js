import { http, HttpResponse } from 'msw'
import { mockUser, isAuthenticated } from './base.mocks.js'

// DB mock en memoria
let services = [
  { id: 1, name: 'Plomería' },
  { id: 2, name: 'Electricidad' },
  { id: 3, name: 'Limpieza' },
]

// helper
const isAdmin = () => mockUser.role === 'admin'

export const servicesHandlers = [

  // =========================
  // GET /services
  // =========================
  http.get('/api/services', () => {
    return HttpResponse.json(
      {
        success: true,
        data: services,
      },
      { status: 201 }
    )
  }),

  // =========================
  // GET /services/:serviceId
  // =========================
  http.get('/api/services/:serviceId', ({ params }) => {
    const { serviceId } = params

    const service = services.find(
      (s) => s.id === Number(serviceId)
    )

    if (!service) {
      return HttpResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json(
      {
        success: true,
        data: service,
      },
      { status: 201 }
    )
  }),

  // =========================
  // POST /services (ADMIN)
  // =========================
  http.post('/api/services', async ({ request }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (!isAdmin()) {
      return HttpResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    const { name } = await request.json()

    if (!name) {
      return HttpResponse.json(
        { success: false, message: 'Invalid data' },
        { status: 400 }
      )
    }

    const newService = {
      id: services.length + 1,
      name,
    }

    services.push(newService)

    return HttpResponse.json(
      {
        success: true,
        data: newService,
      },
      { status: 201 }
    )
  }),

  // =========================
  // DELETE /services/:serviceId (ADMIN)
  // =========================
  http.delete('/api/services/:serviceId', ({ params }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (!isAdmin()) {
      return HttpResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    const { serviceId } = params
    const id = Number(serviceId)

    const index = services.findIndex((s) => s.id === id)

    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      )
    }

    services.splice(index, 1)

    return HttpResponse.json(
      {
        success: true,
        data: true,
      },
      { status: 201 }
    )
  }),
]
