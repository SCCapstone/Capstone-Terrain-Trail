import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Explore from '../pages/Explore'; 
import { ThemeProvider } from '../theme/ThemeContext';
import { SnackbarProvider } from '../components/Snackbar';
import '@testing-library/jest-dom';

jest.mock(
  'react-router-dom',
  () => ({
    MemoryRouter: ({ children }) => <>{children}</>,
    Link: ({ to, children, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
    useNavigate: () => jest.fn(),
    useLocation: () => ({ state: null }),
  }),
  { virtual: true }
);

import { MemoryRouter } from 'react-router-dom';

// 1. Mock the Google Maps API Globals
global.google = {
  maps: {
    TravelMode: {
      WALKING: 'WALKING',
      DRIVING: 'DRIVING',
      BICYCLING: 'BICYCLING',
    },
    DirectionsService: class {},
    DirectionsRenderer: () => <div data-testid="directions-renderer" />,
    Map: class {
      fitBounds() {}
    },
  },
};

// 2. Mock the Google Maps React Component 
jest.mock('@react-google-maps/api', () => ({
  GoogleMap: ({ children }) => <div data-testid="google-map">{children}</div>,
  DirectionsRenderer: () => <div data-testid="directions-renderer" />,
}));

// 3. Mock Fetch 
global.fetch = jest.fn();

const mockRoutes = [
  {
    id: '1',
    title: 'Sunny Morning Walk',
    origin: 'Point A',
    destination: 'Point B',
    type: '👣',
    votes: { score: 10, userVote: 0 },
    photos: [],
  },
  {
    id: '2',
    title: 'Fast Bike Trail',
    origin: 'Point C',
    destination: 'Point D',
    type: '🚲',
    votes: { score: 5, userVote: 1 },
    photos: [{ url: 'test.jpg' }],
  }
];

describe('Explore Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
    // Default mock response for fetching public routes
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ routes: mockRoutes }),
    });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <ThemeProvider>
          <SnackbarProvider>
            <Explore />
          </SnackbarProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  test('renders the page title and fetches routes on load', async () => {
    renderComponent();
    
    expect(screen.getByText(/Explore — Public Trails/i)).toBeInTheDocument();
    
    // Wait for routes to load and render
    const routeTitle = await screen.findByText('Sunny Morning Walk');
    expect(routeTitle).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/routes/public'), expect.any(Object));
  });

  test('filters routes based on search query', async () => {
    renderComponent();
    
    await screen.findByText('Sunny Morning Walk');
    const searchInput = screen.getByPlaceholderText(/Search by title/i);

    
    fireEvent.change(searchInput, { target: { value: 'Fast' } });

    expect(screen.queryByText('Sunny Morning Walk')).not.toBeInTheDocument();
    expect(screen.getByText('Fast Bike Trail')).toBeInTheDocument();
  });

  test('filters routes based on travel mode buttons', async () => {
    renderComponent();
    
    await screen.findByText('Sunny Morning Walk');
    
    // Click the Biking filter button (🚲)
    const bikingBtn = screen.getByTitle('Biking');
    fireEvent.click(bikingBtn);

    expect(screen.queryByText('Sunny Morning Walk')).not.toBeInTheDocument();
    expect(screen.getByText('Fast Bike Trail')).toBeInTheDocument();
  });

  test('authHeaders handles localStorage token correctly', async () => {
    localStorage.setItem('token', 'fake-token-123');
    renderComponent();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer fake-token-123',
          }),
        })
      );
    });
  });

  test('upvote button triggers API call', async () => {
    renderComponent();
    await screen.findByText('Sunny Morning Walk');

    const upvoteButtons = screen.getAllByTitle('Upvote');
    
    // Setup mock for the vote POST request
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ route: { ...mockRoutes[0], votes: { score: 11, userVote: 1 } } }),
    });

    fireEvent.click(upvoteButtons[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/routes/1/vote'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
