import { render, screen } from '@testing-library/react';
import LoginPage from './page';

// Mock react-dom useFormState
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormState: () => [{ message: '' }, jest.fn()],
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('LoginPage', () => {
  it('renders the login form', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });
});
