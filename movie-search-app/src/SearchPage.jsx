// SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { Search, Film, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchMovies } from './movieService';


export default function SearchPage({ onMovieSelect, searchState, setSearchState }) {
    const { query, results } = searchState;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [yearFilter, setYearFilter] = useState('All');

    useEffect(() => {
        // Load static popular suggestions when there are no search results yet
        const popularTitles = [
            'The Shawshank Redemption',
            'The Dark Knight',
            'Inception',
            'Pulp Fiction',
            'The Matrix',
            'Interstellar'
        ];

        let mounted = true;
        const load = async () => {
            setSuggestionsLoading(true);
            try {
                const groups = await Promise.all(
                    popularTitles.map((t) => searchMovies(t, 1).catch(() => ({ results: [] })))
                );
                if (!mounted) return;
                const items = groups.map((g) => (g && Array.isArray(g.results) && g.results.length ? g.results[0] : null)).filter(Boolean);
                setSuggestions(items);
            } catch (err) {
                // ignore suggestions errors
            } finally {
                setSuggestionsLoading(false);
            }
        };

        if (!results || results.length === 0) load();

        return () => { mounted = false; };
    }, [results]);

    // helper: available years from results or suggestions
    const getYears = (list) => {
        if (!list || !list.length) return [];
        try {
            return Array.from(new Set(list.map((m) => m.Year))).sort((a, b) => b - a);
        } catch (e) {
            return [];
        }
    };

    const availableYears = getYears((results && results.length) ? results : suggestions);
    const filteredResults = (results || []).filter(m => yearFilter === 'All' || m.Year === yearFilter);
    const [currentPage, setCurrentPage] = useState(1);
    const filteredSuggestions = (suggestions || []).filter(m => yearFilter === 'All' || m.Year === yearFilter);
    const [totalResults, setTotalResults] = useState(0);
    const [lastFetchInfo, setLastFetchInfo] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!query.trim()) {
            setError('Please enter a movie title');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await searchMovies(query, 1);
            setSearchState((prev) => ({ ...prev, results: res.results }));
            setTotalResults(res.totalResults || 0);
            setCurrentPage(1);
        } catch (err) {
            setError(err.message);
            setSearchState((prev) => ({ ...prev, results: [] }));
            setTotalResults(0);
        } finally {
            setIsLoading(false);
        }
    };

    // reset page when filter or results change
    useEffect(() => {
        setCurrentPage(1);
    }, [yearFilter, results]);

    const ITEMS_PER_PAGE = 10; // OMDb returns 10 items per page
    const totalPages = Math.max(1, Math.ceil((totalResults || filteredResults.length) / ITEMS_PER_PAGE));
    const pagedResults = filteredResults; // results already represent the current server page
    const [pageInput, setPageInput] = useState('');

    function goToPage(page) {
        const p = Number(page);
        if (!p || p < 1 || p > totalPages) return;
        if (p === currentPage) return;
        fetchPage(p);
        setPageInput('');
    }

    function goPrev() {
        const prev = Math.max(1, currentPage - 1);
        if (prev === currentPage) return;
        fetchPage(prev, query);
        window.scrollTo?.({ top: 0, behavior: 'smooth' });
    }

    function goNext() {
        const next = Math.min(totalPages, currentPage + 1);
        if (next === currentPage) return;
        fetchPage(next, query);
        window.scrollTo?.({ top: 0, behavior: 'smooth' });
    }

    async function fetchPage(page, q) {
        const searchQuery = (typeof q === 'string' ? q : query);
        if (!searchQuery || !searchQuery.trim()) return;
        console.log('fetchPage', { page, searchQuery });
        setIsLoading(true);
        setError(null);
        try {
            const res = await searchMovies(searchQuery, page);
            console.log('fetchPage response', { page, count: (res.results || []).length, total: res.totalResults });
            setSearchState((prev) => ({ ...prev, results: res.results }));
            setTotalResults(res.totalResults || 0);
            setCurrentPage(page);
        } catch (err) {
            console.error('fetchPage error', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
    <div className="space-y-6 animate-fade-up text-gray-100">
            {/* Search bar */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg shadow-md p-6 backdrop-blur">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Search Movies</h2>


                <div className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) =>
                            setSearchState((prev) => ({ ...prev, query: e.target.value }))
                        }
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                        placeholder="Enter movie title..."
                        className="flex-1 px-4 py-2 border border-gray-700 bg-gray-900/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-gray-100 placeholder-gray-400"
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:bg-gray-500 flex items-center gap-2 btn-modern"
                        title="Search movies"
                    >
                        <Search size={18}/>
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {error && (
                    <div
                        className="mt-4 p-3 bg-red-900/80 border border-red-700 rounded-lg flex items-center gap-2 text-red-200">
                        <AlertCircle size={18}/>
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {/* Loading spinner */}
            {isLoading && (
                <div className="text-center py-12 text-gray-200">
                    <div
                        className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2">Searching...</p>
                </div>
            )}

            

            {/* Filter controls + Results grid */}

            {!isLoading && ( (results && results.length > 0) || (suggestions && suggestions.length > 0) ) && (
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-100 mb-4">Trending Now</h2>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-300">Filter by year</label>
                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="bg-gray-800 border border-gray-700 text-gray-100 rounded px-2 py-1 text-sm"
                        >
                            <option value="All">All</option>
                            {availableYears.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {!isLoading && filteredResults.length > 0 && ( <>
                <h3 className="sr-only">Search results</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {pagedResults.map((movie, idx) => (
                        <div
                            key={movie.imdbID}
                            onClick={() => onMovieSelect(movie.imdbID)}
                            className="bg-gray-800 rounded-lg shadow hover:shadow-lg transition-transform transform hover:scale-105 cursor-pointer overflow-hidden card-animate"
                            style={{ animationDelay: `${idx * 60}ms` }}
                        >
                            <div className="aspect-[2/3] bg-gradient-to-tr from-gray-700 to-gray-800">
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
                                <h3 className="font-semibold text-sm truncate text-gray-100">{movie.Title}</h3>
                                <p className="text-xs text-gray-400">{movie.Year}</p>
                            </div>
                        </div>

                    ))}
                </div>

                {/* pagination placeholder (controls moved to page bottom) */}
                </>
            )}

            {/* Popular suggestions when there are no results */}
            {!isLoading && (!results || results.length === 0) && (
                <>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">Popular Picks</h2>
                        {suggestionsLoading && <span className="text-sm text-gray-400">Loading...</span>}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {filteredSuggestions && filteredSuggestions.length > 0 ? (
                            filteredSuggestions.map((movie, idx) => (
                                <div
                                    key={movie.imdbID}
                                    onClick={() => onMovieSelect(movie.imdbID)}
                                    className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer shadow hover:shadow-lg transition-transform transform hover:scale-105 card-animate"
                                    style={{ animationDelay: `${idx * 60}ms` }}
                                >
                                    <div className="aspect-[2/3] bg-gradient-to-tr from-gray-700 to-gray-800">
                                        {movie.Poster !== 'N/A' ? (
                                            <img src={movie.Poster} alt={movie.Title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Film size={40} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2">
                                        <h3 className="text-sm font-medium text-gray-100 truncate">{movie.Title}</h3>
                                        <p className="text-xs text-gray-400">{movie.Year}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400">No suggestions available for the selected year.</p>
                        )}
                    </div>
                </>
            )}
            {/* Fixed bottom pagination controls */}
            {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="bg-gray-800/80 backdrop-blur rounded-full px-4 py-2 flex items-center gap-4 justify-between">
                            <div className="flex items-center gap-2">
                                <button onClick={goPrev} disabled={currentPage === 1} className="flex items-center gap-2 px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-40">
                                    <ChevronLeft />
                                </button>
                                <div className="text-sm text-gray-300">Page {currentPage} of {totalPages}</div>
                                <button onClick={goNext} disabled={currentPage === totalPages} className="flex items-center gap-2 px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-40">
                                    <ChevronRight />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-300">Go to</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={totalPages}
                                    value={pageInput}
                                    onChange={(e) => setPageInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') goToPage(e.target.value); }}
                                    className="w-20 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-gray-100"
                                />
                                <button onClick={() => goToPage(pageInput)} className="px-3 py-1 bg-indigo-600 rounded text-white">Go</button>
                            </div>
                        </div>
                        {lastFetchInfo && (
                            <div className="mt-2 text-xs text-gray-400">Last fetch: {lastFetchInfo}</div>
                        )}
                    </div>
                </div>
            )}
        </div>

    );
}
;