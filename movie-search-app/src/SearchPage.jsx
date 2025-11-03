// SearchPage.jsx
import React, { useState } from 'react';
import { Search, Film, AlertCircle } from 'lucide-react';
import { searchMovies } from './movieService';


export default function SearchPage({ onMovieSelect, searchState, setSearchState }) {
    const { query, results } = searchState;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!query.trim()) {
            setError('Please enter a movie title');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const movies = await searchMovies(query);
            setSearchState((prev) => ({ ...prev, results: movies }));}
        catch (err) {
            setError(err.message);
            setSearchState((prev) => ({ ...prev, results: [] }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Search bar */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Search Movies</h2>


                <div className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) =>
                            setSearchState((prev) => ({ ...prev, query: e.target.value }))
                        }
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                        placeholder="Enter movie title..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                    >
                        <Search size={18}/>
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {error && (
                    <div
                        className="mt-4 p-3 bg-red-100 border border-red-400 rounded-lg flex items-center gap-2 text-red-700">
                        <AlertCircle size={18}/>
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {/* Loading spinner */}
            {isLoading && (
                <div className="text-center py-12">
                    <div
                        className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-gray-600">Searching...</p>
                </div>
            )}

            {/* Results grid */}

            {!isLoading && results.length > 0 && ( <>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Trending Now
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {results.map((movie) => (
                        <div
                            key={movie.imdbID}
                            onClick={() => onMovieSelect(movie.imdbID)}
                            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                        >
                            <div className="aspect-[2/3] bg-gray-200">
                                {movie.Poster !== 'N/A' ? (
                                    <img
                                        src={movie.Poster}
                                        alt={movie.Title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Film size={48} className="text-gray-400"/>
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <h3 className="font-semibold text-sm truncate">{movie.Title}</h3>
                                <p className="text-xs text-gray-600">{movie.Year}</p>
                            </div>
                        </div>

                    ))}
                </div>
                </>
            )}
        </div>

    );
}
;