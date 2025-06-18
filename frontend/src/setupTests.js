// frontend/src/setupTests.js
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock;

// Mock fetch for API calls
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
  localStorage.getItem.mockClear();
  localStorage.setItem.mockClear();
  localStorage.removeItem.mockClear();
  localStorage.clear.mockClear();
});