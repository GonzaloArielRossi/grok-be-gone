const ext =
  typeof globalThis.browser !== 'undefined'
    ? globalThis.browser
    : globalThis.chrome;

/** Keep in sync with hide-option ids in scripts/content.js OPTIONS */
const INSTALL_DEFAULT_HIDE_IDS = [
  'grok',
  'communities',
  'premium',
  'creatorsStudio',
  'business',
  'lists',
  'monetization',
  'ads',
  'jobs',
  'spaces',
  'drawer',
  'profileSummary',
  'postEnhancer',
  'postExplainer',
  'postsWithGrokTag',
  'premiumSubscribePromo'
];

ext.runtime.onInstalled.addListener(({ reason }) => {
  if (reason !== 'install') return;
  const patch = Object.fromEntries(
    INSTALL_DEFAULT_HIDE_IDS.map((id) => [id, true])
  );
  void ext.storage.sync.set(patch);
});
