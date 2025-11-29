import { api } from '../api'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('ApiClient', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('login', () => {
    it('stores auth token and role on successful login', async () => {
      const mockResponse = {
        data: {
          username: 'testuser',
          roles: ['ROLE_CUSTOMER'],
          authenticated: true,
        },
      }

      mockedAxios.create = jest.fn(() => ({
        post: jest.fn().mockResolvedValue(mockResponse),
        get: jest.fn(),
        put: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      })) as any

      await api.login('testuser', 'password')

      expect(localStorage.getItem('authToken')).toBeTruthy()
      expect(localStorage.getItem('userRole')).toBe('ROLE_CUSTOMER')
      expect(localStorage.getItem('username')).toBe('testuser')
    })
  })

  describe('logout', () => {
    it('removes auth data from localStorage', () => {
      localStorage.setItem('authToken', 'token')
      localStorage.setItem('userRole', 'ROLE_CUSTOMER')
      localStorage.setItem('username', 'testuser')

      api.logout()

      expect(localStorage.getItem('authToken')).toBeNull()
      expect(localStorage.getItem('userRole')).toBeNull()
      expect(localStorage.getItem('username')).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('returns true when token exists', () => {
      localStorage.setItem('authToken', 'token')
      expect(api.isAuthenticated()).toBe(true)
    })

    it('returns false when token does not exist', () => {
      localStorage.removeItem('authToken')
      expect(api.isAuthenticated()).toBe(false)
    })
  })
})

