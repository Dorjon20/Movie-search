import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchPage from './SearchPage';
import * as movieService from './movieService';

// mock the API
jest.mock('./movieService');

describe('SearchPage', () => {
    const mockOnMovieSelect = jest.fn();

    const defaultState = { query: '', results: [] };
    const mockSetState = jest.fn();
// Reset the mock before every test so calls don't leak across tests
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders input and button', () => {
        render(
            <SearchPage
                onMovieSelect={mockOnMovieSelect}
                searchState={defaultState}
                setSearchState={mockSetState}
            />
        );

        expect(screen.getByPlaceholderText('Enter movie title...')).toBeInTheDocument();
        expect(screen.getByText('Search')).toBeInTheDocument();
    });

    it('shows error when input empty', async () => {
        render(
            <SearchPage
                onMovieSelect={mockOnMovieSelect}
                searchState={{ query: '', results: [] }}
                setSearchState={mockSetState}
            />
        );

        fireEvent.click(screen.getByText('Search'));

        await waitFor(() =>
            expect(screen.getByText('Please enter a movie title')).toBeInTheDocument()
        );
    });

    it('shows movie results after search', async () => {
        const mockMovies = [
            { imdbID: 'tt1', Title: 'Movie 1', Year: '2020', Poster: 'N/A' },
            { imdbID: 'tt2', Title: 'Movie 2', Year: '2021', Poster: 'N/A' }
        ];
        movieService.searchMovies.mockResolvedValueOnce(mockMovies);

        render(
            <SearchPage
                onMovieSelect={mockOnMovieSelect}
                searchState={{ query: 'test', results: [] }}
                setSearchState={mockSetState}
            />
        );

        fireEvent.click(screen.getByText('Search'));

        await waitFor(() => {
            expect(screen.getByText('Movie 1')).toBeInTheDocument();
            expect(screen.getByText('Movie 2')).toBeInTheDocument();
        });
    });
});
