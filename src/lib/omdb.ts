export type MovieSearchResult = {
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
}

export type MovieDetails = {
    Title: string;
    Year: string;
    Rated: string;
    Released: string;
    Runtime: string;
    Genre: string;
    Director: string;
    Writer: string;
    Actors: string;
    Plot: string;
    Language: string;
    Country: string;
    Awards: string;
    Poster: string;
    Ratings: Array<{ Source: string; Value: string }>;
    Metascore: string;
    imdbRating: string;
    imdbVotes: string;
    imdbID: string;
    Type: string;
    DVD: string;
    BoxOffice: string;
    Production: string;
    Website: string;
    Response: string;
}

const BASE_URL = 'http://www.omdbapi.com/';

export async function searchMovies(query: string): Promise<MovieSearchResult[]> {
    if (!process.env.OMDB_API_KEY) {
        throw new Error('OMDB_API_KEY is not configured');
    }

    const res = await fetch(`${BASE_URL}?s=${encodeURIComponent(query)}&apikey=${process.env.OMDB_API_KEY}`);
    const data = await res.json();

    if (data.Response === 'False') {
        return [];
    }

    return data.Search || [];
}

export async function getMovieDetails(imdbID: string): Promise<MovieDetails | null> {
    if (!process.env.OMDB_API_KEY) {
        throw new Error('OMDB_API_KEY is not configured');
    }

    const res = await fetch(`${BASE_URL}?i=${imdbID}&apikey=${process.env.OMDB_API_KEY}`);
    const data = await res.json();

    if (data.Response === 'False') {
        return null;
    }

    return data;
}
