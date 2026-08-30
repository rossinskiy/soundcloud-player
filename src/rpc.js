const { Client } = require('@xhayper/discord-rpc');
const { DISCORD_CLIENT_ID } = require('./config');

let rpc = null;
let ready = false;
let lastState = null;

function connectRpc() {
  if (!DISCORD_CLIENT_ID || DISCORD_CLIENT_ID.startsWith('PASTE_')) {
    console.warn('[discord-rpc] No DISCORD_CLIENT_ID set in src/config.js — Rich Presence disabled.');
    return;
  }

  rpc = new Client({ clientId: DISCORD_CLIENT_ID });

  rpc.on('ready', () => {
    ready = true;
    console.log('[discord-rpc] connected as', rpc.user?.username);
    if (lastState) updatePresence(lastState);
  });

  rpc.on('disconnected', () => {
    ready = false;
  });

  rpc.login().catch((err) => {
    console.error('[discord-rpc] failed to connect:', err.message);
  });
}

function updatePresence(state) {
  lastState = state;
  if (!rpc || !ready) return;

  const { title, artist, artworkUrl, currentTime, duration, isPlaying } = state;
  if (!title || !isPlaying) {
    rpc.user?.clearActivity().catch(() => {});
    return;
  }

  const now = Date.now();
  const startTimestamp = now - Math.floor(currentTime * 1000);
  const endTimestamp = duration ? startTimestamp + Math.floor(duration * 1000) : undefined;

  rpc.user?.setActivity({
    type: 2, // LISTENING
    details: title,
    state: artist || 'SoundCloud',
    largeImageKey: artworkUrl || 'soundcloud-logo',
    largeImageText: title,
    smallImageKey: 'soundcloud-logo',
    smallImageText: 'SoundCloud',
    startTimestamp: endTimestamp ? startTimestamp : undefined,
    endTimestamp,
    instance: false
  }).catch((err) => {
    console.error('[discord-rpc] setActivity failed:', err.message);
  });
}

function clearPresence() {
  lastState = null;
  if (rpc && ready) {
    rpc.user?.clearActivity().catch(() => {});
  }
}

module.exports = { connectRpc, updatePresence, clearPresence };
