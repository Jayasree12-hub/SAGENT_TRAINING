import axios from 'axios'

export const API_BASE_URL = 'http://localhost:8081'
export const VENDOR_API_BASE_URL = API_BASE_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

const vendorApi = axios.create({
  baseURL: VENDOR_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every protected request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

vendorApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally and redirect to login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

vendorApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/vendor/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  verifyOtp: (data) => api.post('/api/auth/verify-otp', data),
  resendOtp: (data) => api.post('/api/auth/resend-otp', data),
  vendorRegister: (data) => vendorApi.post('/api/vendors/register', data),
  vendorLogin: (data) => vendorApi.post('/api/vendors/login', data),
}

export const eventsApi = {
  getAll: () => api.get('/api/events'),
  getById: (id) => api.get(`/api/events/${id}`),
  getByOrganizer: (organizerId) => api.get(`/api/events/organizer/${organizerId}`),
  create: (data) => api.post('/api/events', data),
  update: (id, data) => api.put(`/api/events/${id}`, data),
  delete: (id) => api.delete(`/api/events/${id}`),
}

export const guestsApi = {
  getAll: () => api.get('/api/guests'),
  getByEvent: (eventId) => api.get(`/api/guests/event/${eventId}`),
  create: (data) => api.post('/api/guests', data),
  update: (id, data) => api.put(`/api/guests/${id}`, data),
  delete: (id) => api.delete(`/api/guests/${id}`),
}

export const invitationsApi = {
  getAll: () => api.get('/api/invitations'),
  getByEvent: (eventId) => api.get(`/api/invitations/event/${eventId}`),
  create: (data) => api.post('/api/invitations', data),
  update: (id, data) => api.put(`/api/invitations/${id}`, data),
  delete: (id) => api.delete(`/api/invitations/${id}`),
}

export const rsvpApi = {
  respond: (data) => api.post('/api/rsvp/respond', data),
  getByEvent: (eventId) => api.get(`/api/rsvp/event/${eventId}`),
  getEventResponses: (eventId) => api.get(`/api/event/${eventId}/responses`),
}

export const tasksApi = {
  getAll: () => api.get('/api/tasks'),
  getByEvent: (eventId) => api.get(`/api/tasks/event/${eventId}`),
  getAssigned: (userId) => api.get(`/api/tasks/assigned/${userId}`),
  getAssignedMe: () => api.get('/api/tasks/assigned/me'),
  accept: (taskId) => api.post(`/api/tasks/${taskId}/accept`),
  reject: (taskId, data) => api.post(`/api/tasks/${taskId}/reject`, data),
  complete: (taskId) => api.post(`/api/tasks/${taskId}/complete`),
  teamMemberDashboard: () => api.get('/api/dashboard/team-member'),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.put(`/api/tasks/${id}`, data),
  delete: (id) => api.delete(`/api/tasks/${id}`),
}

export const budgetsApi = {
  getAll: () => api.get('/api/budgets'),
  getByEvent: (eventId) => api.get(`/api/budgets/event/${eventId}`),
  create: (data) => api.post('/api/budgets', data),
  update: (id, data) => api.put(`/api/budgets/${id}`, data),
  delete: (id) => api.delete(`/api/budgets/${id}`),
}

export const vendorsApi = {
  getAll: () => api.get('/api/vendors'),
  getById: (id) => api.get(`/api/vendors/${id}`),
  getByUser: (userId) => api.get(`/api/vendors/user/${userId}`),
  create: (data) => api.post('/api/vendors', data),
  update: (id, data) => api.put(`/api/vendors/${id}`, data),
}

export const vendorProfileApi = {
  getAll: () => vendorApi.get('/api/vendors'),
  getById: (id) => vendorApi.get(`/api/vendors/${id}`),
  getByUser: (userId) => vendorApi.get(`/api/vendors/user/${userId}`),
  create: (data) => vendorApi.post('/api/vendors', data),
  update: (id, data) => vendorApi.put(`/api/vendors/${id}`, data),
}

export const vendorEventVendorsApi = {
  getAll: () => vendorApi.get('/api/event-vendors'),
  getByEvent: (eventId) => vendorApi.get(`/api/event-vendors/event/${eventId}`),
  getByVendor: (vendorId) => vendorApi.get(`/api/event-vendors/vendor/${vendorId}`),
}

export const usersApi = {
  getAll: () => api.get('/api/users'),
  getByRole: (role) => api.get(`/api/users/role/${role}`),
}

export const eventMembersApi = {
  getByEvent: (eventId) => api.get(`/api/event-members/event/${eventId}`),
  create: (data) => api.post('/api/event-members', data),
  update: (id, data) => api.put(`/api/event-members/${id}`, data),
  delete: (id) => api.delete(`/api/event-members/${id}`),
}

export const notificationsApi = {
  getByUser: (userId) => api.get(`/api/notifications/user/${userId}`),
  getUnread: (userId) => api.get(`/api/notifications/user/${userId}/unread`),
  getMyUnread: () => api.get('/api/notifications/me/unread'),
  getMyNotifications: () => api.get('/api/notifications/me'),
  markRead: (id) => api.patch(`/api/notifications/${id}/read`),
}

export const chatApi = {
  getInbox: () => api.get('/api/chat/inbox'),
  getEvents: () => api.get('/api/chat/events'),
  getMembers: (eventId) => api.get(`/api/chat/events/${eventId}/members`),
  getGroupMessages: (eventId) => api.get(`/api/chat/events/${eventId}/group/messages`),
  sendGroupMessage: (eventId, data) => api.post(`/api/chat/events/${eventId}/group/messages`, data),
  deleteGroup: (eventId) => api.delete(`/api/chat/events/${eventId}/group`),
  getDirectMessages: (userId) => api.get(`/api/chat/dm/${userId}`),
  sendDirectMessage: (userId, data) => api.post(`/api/chat/dm/${userId}`, data),
  streamUrl: (token) => `${API_BASE_URL}/api/chat/stream?token=${encodeURIComponent(token)}`,
}

export default api
