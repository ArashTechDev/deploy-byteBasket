// frontend/src/App.test.js
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Frontend Basic Tests', () => {
  test('testing library is working', () => {
    expect(true).toBe(true);
  });

  test('can create and render DOM elements', () => {
    const TestComponent = () => {
      return <div>Test content</div>;
    };
    
    const { getByText } = render(<TestComponent />);
    expect(getByText('Test content')).toBeInTheDocument();
  });

  test('can render a simple component', () => {
    const TestComponent = () => <div>Hello Test</div>;
    const { getByText } = render(<TestComponent />);
    expect(getByText('Hello Test')).toBeInTheDocument();
  });

  test('environment is set correctly', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('math works correctly', () => {
    expect(2 + 2).toBe(4);
    expect(10 * 5).toBe(50);
  });
});