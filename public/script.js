const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');

// Function to search for tracks
async function searchTracks(query) {
  if (!query) {
    resultsDiv.innerHTML = '';
    return;
  }

  try {
    const response = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(query)}`);
    const tracks = await response.json();
    displayResults(tracks);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    resultsDiv.innerHTML = '<p>Failed to fetch tracks. Please try again.</p>';
  }
}

// Function to display search results
function displayResults(tracks) {
  resultsDiv.innerHTML = '';
  tracks.forEach(track => {
    const trackElement = document.createElement('div');
    trackElement.className = 'track';

    trackElement.innerHTML = `
      <img src="${track.album.images[0].url}" alt="${track.name}">
      <div class="track-info">
        <h3>${track.name}</h3>
        <p>${track.artists.map(artist => artist.name).join(', ')}</p>
      </div>
    `;

    // Add event listener to the entire track element
    trackElement.addEventListener('click', () => {
      addTrackToPlaylist(track.uri);
    });

    resultsDiv.appendChild(trackElement);
  });
}

// Function to add track to playlist
async function addTrackToPlaylist(trackUri) {
  try {
    const response = await fetch('http://localhost:3001/api/add-to-playlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trackUri }),
    });

    const result = await response.json();
    if (result.success) {
      showToast('Track added to playlist successfully!');
    } else {
      showToast('Failed to add track to playlist.');
    }
  } catch (error) {
    console.error('Error adding track to playlist:', error);
    showToast('Failed to add track to playlist.');
  }
}

// Function to show a toast message
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  document.body.appendChild(toast);

  // Remove the toast after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Event listener for live search
searchInput.addEventListener('input', () => {
  searchTracks(searchInput.value);
});