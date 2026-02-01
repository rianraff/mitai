import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Film, Users, Shuffle, TrendingUp, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTrendingMovies, getTopRatedMovies } from "@/lib/tmdb";
import { MovieShelf } from "@/components/features/MovieShelf";
import Link from "next/link";

import { MovieSearch } from "@/components/features/MovieSearch";
import { MovieBillboard } from "@/components/features/MovieBillboard";
import { QuickTheatreAccess } from "@/components/features/QuickTheatreAccess";
import { CreateTheatreDialog } from "@/components/features/CreateTheatreDialog";
import { JoinTheatreDialog } from "@/components/features/JoinTheatreDialog";

async function LoggedInView() {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const trending = (await getTrendingMovies()).slice(0, 10);
  const topRated = await getTopRatedMovies();

  // Fetch theatres user is part of
  const { data: sessions } = await supabase
    .from('theatre_sessions')
    .select(`
        theatre:theatres (
            id,
            name,
            invite_code,
            merge_mode
        )
    `)
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false });

  // Fetch user profile for username
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  // Fetch user's watchlist to disable add button if already added
  const { data: watchlist } = await supabase
    .from('watchlists')
    .select('imdb_id')
    .eq('user_id', user.id);

  const watchlistIds = watchlist?.map(w => w.imdb_id) || [];
  const theatreList = (sessions?.map((s: any) => s.theatre) || []) as any[];

  // Fetch stats for each theatre to sync with /theatre page
  const theatresWithStats = await Promise.all(theatreList.map(async (theatre: any) => {
    // Fetch users in this theatre to get their watchlists
    const { data: memberSessions } = await supabase
      .from('theatre_sessions')
      .select('user_id')
      .eq('theatre_id', theatre.id);

    const memberIds = memberSessions?.map(m => m.user_id) || [];

    // Fetch merged watchlist stats
    const { data: watchlists } = await supabase
      .from('watchlists')
      .select('imdb_id, watched')
      .in('user_id', memberIds);

    const movieMap = new Map<string, boolean>();
    watchlists?.forEach(w => {
      if (!movieMap.has(w.imdb_id)) {
        movieMap.set(w.imdb_id, w.watched);
      } else if (!w.watched) {
        movieMap.set(w.imdb_id, false);
      }
    });

    const totalMovies = movieMap.size;
    const watchedMovies = Array.from(movieMap.values()).filter(v => v).length;
    const progress = totalMovies > 0 ? Math.round((watchedMovies / totalMovies) * 100) : 0;

    return {
      ...theatre,
      totalMovies,
      watchedMovies,
      progress
    };
  }));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-1000">
      {/* Header & Search */}
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-end justify-between border-b-8 border-black pb-4">
        <div className="flex flex-col items-start gap-0.5">
          <div className="bg-secondary text-secondary-foreground font-black text-[10px] px-2 py-0.5 border-2 border-black rotate-[-2deg] shadow-neo-sm mb-1">
            WELCOME BACK
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            {(profile?.username || user.email?.split('@')[0])?.split(' ')[0]}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto items-stretch md:items-end">
          <div className="flex gap-4">
            <JoinTheatreDialog />
            <CreateTheatreDialog />
          </div>
        </div>
      </div>

      <MovieBillboard movies={trending} initialWatchlistIds={watchlistIds} />

      {theatresWithStats.length > 0 && (
        <QuickTheatreAccess theatres={theatresWithStats} />
      )}

      <MovieShelf
        title="Top Rated"
        movies={topRated}
        iconType="top-rated"
        iconColor="text-secondary"
      />
    </div>
  );
}

function HeroView() {
  return (
    <div className="flex flex-col items-center gap-12 text-center w-full">
      {/* Hero Section */}
      <section className="flex flex-col items-center gap-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-primary text-primary-foreground p-4 border-2 border-black shadow-neo -rotate-2">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
            Mitai
          </h1>
        </div>
        <p className="text-xl md:text-2xl font-bold max-w-lg leading-relaxed text-foreground/90 bg-black/20 p-2 backdrop-blur-sm border-2 border-black shadow-neo-sm">
          Stop scrolling. Start watching.
          <br />
          <span className="text-secondary text-lg">Shared watchlists & fair shuffling for indecisive humans.</span>
        </p>

        <div className="flex gap-4 mt-4">
          <Button size="lg" className="border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all bg-primary text-primary-foreground font-bold text-lg h-14 px-8" asChild>
            <Link href="/login">Get Started</Link>
          </Button>
          <Button size="lg" variant="secondary" className="border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold text-lg h-14 px-8" asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-12">
        <Card className="bg-card border-4 border-black shadow-neo hover:-translate-y-1 transition-transform p-8 flex flex-col items-center gap-4 rounded-none">
          <div className="w-16 h-16 bg-secondary text-secondary-foreground flex items-center justify-center border-4 border-black shadow-neo-sm -rotate-2">
            <Film className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-black uppercase tracking-tighter">Curate</CardTitle>
          <p className="font-bold text-lg opacity-80">Dump your IMDb links. We'll keep them safe and ready for your next binge.</p>
        </Card>

        <Card className="bg-[#b48e43] text-black border-4 border-black shadow-neo hover:-translate-y-1 transition-transform p-8 flex flex-col items-center gap-4 rounded-none">
          <div className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center border-4 border-black shadow-neo-sm rotate-2">
            <Users className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-black uppercase tracking-tighter">Sync</CardTitle>
          <p className="font-bold text-lg opacity-80">Create a Theatre. Invite friends. Merge your tastes in seconds.</p>
        </Card>

        <Card className="bg-white text-black border-4 border-black shadow-neo hover:-translate-y-1 transition-transform p-8 flex flex-col items-center gap-4 rounded-none">
          <div className="w-16 h-16 bg-black text-white flex items-center justify-center border-4 border-white shadow-neo-sm -rotate-1">
            <Shuffle className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-black uppercase tracking-tighter">Shuffle</CardTitle>
          <p className="font-bold text-lg opacity-80">Can't decide? Let the chaos gods pick a movie for you.</p>
        </Card>
      </div>
    </div>
  );
}

export default async function Home() {
  const supabase = await createClient();
  if (!supabase) return <HeroView />;
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen px-8 pt-6 pb-8 md:px-12 md:pt-10 md:pb-12 lg:px-24 lg:pt-12 lg:pb-24 bg-background text-foreground">
      {user ? <LoggedInView /> : <HeroView />}
    </main>
  );
}
