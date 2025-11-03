import { searchMovies, getMovieById } from './movieService';

// Mock fetch
global.fetch = jest.fn();

describe('movieService', () => {
    beforeEach(() => { // Reset the mock before every test so calls don't leak across tests
        fetch.mockClear();
    });

    describe('searchMovies', () => {
        it('should return movies when search is successful', async () => {
            const mockData = {
                Response: 'True',
                Search: [
                    { Title: 'Batman', Year: '1989', imdbID: 'tt0096895' },
                    { Title: 'Batman Begins', Year: '2005', imdbID: 'tt0372784' }
                ]
            };
            // Make fetch resolve with our fake payload

            fetch.mockResolvedValueOnce({ json: async () => mockData });
            const result = await searchMovies('Batman');

            expect(result).toEqual(mockData.Search);
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('s=Batman'));
        });

        it('should throw error when no results found', async () => {
            fetch.mockResolvedValueOnce({
                json: async () => ({ Response: 'False', Error: 'Movie not found!' })
            });
            await expect(searchMovies('xyz')).rejects.toThrow('Movie not found!');
        });

        it('should handle network errors', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));
            await expect(searchMovies('test')).rejects.toThrow('Network error');
        });
    });

    describe('getMovieById', () => {
        it('should return movie details when ID is valid', async () => {
            const mockMovie = {
                Response: 'True',
                Title: 'Inception',
                Year: '2010',
                imdbRating: '8.8'
            };

            fetch.mockResolvedValueOnce({ json: async () => mockMovie });
            const result = await getMovieById('tt1375666');

            expect(result).toEqual(mockMovie);
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('i=tt1375666'));
        });

        it('should throw error when ID is invalid', async () => {
            fetch.mockResolvedValueOnce({
                json: async () => ({ Response: 'False', Error: 'Incorrect IMDb ID.' })
            });
            await expect(getMovieById('invalid')).rejects.toThrow('Incorrect IMDb ID.');
        });
    });
});
