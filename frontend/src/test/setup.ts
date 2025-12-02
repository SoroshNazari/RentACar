import '@testing-library/jest-dom'

// CORS für jsdom erlauben (für Integration Tests)
if (typeof window !== 'undefined') {
  // @ts-expect-error - Override XMLHttpRequest for tests
  window.XMLHttpRequest = class extends XMLHttpRequest {
    open(
      method: string,
      url: string | URL,
      async?: boolean,
      user?: string | null,
      password?: string | null
    ) {
      // Erlaube Cross-Origin Requests für Integration Tests
      super.open(method, url, async, user, password)
      // Setze CORS-Header wenn möglich
      if (url.toString().includes('127.0.0.1:8081') || url.toString().includes('localhost:8081')) {
        // @ts-expect-error - Property assignment for tests
        this.withCredentials = false
      }
    }
  }
}
import { TextEncoder, TextDecoder } from 'util'

// Mock window.scrollTo
global.scrollTo = jest.fn()

// @ts-expect-error - Global assignment for test environment
global.TextEncoder = TextEncoder
// @ts-expect-error - Global assignment for test environment
global.TextDecoder = TextDecoder

      password?: string | null
    ) {
      // Erlaube Cross-Origin Requests für Integration Tests
      super.open(method, url, async, user, password)
      // Setze CORS-Header wenn möglich
      if (url.toString().includes('127.0.0.1:8081') || url.toString().includes('localhost:8081')) {
        // @ts-expect-error - Property assignment for tests
        this.withCredentials = false
      }
    }
  }
}
import { TextEncoder, TextDecoder } from 'util'

// Mock window.scrollTo
global.scrollTo = jest.fn()

// @ts-expect-error - Global assignment for test environment
global.TextEncoder = TextEncoder
// @ts-expect-error - Global assignment for test environment
global.TextDecoder = TextDecoder
