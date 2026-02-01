import { getMovieDetails } from '@/lib/omdb';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Query parameter "id" is required' }, { status: 400 });
    }

    try {
        const movie = await getMovieDetails(id);
        if (!movie) {
            return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
        }
        return NextResponse.json(movie);
    } catch (error) {
        console.error('Details error:', error);
        return NextResponse.json({ error: 'Failed to fetch movie details' }, { status: 500 });
    }
}
