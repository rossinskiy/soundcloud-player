const { ipcRenderer } = require('electron');

// Runs inside the real soundcloud.com page. SoundCloud's web player sets the
// standard Media Session API (used for OS media-key/lockscreen integration)
// for title/artist/artwork/play-state, but doesn't expose a plain <audio>
// element (it plays via Web Audio API / MSE), so playback position is read
// from the on-page progress bar's aria attributes instead.

let lastSentKey = null;

function pickArtwork(artwork) {
  if (!Array.isArray(artwork) || artwork.length === 0) return null;
  // SoundCloud artwork URLs are usually served small (e.g. "-t50x50.jpg");
  // request a larger variant for a crisper Discord cover.
  const best = artwork[artwork.length - 1];
  return best.src ? best.src.replace(/-t\d+x\d+\.(jpg|png)/, '-t500x500.$1') : null;
}

function poll() {
  try {
    const metadata = navigator.mediaSession && navigator.mediaSession.metadata;
    const progressEl = document.querySelector('.playbackTimeline__progressWrapper');

    if (!metadata || !metadata.title || !progressEl) {
      if (lastSentKey !== null) {
        lastSentKey = null;
        ipcRenderer.send('now-playing-cleared');
      }
      return;
    }

    const currentTime = Number(progressEl.getAttribute('aria-valuenow')) || 0;
    const duration = Number(progressEl.getAttribute('aria-valuemax')) || 0;
    const isPlaying = navigator.mediaSession.playbackState === 'playing';

    const payload = {
      title: metadata.title,
      artist: metadata.artist || '',
      artworkUrl: pickArtwork(metadata.artwork),
      currentTime,
      duration,
      isPlaying
    };

    const key = `${payload.title}|${payload.artist}|${payload.isPlaying}|${payload.currentTime}`;
    if (key !== lastSentKey) {
      lastSentKey = key;
      ipcRenderer.send('now-playing', payload);
    }
  } catch (err) {
    // Swallow errors so a page hiccup never crashes polling.
  }
}

setInterval(poll, 1000);
