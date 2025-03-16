import { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { albumSchema, artistSchema } from "@shared/schema";
import axios from "axios";
import { z } from "zod";
import { Buffer } from "buffer";

// Environment variables for Spotify API
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';
const SPOTIFY_ARTIST_ID = process.env.SPOTIFY_ARTIST_ID || '';
const INSTAGRAM_HANDLE = process.env.INSTAGRAM_HANDLE || '';

// Cache token and expiration
let spotifyToken: string | null = null;
let tokenExpiration: number = 0;

async function getSpotifyToken(): Promise<string> {
  // Check if token is still valid
  if (spotifyToken && tokenExpiration > Date.now()) {
    return spotifyToken;
  }

  try {
    // Create base64 encoded auth string
    const auth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    
    // Get new token
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const newToken = response.data.access_token;
    if (typeof newToken !== 'string') {
      throw new Error('Invalid token received from Spotify');
    }
    
    spotifyToken = newToken;
    // Set expiration (subtracting 60 seconds as buffer)
    tokenExpiration = Date.now() + ((response.data.expires_in - 60) * 1000);
    return spotifyToken;
  } catch (error) {
    console.error('Failed to get Spotify token:', error);
    throw new Error('Failed to authenticate with Spotify');
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get artist info
  app.get('/api/artist', async (req, res) => {
    try {
      const token = await getSpotifyToken();
      
      // Get artist data from Spotify
      const artistResponse = await axios.get(`https://api.spotify.com/v1/artists/${SPOTIFY_ARTIST_ID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Format the response according to our schema
      const artistData = {
        id: artistResponse.data.id,
        name: artistResponse.data.name,
        spotifyUrl: artistResponse.data.external_urls.spotify,
        instagramUrl: `https://instagram.com/${INSTAGRAM_HANDLE}`,
        avatarUrl: artistResponse.data.images[0]?.url || ''
      };

      // Validate with our schema
      const validatedArtist = artistSchema.parse(artistData);
      res.json(validatedArtist);
    } catch (error) {
      console.error('Error fetching artist:', error);
      res.status(500).json({ message: 'Failed to fetch artist information' });
    }
  });

  // Get artist albums with tracks
  app.get('/api/albums', async (req, res) => {
    try {
      const token = await getSpotifyToken();
      
      // Get albums from Spotify (limiting to 4 as per requirement)
      const albumsResponse = await axios.get(
        `https://api.spotify.com/v1/artists/${SPOTIFY_ARTIST_ID}/albums`, {
          params: {
            include_groups: 'album,single',
            limit: 4
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Get tracks for each album and format response
      const albumsWithTracks = await Promise.all(
        albumsResponse.data.items.map(async (album: any) => {
          // Get tracks for this album
          const tracksResponse = await axios.get(
            `https://api.spotify.com/v1/albums/${album.id}/tracks`, {
              params: { limit: 10 },
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          
          // Format tracks
          const tracks = tracksResponse.data.items.map((track: any) => ({
            id: track.id,
            name: track.name,
            previewUrl: track.preview_url,
            spotifyUrl: track.external_urls.spotify,
            durationMs: track.duration_ms,
            trackNumber: track.track_number
          }));
          
          // Create formatted album with tracks
          return {
            id: album.id,
            name: album.name,
            releaseDate: album.release_date,
            totalTracks: album.total_tracks,
            spotifyUrl: album.external_urls.spotify,
            imageUrl: album.images[0]?.url || '',
            embedUrl: `https://open.spotify.com/embed/album/${album.id}?utm_source=generator&theme=0`,
            tracks
          };
        })
      );

      // Validate with our schema
      const validatedAlbums = z.array(albumSchema).parse(albumsWithTracks);
      res.json(validatedAlbums);
    } catch (error) {
      console.error('Error fetching albums:', error);
      res.status(500).json({ message: 'Failed to fetch album information' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
