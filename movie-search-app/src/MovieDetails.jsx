// MovieDetails.jsx
import React, { useState, useEffect } from 'react';
import { Star, Calendar, Clock, Film, Heart } from 'lucide-react';
import { getMovieById } from './movieService';


export default function MovieDetails({ movieId, onBack }) {
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [like, setLike] = useState(false);

    // Track whether this movie is favorited
    useEffect(() => {
        const favoriteMovie = JSON.parse(localStorage.getItem('favorites') || '[]');
        setLike(favoriteMovie.includes(movieId));
    }, [movieId]);

    function toggleLike() {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const isFav = favorites.includes(movieId);
        let updated;
        if (isFav) {
            updated = favorites.filter((id) => id !== movieId);
        } else {
            updated = [...favorites, movieId];
        }
        localStorage.setItem('favorites', JSON.stringify(updated));
        setLike(!isFav);
    }

    // Load movie details
    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const data = await getMovieById(movieId);
                setMovie(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (movieId) fetchDetails();
    }, [movieId]);

    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="inline-block w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-400">Loading details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500">{error}</p>
                <button onClick={onBack} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">
                    Back to Search
                </button>
            </div>
        );
    }

    if (!movie) return null;

    return (
        <div className="animate-fade-up">
            <button onClick={onBack} className="mb-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg btn-modern text-gray-300">
                ← Back
            </button>

            {/* Info card - match page background (dark) */}
            <div className="bg-gray-900 rounded-lg shadow-none overflow-hidden card-animate">
                <div className="md:flex">
                    {/* Poster */}
                    <div className="md:w-1/3 bg-gradient-to-tr from-gray-800 to-gray-900">
                        {movie.Poster !== 'N/A' ? (
                            <img src={movie.Poster} alt={movie.Title} className="w-full h-full object-cover transition-transform duration-300 transform hover:scale-105" />
                        ) : (
                            <div className="h-96 flex items-center justify-center">
                                <Film size={80} className="text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="md:w-2/3 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <h1 className="text-3xl font-bold text-gray-200">{movie.Title}</h1>
                            <button
                                onClick={toggleLike}
                                className={`flex items-center gap-1 px-3 py-1 rounded-lg border ${
                                    like ? 'bg-red-700/20 border-red-600 text-red-300' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-800/90'
                                }`}
                            >
                                <Heart size={18} fill={like ? 'currentColor' : 'none'} className={like ? 'text-red-400' : 'text-gray-300'} />
                                <span className="text-sm">{like ? 'Liked' : 'Like'}</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                            <span className="flex items-center gap-1">
                                <Calendar size={16} />
                                {movie.Year}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={16} />
                                {movie.Runtime}
                            </span>
                            <span className="flex items-center gap-1">
                                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                {movie.imdbRating}
                            </span>
                        </div>

                        {/* Genres */}
                        {movie.Genre && (
                            <div className="flex gap-2 mb-4">
                                {movie.Genre.split(', ').map((genre) => (
                                    <span key={genre} className="px-3 py-1 bg-indigo-700/10 text-indigo-200 rounded-full text-sm">
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Plot */}
                        <div className="mb-4">
                            <h3 className="font-semibold mb-1 text-gray-200">Plot</h3>
                            <p className="text-gray-300">{movie.Plot}</p>
                        </div>

                        {/* Additional info */}
                        <div className="space-y-2 text-sm">
                            <InfoRow label="Director" value={movie.Director} />
                            <InfoRow label="Writer" value={movie.Writer} />
                            <InfoRow label="Actors" value={movie.Actors} />
                            <InfoRow label="Language" value={movie.Language} />
                            <InfoRow label="Country" value={movie.Country} />
                            {movie.Awards !== 'N/A' && <InfoRow label="Awards" value={movie.Awards} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex">
            <span className="font-semibold w-24 text-gray-400">{label}:</span>
            <span className="text-gray-300">{value}</span>
        </div>
    );
}
