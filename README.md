# SoundCloud RPC

A desktop app (Electron) that embeds the real soundcloud.com so you log in and use it exactly like the website, while showing what you're listening to in your Discord profile (song, artist, cover art, and a progress bar) just like Spotify does.

## How it works

- The window loads the actual soundcloud.com — your login, your account, the real SoundCloud UI. No API key, no scraping tricks.
- A preload script reads the page's Media Session data (title/artist/artwork) and the `<audio>` element's playback position, and reports it to the main process every second.
- The main process pushes that into Discord via Rich Presence (IPC to your local Discord client), the same mechanism Spotify uses.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a Discord application (this is what gives Discord an app name/icon to show):
   - Go to https://discord.com/developers/applications
   - "New Application" → name it "SoundCloud" (or whatever you like)
   - Copy the **Application ID**
   - Optional: under Rich Presence → Art Assets, upload a SoundCloud logo image named `soundcloud-logo` — used as a fallback icon.
3. Paste that ID into [src/config.js](src/config.js) as `DISCORD_CLIENT_ID`.
4. Run it:
   ```bash
   npm start
   ```
5. Log into SoundCloud in the app window like normal, play a track, and check your Discord profile.

## Notes

- Discord Rich Presence only shows to other people while Discord desktop is running on the same machine as this app.
- Progress bar accuracy depends on SoundCloud continuing to populate the standard Media Session API, which it currently does for OS media-key support.
- To build a distributable installer: `npm run dist` (uses electron-builder).
