// MovieDetails.jsx
import React, { useState, useEffect } from 'react';
import { Star, Calendar, Clock, Film, Heart } from 'lucide-react';
import { getMovieById } from './movieService';


export default function MovieDetails ({ movieId, onBack }) {
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [like, setLike] = useState(false);

    //gives you the option to like a movie
    useEffect(() => {
        const favoriteMovie = JSON.parse(localStorage.getItem('favorites') || '[]');
        setLike(favoriteMovie.includes(movieId));
    }, [movieId]);
    function toggleLike() {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setLike(favorites.includes(movieId));
        let updated;
        if (favorites.includes(movieId)) {
            updated = favorites.filter(id => id !== movieId);
        } else {
            updated = [...favorites, movieId];
        }
        localStorage.setItem('favorites', JSON.stringify(updated));
        setLike(!like);
    }

// auto-loads the movie details when the page renders.
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

        fetchDetails();
    }, [movieId]);

    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={onBack}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Back to Search
                </button>
            </div>
        );
    }

    if (!movie) return null;

    return (
        <div>
            <button
                onClick={onBack}
                className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
                ← Back
            </button>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="md:flex">
                    {/* Poster */}
                    <div className="md:w-1/3 bg-gray-200">
                        {movie.Poster !== 'N/A' ? (
                            <img
                                src={movie.Poster}
                                alt={movie.Title}

                                className="w-full h-full object-cover"


                            />

                        ) : (
                            <div className="h-96 flex items-center justify-center">
                                <Film size={80} className="text-gray-400" />

                            </div>)}


                    </div>



                    {/* Details */}
                    <div className="md:w-2/3 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <h1 className="text-3xl font-bold">{movie.Title}</h1>
                            <button
                                onClick={toggleLike}
                                className={`flex items-center gap-1 px-3 py-1 rounded-lg border ${
                                    like
                                        ? 'bg-red-50 border-red-300 text-red-600'
                                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <Heart
                                    size={18}
                                    fill={like ? 'currentColor' : 'none'}
                                    className={like ? 'text-red-600' : 'text-gray-700'}
                                />
                                <span className="text-sm">{like ? 'Liked' : 'Like'}</span>
                            </button>
                        </div>


                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
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
                                {movie.Genre.split(', ').map(genre => (
                                    <span
                                        key={genre}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                    >
                    {genre}
                  </span>
                                ))}
                            </div>
                        )}

                        {/* Plot */}
                        <div className="mb-4">
                            <h3 className="font-semibold mb-1">Plot</h3>
                            <p className="text-gray-700">{movie.Plot}</p>
                        </div>

                        {/* Additional info */}
                        <div className="space-y-2 text-sm">
                            <InfoRow label="Director" value={movie.Director} />
                            <InfoRow label="Writer" value={movie.Writer} />
                            <InfoRow label="Actors" value={movie.Actors} />
                            <InfoRow label="Language" value={movie.Language} />
                            <InfoRow label="Country" value={movie.Country} />
                            {movie.Awards !== 'N/A' && (
                                <InfoRow label="Awards" value={movie.Awards} />
                            )}
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
            <span className="font-semibold w-24 text-gray-600">{label}:</span>
            <span className="text-gray-800">{value}</span>
        </div>
    );
}

;