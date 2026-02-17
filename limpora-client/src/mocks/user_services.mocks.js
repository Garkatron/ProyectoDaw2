import { http, HttpResponse } from 'msw'
import { isAuthenticated, mockUser } from './base.mocks.js'
import { ROLES } from './base.mocks.js'

// =========================
// Mock DB (user ↔ services)
// =========================
let userServices = [
  {
    userId: 2,
    serviceId: 1,
    name: 'Plomería',
    price: 100,
    is_active: true,
  },
  {
    userId: 2,
    serviceId: 2,
    name: 'Electricidad',
    price: 120,
    is_active: true,
  },
]

// Helpers
const hasPermission = () =>
  [ROLES.ADMIN, ROLES.PROVIDER].includes(mockUser.role)

// =========================
// Handlers
// =========================
export const userServicesHandlers = [

  // -------------------------------------------------
  // GET /user/services/:userId
  // -------------------------------------------------
  http.get('/api/v1/user/services/:userId', ({ params }) => {
    const userId = Number(params.userId)

    if (isNaN(userId)) {
      return HttpResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const services = userServices.filter(
      (s) => s.userId === userId
    )

    return HttpResponse.json(
      {
        success: true,
        data: services,
        message:
          services.length === 0
            ? 'User has no services yet'
            : undefined,
      },
      { status: 200 }
    )
  }),

  // -------------------------------------------------
  // GET /user/services/:userId/:serviceId
  // -------------------------------------------------
  http.get('/api/v1/user/services/:userId/:serviceId', ({ params }) => {
    const userId = Number(params.userId)
    const serviceId = Number(params.serviceId)

    if (isNaN(userId) || isNaN(serviceId)) {
      return HttpResponse.json(
        { success: false, message: 'Invalid user ID or service ID' },
        { status: 400 }
      )
    }

    const service = userServices.find(
      (s) => s.userId === userId && s.serviceId === serviceId
    )

    if (!service) {
      return HttpResponse.json(
        { success: false, message: 'Service not found for this user' },
        { status: 404 }
      )
    }

    return HttpResponse.json(
      { success: true, data: service },
      { status: 200 }
    )
  }),

  // -------------------------------------------------
  // POST /user/services/:userId
  // -------------------------------------------------
  http.post('/api/v1/user/services/:userId', async ({ params, request }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (!hasPermission()) {
      return HttpResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    const userId = Number(params.userId)
    const { service_id, price, is_active = true } =
      await request.json()

    if (!service_id || price === undefined) {
      return HttpResponse.json(
        { success: false, message: 'service_id and price are required' },
        { status: 400 }
      )
    }

    const serviceId = Number(service_id)
    const servicePrice = Number(price)

    if (
      isNaN(userId) ||
      isNaN(serviceId) ||
      isNaN(servicePrice) ||
      servicePrice < 0
    ) {
      return HttpResponse.json(
        { success: false, message: 'Invalid service_id or price' },
        { status: 400 }
      )
    }

    const exists = userServices.some(
      (s) => s.userId === userId && s.serviceId === serviceId
    )

    if (exists) {
      return HttpResponse.json(
        { success: false, message: 'User already offers this service' },
        { status: 409 }
      )
    }

    const newService = {
      userId,
      serviceId,
      name: `Service ${serviceId}`,
      price: servicePrice,
      is_active,
    }

    userServices.push(newService)

    return HttpResponse.json(
      {
        success: true,
        data: newService,
        message: 'Service added successfully',
      },
      { status: 201 }
    )
  }),

  // -------------------------------------------------
  // PATCH /user/services/:userId/:serviceId
  // -------------------------------------------------
  http.patch(
    '/api/v1/user/services/:userId/:serviceId',
    async ({ params, request }) => {
      if (!isAuthenticated) {
        return HttpResponse.json(
          { success: false, message: 'Not authenticated' },
          { status: 401 }
        )
      }

      if (!hasPermission()) {
        return HttpResponse.json(
          { success: false, message: 'Forbidden' },
          { status: 403 }
        )
      }

      const userId = Number(params.userId)
      const serviceId = Number(params.serviceId)
      const data = await request.json()

      if (isNaN(userId) || isNaN(serviceId)) {
        return HttpResponse.json(
          { success: false, message: 'Invalid user ID or service ID' },
          { status: 400 }
        )
      }

      if (data.price === undefined && data.is_active === undefined) {
        return HttpResponse.json(
          {
            success: false,
            message:
              'At least one field (price or is_active) is required',
          },
          { status: 400 }
        )
      }

      const service = userServices.find(
        (s) => s.userId === userId && s.serviceId === serviceId
      )

      if (!service) {
        return HttpResponse.json(
          { success: false, message: 'Service not found for this user' },
          { status: 404 }
        )
      }

      if (data.price !== undefined) {
        const price = Number(data.price)
        if (isNaN(price) || price < 0) {
          return HttpResponse.json(
            { success: false, message: 'Invalid price value' },
            { status: 400 }
          )
        }
        service.price = price
      }

      if (data.is_active !== undefined) {
        service.is_active = Boolean(data.is_active)
      }

      return HttpResponse.json(
        {
          success: true,
          data: service,
          message: 'Service updated successfully',
        },
        { status: 200 }
      )
    }
  ),

  // -------------------------------------------------
  // DELETE /user/services/:userId/:serviceId
  // -------------------------------------------------
  http.delete(
    '/api/v1/user/services/:userId/:serviceId',
    ({ params }) => {
      if (!isAuthenticated) {
        return HttpResponse.json(
          { success: false, message: 'Not authenticated' },
          { status: 401 }
        )
      }

      if (!hasPermission()) {
        return HttpResponse.json(
          { success: false, message: 'Forbidden' },
          { status: 403 }
        )
      }

      const userId = Number(params.userId)
      const serviceId = Number(params.serviceId)

      const index = userServices.findIndex(
        (s) => s.userId === userId && s.serviceId === serviceId
      )

      if (index === -1) {
        return HttpResponse.json(
          { success: false, message: 'Service not found for this user' },
          { status: 404 }
        )
      }

      userServices.splice(index, 1)

      return HttpResponse.json(
        {
          success: true,
          message: 'Service deleted successfully',
          data: { userId, serviceId },
        },
        { status: 200 }
      )
    }
  ),
]
