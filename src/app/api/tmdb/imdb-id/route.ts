import { getImdbId } from "@/lib/tmdb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tmdbId = searchParams.get("tmdbId");

    if (!tmdbId) {
        return NextResponse.json({ error: "Missing tmdbId" }, { status: 400 });
    }

    try {
        const imdbId = await getImdbId(parseInt(tmdbId));
        return NextResponse.json({ imdbId });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch IMDb ID" }, { status: 500 });
    }
}
