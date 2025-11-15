import React from 'react';
import { render, screen } from '@testing-library/react';
import MainRouter from './mainRouter';

test('renders application shell with navbar and routes', () => {
  render(<MainRouter />);
  // brand/title present
  expect(screen.getByText(/recipe planner/i)).toBeInTheDocument();
  // navbar links present
  expect(screen.getByRole('link', { name: /search/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /favorites/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /meal plans/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /grocery/i })).toBeInTheDocument();
});
