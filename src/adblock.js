// Blocks SoundCloud's ad/tracking network requests (audio + video ads and
// the tracking beacons that go with them) at the request level.
const AD_HOST_PATTERNS = [
  // SoundCloud's own audio/promoted-content ad endpoints
  '*://api-v2.soundcloud.com/audio-ads*',
  '*://api-v2.soundcloud.com/promoted/*',
  '*://promoted.soundcloud.com/*',
  '*://ads.soundcloud.com/*',
  '*://invite.soundcloud.com/*',
  '*://*.cloudfront.net/components/refresh-all-ads-component*',
  '*://*.cloudfront.net/components/taboola-*',

  // Ad-tech / programmatic display networks
  '*://*.doubleclick.net/*',
  '*://*.googlesyndication.com/*',
  '*://*.googleadservices.com/*',
  '*://*.google-analytics.com/*',
  '*://*.googletagmanager.com/*',
  '*://*.googletagservices.com/*',
  '*://*.adtrafficquality.google/*',
  '*://*.moatads.com/*',
  '*://*.adsafeprotected.com/*',
  '*://*.adnxs.com/*',
  '*://*.criteo.com/*',
  '*://*.casalemedia.com/*',
  '*://*.pubmatic.com/*',
  '*://*.rubiconproject.com/*',
  '*://*.serving-sys.com/*',
  '*://*.scorecardresearch.com/*',
  '*://*.amazon-adsystem.com/*',
  '*://*.taboola.com/*',
  '*://*.outbrain.com/*',
  '*://*.demdex.net/*',
  '*://*.adform.net/*',
  '*://*.aditude.io/*',
  '*://*.script.ac/*',
  '*://prodregistryv2.org/*',
  '*://*.ads.reddit.com/*',
  '*://www.redditstatic.com/ads/*'
];

function enableAdBlocking(ses) {
  ses.webRequest.onBeforeRequest({ urls: AD_HOST_PATTERNS }, (_details, callback) => {
    callback({ cancel: true });
  });
}

// CSS injected into the page to hide any leftover ad-container elements
// SoundCloud renders client-side (banner slots, "upgrade to remove ads"
// prompts) even once the network calls that would fill them are blocked.
const AD_HIDING_CSS = `
  .adsWrapper,
  .companionAd,
  [class*="adUnit"],
  [class*="leaderboard"],
  [data-testid="ad-slot"],
  .prestitial,
  .prestitialAd {
    display: none !important;
  }
`;

module.exports = { enableAdBlocking, AD_HIDING_CSS };
