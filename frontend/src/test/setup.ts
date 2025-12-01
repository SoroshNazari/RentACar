import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Mock window.scrollTo
global.scrollTo = jest.fn()

// @ts-ignore
global.TextEncoder = TextEncoder
// @ts-ignore
global.TextDecoder = TextDecoder as any