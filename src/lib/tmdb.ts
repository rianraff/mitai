const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBMovie {
    id: number;
    title: string;
    poster_path: string;
    backdrop_path: string;
    release_date: string;
    vote_average: number;
    overview: string;
}

export async function getTrendingMovies(): Promise<TMDBMovie[]> {
    if (!TMDB_API_KEY) return [];
    const res = await fetch(`${BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
    const data = await res.json();
    return data.results || [];
}

export async function getTopRatedMovies(): Promise<TMDBMovie[]> {
    if (!TMDB_API_KEY) return [];
    const res = await fetch(`${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
    const data = await res.json();
    return data.results || [];
}

export async function getImdbId(tmdbId: number): Promise<string | null> {
    if (!TMDB_API_KEY) return null;
    const res = await fetch(`${BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`);
    const data = await res.json();
    return data.imdb_id || null;
}

export function getTMDBPosterUrl(path: string, size: 'w500' | 'original' = 'w500'): string {
    if (!path) return '';
    return `https://image.tmdb.org/t/p/${size}${path}`;
}
