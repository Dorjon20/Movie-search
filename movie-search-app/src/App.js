// src/App.jsx
import React, { useState } from 'react';
import SearchPage from './SearchPage';
import MovieDetails from './MovieDetails';

export default function App() {
    const [view, setView] = useState('search');
    const [selectedMovieId, setSelectedMovieId] = useState(null);

    function handleMovieSelect(id) {
        setSelectedMovieId(id);
        setView('details');
    }

    function handleBackToSearch() {
        setSelectedMovieId(null);
        setView('search');

    }
    const [searchState, setSearchState] = useState({
        query: '',
        results: [],
    });


    return (
    <div className="min-h-screen bg-gray-100">
            <header className="bg-blue-600 text-white shadow-md">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold">Movie Search</h1>
                </div>
            </header>
        {view === 'search' ? (
            <SearchPage
                onMovieSelect={handleMovieSelect}
                searchState={searchState}
                setSearchState={setSearchState}
            />
        ) : (
            <MovieDetails movieId={selectedMovieId} onBack={handleBackToSearch} />
        )}

    </div>
    );
}
