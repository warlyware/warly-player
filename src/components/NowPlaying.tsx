import { useEffect, useState } from "react";

function NowPlaying() {
  // get the current track from /public/nowplaying.txt
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const [artist, setArtist] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    const fetchNowPlaying = () => {
      fetch('/api/metadata/nowplaying.txt')
        .then(response => response.text())
        .then(data => setNowPlaying(data));
    };

    // Fetch immediately on mount
    fetchNowPlaying();

    // Set up interval to fetch every 2 seconds
    const interval = setInterval(fetchNowPlaying, 2000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!nowPlaying) {
      return;
    }
    const fullNowPlaying = nowPlaying.split('\n')[1];
    const [title, artist] = fullNowPlaying.split(' - ');
    setArtist(artist ?? null);
    setTitle(title ?? null);
  }, [nowPlaying]);

  return (
    <div className="text-white text-2xl font-bold text-center px-4">
      <h1>{title}</h1>
      <p>{artist}</p>
    </div>
  )
}

export default NowPlaying;