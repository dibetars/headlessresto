
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home', () => {
  it('renders the main heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', {
      name: /The All-In-One Restaurant Management Platform/i,
    });
    expect(heading).toBeInTheDocument();
  });
});
