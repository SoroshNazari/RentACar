import axios from 'axios'

jest.mock('axios')

import { ApiClient } from '../../src/services/api'

describe('ApiClient', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  const getApi = async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>
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
    // Fallback if ApiClient uses axios directly
    mockedAxios.post = jest.fn().mockResolvedValue(mockResponse) as any
    ;(mockedAxios as any).interceptors = {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    }
    // mockedAxios is used for mocking axios methods

    // Dynamic import after mocking axios.create
    const clientStub = {
      post: jest.fn().mockResolvedValue(mockResponse),
      get: jest.fn(),
      put: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    } as any
    const api = new ApiClient(clientStub)
    return { api, mockResponse }
  }

  describe('login', () => {
    it('stores auth token and role on successful login', async () => {
      const { api } = await getApi()
      localStorage.clear()
      jest.clearAllMocks()

      await api.login('testuser', 'password')

      expect(localStorage.getItem('authToken')).toBeTruthy()
      expect(localStorage.getItem('userRole')).toBe('ROLE_CUSTOMER')
      expect(localStorage.getItem('username')).toBe('testuser')
    })
  })

  describe('logout', () => {
    it('removes auth data from localStorage', async () => {
      localStorage.setItem('authToken', 'token')
      localStorage.setItem('userRole', 'ROLE_CUSTOMER')
      localStorage.setItem('username', 'testuser')

      const { api } = await getApi()
      api.logout()

      expect(localStorage.getItem('authToken')).toBeNull()
      expect(localStorage.getItem('userRole')).toBeNull()
      expect(localStorage.getItem('username')).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('returns true when token exists', async () => {
      localStorage.setItem('authToken', 'token')
      const { api } = await getApi()
      expect(api.isAuthenticated()).toBe(true)
    })

    it('returns false when token does not exist', async () => {
      localStorage.removeItem('authToken')
      const { api } = await getApi()
      expect(api.isAuthenticated()).toBe(false)
    })
  })
})
