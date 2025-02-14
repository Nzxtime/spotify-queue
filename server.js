require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Spotify API credentials
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const PLAYLIST_ID = process.env.PLAYLIST_ID;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

// Cache for playlist tracks
let playlistTracksCache = {
  tracks: [],
  expiresAt: 0, // Timestamp when the cache expires
};

// Function to get a new access token
async function getAccessToken() {
  const authUrl = 'https://accounts.spotify.com/api/token';
  const response = await axios.post(
    authUrl,
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
      },
    }
  );
  return response.data.access_token;
}

// Function to fetch all tracks in the playlist
async function fetchAllPlaylistTracks(accessToken) {
  let offset = 0;
  const limit = 100; // Maximum tracks per request
  let allTracks = [];
  let totalTracks = 0;

  do {
    const playlistUrl = `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks?fields=items(track(uri)),total&limit=${limit}&offset=${offset}`;
    const playlistResponse = await axios.get(playlistUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const { items, total } = playlistResponse.data;
    allTracks = allTracks.concat(items);
    totalTracks = total;
    offset += limit;
  } while (offset < totalTracks);

  return allTracks;
}

// Search Spotify tracks
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    const accessToken = await getAccessToken();
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;
    const response = await axios.get(searchUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    res.json(response.data.tracks.items);
  } catch (error) {
    console.error('Error searching tracks:', error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

// Add track to playlist
app.post('/api/add-to-playlist', async (req, res) => {
  const { trackUri } = req.body;
  if (!trackUri) {
    return res.status(400).json({ error: 'Track URI is required' });
  }

  try {
    const accessToken = await getAccessToken();

    // Check if the cache is expired
    const now = Date.now();
    if (now > playlistTracksCache.expiresAt) {
      // Fetch all tracks and update the cache
      const allTracks = await fetchAllPlaylistTracks(accessToken);
      playlistTracksCache = {
        tracks: allTracks,
        expiresAt: now + 10 * 60 * 1000, // Cache expires in 10 minutes
      };
    }

    // Check if the track already exists in the playlist
    const isDuplicate = playlistTracksCache.tracks.some(item => item.track.uri === trackUri);

    if (isDuplicate) {
      return res.status(400).json({ error: 'Track is already in the playlist' });
    }

    // Add the track to the playlist
    const addTrackUrl = `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`;
    const response = await axios.post(
      addTrackUrl,
      {
        uris: [trackUri],
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Add the new track to the cached list
    playlistTracksCache.tracks.push({ track: { uri: trackUri } });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error adding track to playlist:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to add track to playlist' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});