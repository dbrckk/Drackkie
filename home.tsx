import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { AlbumCard } from "@/components/ui/album-card";
import { Footer } from "@/components/ui/footer";
import { Album, Artist, Track } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function TrackList({ tracks }: { tracks: Track[] }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mt-6 overflow-hidden">
      <h3 className="font-bold text-lg mb-3">Tracks</h3>
      <ul className="divide-y">
        {tracks.map(track => (
          <li key={track.id} className="py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 text-sm font-medium">{track.trackNumber}.</span>
                <span className="font-medium">{track.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-500 text-sm">{formatDuration(track.durationMs)}</span>
                {track.previewUrl && (
                  <a 
                    href={track.previewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#1DB954] hover:text-green-600"
                    title="Play preview"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </a>
                )}
                <a 
                  href={track.spotifyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-black"
                  title="Open in Spotify"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  
  const { data: artist, isLoading: isLoadingArtist } = useQuery<Artist>({
    queryKey: ['/api/artist'],
  });

  const { data: albums, isLoading: isLoadingAlbums } = useQuery<Album[]>({
    queryKey: ['/api/albums'],
  });

  // Find the selected album
  const selectedAlbum = albums?.find(album => album.id === selectedAlbumId);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-900">
      {isLoadingArtist ? (
        <div className="sticky top-0 z-50 bg-[#1e1e1e] text-white shadow-md">
          <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="w-7 h-7 rounded-full" />
          </div>
        </div>
      ) : (
        artist && <Navbar artist={artist} />
      )}

      <main className="flex-grow container mx-auto px-4 md:px-6 py-8 md:py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-[#6b21a8]">
          Albums & Singles
        </h2>

        {isLoadingAlbums ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-lg flex flex-col">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/4 mb-6" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
              {albums?.map((album) => (
                <div 
                  key={album.id} 
                  onClick={() => setSelectedAlbumId(album.id === selectedAlbumId ? null : album.id)}
                  className="cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <AlbumCard album={album} />
                </div>
              ))}
            </div>

            {/* Display track listing for selected album */}
            {selectedAlbum && selectedAlbum.tracks && (
              <div className="max-w-5xl mx-auto">
                <TrackList tracks={selectedAlbum.tracks} />
              </div>
            )}
          </>
        )}

        <div className="flex items-center justify-center mt-10">
          <a 
            href={artist?.spotifyUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center px-5 py-3 bg-[#1DB954] hover:bg-green-600 text-white rounded-full font-medium transition-colors duration-200 shadow-md"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            View complete discography on Spotify
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
