import { useState } from "react";
import { Album } from "@shared/schema";

interface AlbumCardProps {
  album: Album;
}

export function AlbumCard({ album }: AlbumCardProps) {
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <div className="album-card bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 flex flex-col hover:shadow-xl">
      <div className="relative pb-[100%] bg-gray-100">
        <img 
          src={album.imageUrl}
          alt={`${album.name} Album Cover`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Play button overlay */}
        <button 
          onClick={() => setShowPlayer(!showPlayer)}
          className="absolute inset-0 w-full h-full bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
          aria-label={`Play ${album.name}`}
        >
          <div className="bg-white rounded-full p-3">
            <svg 
              className="w-10 h-10 text-black" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {showPlayer ? (
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" fill="currentColor" />
              ) : (
                <path d="M8 5v14l11-7-11-7z" fill="currentColor" />
              )}
            </svg>
          </div>
        </button>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-lg">{album.name}</h3>
          {showPlayer && (
            <span className="text-xs bg-[#1DB954] text-white px-2 py-1 rounded-full flex items-center">
              <span className="block w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>
              Now Playing
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-3">{album.releaseDate}</p>
        
        {showPlayer && (
          <div className="my-4 w-full">
            <iframe 
              src={album.embedUrl} 
              width="100%" 
              height="152" 
              frameBorder="0" 
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
              loading="lazy"
              title={`${album.name} player`}
              className="rounded shadow-sm"
            ></iframe>
          </div>
        )}
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs text-gray-500">{album.totalTracks} tracks</span>
          <a 
            href={album.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1DB954] hover:text-green-600 font-medium text-sm flex items-center group"
          >
            <span>Open in Spotify</span>
            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-0.5 transition-transform" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
