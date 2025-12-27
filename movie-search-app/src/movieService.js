// movieService.js
// This file handles all API calls to OMDb

const API_KEY = 'b8f693af';
const BASE_URL = 'http://www.omdbapi.com/';

// Search for movies by title/type
// searchMovies now supports server-side pagination via the `page` parameter.
// It returns an object: { results: [...], totalResults: number }
export const searchMovies = async (title, page = 1) => {
    if (!title?.trim()) return { results: [], totalResults: 0 };
    try {
        const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(title)}&page=${page}`);
        const data = await response.json();

        if (data.Response === 'False') {
            throw new Error(data.Error);
        }

        return {
            results: data.Search || [],
            totalResults: data.totalResults ? parseInt(data.totalResults, 10) : (data.Search ? data.Search.length : 0),
        };
    } catch (error) {
        console.error('Search error:', error);
        throw error;
    }
};

// Get detailed info about a specific movie
export const getMovieById = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${id}`);
        const data = await response.json();

        if (data.Response === 'False') {
            throw new Error(data.Error);
        }

        return data;
    } catch (error) {
        console.error('Details error:', error);
        throw error;
    }
};