const ext =
  typeof globalThis.browser !== 'undefined'
    ? globalThis.browser
    : globalThis.chrome;

const LOCATIONS = {
  SIDEBAR: 'sidebar',
  DROPDOWN: 'dropdown',
  GROK: 'grok'
};

const ROLES = {
  BANNER: 'banner',
  LINK: 'link',
  MENU: 'menu',
  NONE: null
};

function getHrefSelector(option) {
  if (option.role === ROLES.LINK) {
    return `[role="${option.role}"][href*="${option.selector}"]`;
  }
  return `[role="${option.role}"] a[href*="${option.selector}"]`;
}

function getSelector(option) {
  return option.location === LOCATIONS.GROK
    ? option.selector
    : getHrefSelector(option);
}

const GROK_TAG_CLASS = 'grok-be-gone--grok-tag';
const GROK_TAG_STYLE_ID = 'grok-be-gone-grok-tag-style';

/** Matches @grok as a mention (start/whitespace/paren before handle). */
const GROK_MENTION_RE = /(^|[\s(])@grok\b/i;

function articleMentionsGrok(article) {
  const textBlocks = article.querySelectorAll('[data-testid="tweetText"]');
  for (const el of textBlocks) {
    if (GROK_MENTION_RE.test(el.textContent || '')) return true;
  }
  if (
    article.querySelector(
      'a[href="/grok" i], a[href="/Grok"], a[href*="://x.com/grok" i], a[href*="://twitter.com/grok" i]'
    )
  ) {
    return true;
  }
  return false;
}

function scanArticlesForGrokTag() {
  document
    .querySelectorAll('article[data-testid="tweet"]')
    .forEach((article) => {
      if (articleMentionsGrok(article)) {
        article.classList.add(GROK_TAG_CLASS);
      } else {
        article.classList.remove(GROK_TAG_CLASS);
      }
    });
}

let grokTagObserver = null;
let grokTagDebounce = null;
let pendingGrokTagRecords = [];

function processGrokTagMutations(records) {
  for (const record of records) {
    for (const node of record.addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const articles = new Set();
      if (node.matches?.('article[data-testid="tweet"]')) articles.add(node);
      node
        .querySelectorAll('article[data-testid="tweet"]')
        .forEach((a) => articles.add(a));
      for (const article of articles) {
        if (articleMentionsGrok(article)) {
          article.classList.add(GROK_TAG_CLASS);
        } else if (article.classList.contains(GROK_TAG_CLASS)) {
          article.classList.remove(GROK_TAG_CLASS);
        }
      }
    }
  }
}

function ensureGrokTagHideStyle() {
  if (document.getElementById(GROK_TAG_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = GROK_TAG_STYLE_ID;
  // Hide the timeline cell wrapper (borders live on cellInnerDiv), not only the article.
  style.textContent = `
div[data-testid="cellInnerDiv"]:has(article.${GROK_TAG_CLASS}) {
  display: none !important;
}
article.${GROK_TAG_CLASS} {
  display: none !important;
}
`.trim();
  document.head.append(style);
}

function removeGrokTagHideStyle() {
  document.getElementById(GROK_TAG_STYLE_ID)?.remove();
}

function setPostsWithGrokTagEnabled(enabled) {
  if (grokTagDebounce !== null) {
    clearTimeout(grokTagDebounce);
    grokTagDebounce = null;
  }
  if (grokTagObserver) {
    grokTagObserver.disconnect();
    grokTagObserver = null;
  }
  pendingGrokTagRecords = [];
  if (enabled) {
    ensureGrokTagHideStyle();
    scanArticlesForGrokTag();
    grokTagObserver = new MutationObserver((records) => {
      pendingGrokTagRecords.push(...records);
      if (grokTagDebounce !== null) clearTimeout(grokTagDebounce);
      grokTagDebounce = setTimeout(() => {
        grokTagDebounce = null;
        const toProcess = pendingGrokTagRecords;
        pendingGrokTagRecords = [];
        processGrokTagMutations(toProcess);
      }, 120);
    });
    const grokObserverRoot =
      document.querySelector('main[role="main"]') ||
      document.querySelector('[data-testid="primaryColumn"]') ||
      document.documentElement;
    grokTagObserver.observe(grokObserverRoot, {
      childList: true,
      subtree: true
    });
  } else {
    removeGrokTagHideStyle();
    document.querySelectorAll(`article.${GROK_TAG_CLASS}`).forEach((el) => {
      el.classList.remove(GROK_TAG_CLASS);
    });
  }
}

const PREMIUM_PROMO_CLASS = 'grok-be-gone--premium-promo';
const PREMIUM_PROMO_STYLE_ID = 'grok-be-gone-premium-promo-style';

function climbPremiumPromoWrapper(anchor) {
  let el = anchor.parentElement;
  for (let depth = 0; depth < 18 && el; depth += 1, el = el.parentElement) {
    if (el.nodeType !== Node.ELEMENT_NODE) continue;
    const label = el.getAttribute?.('aria-label');
    if (label === 'Subscribe to Premium') return el;
    if (el.tagName === 'ASIDE' || el.getAttribute('role') === 'complementary') {
      return el;
    }
  }
  return null;
}

function rootForPremiumSignupLink(anchor) {
  const href = anchor.getAttribute('href') || anchor.href || '';
  if (!href.includes('premium_sign_up')) return null;
  return (
    anchor.closest('[aria-label="Subscribe to Premium"]') ||
    anchor.closest('aside') ||
    anchor.closest('[role="complementary"]') ||
    climbPremiumPromoWrapper(anchor)
  );
}

/** Prefer hiding the bordered wrapper (single-child parent) instead of only the inner aside/link. */
function premiumPromoHideShell(inner) {
  if (!inner || inner.nodeType !== Node.ELEMENT_NODE) return inner;
  const parent = inner.parentElement;
  if (
    parent &&
    parent.childElementCount === 1 &&
    parent.firstElementChild === inner
  ) {
    return parent;
  }
  return inner;
}

function scanPremiumPromos() {
  document.querySelectorAll(`.${PREMIUM_PROMO_CLASS}`).forEach((node) => {
    node.classList.remove(PREMIUM_PROMO_CLASS);
  });
  const shells = new Set();
  const addShell = (el) => {
    const inner = el && el.nodeType === Node.ELEMENT_NODE ? el : null;
    if (!inner) return;
    const shell = premiumPromoHideShell(inner);
    if (shell) shells.add(shell);
  };
  document
    .querySelectorAll('[aria-label="Subscribe to Premium"]')
    .forEach((el) => addShell(el));
  document.querySelectorAll('a[href*="premium_sign_up"]').forEach((a) => {
    const root = rootForPremiumSignupLink(a);
    if (root) addShell(root);
  });
  shells.forEach((el) => {
    el.classList.add(PREMIUM_PROMO_CLASS);
  });
}

let premiumPromoObserver = null;
let premiumPromoDebounce = null;
let pendingPremiumRecords = [];

function processPremiumPromoMutations(records) {
  const shells = new Set();
  const addShell = (el) => {
    const shell = premiumPromoHideShell(el);
    if (shell) shells.add(shell);
  };
  for (const record of records) {
    for (const node of record.addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      if (node.matches?.('[aria-label="Subscribe to Premium"]')) addShell(node);
      node
        .querySelectorAll('[aria-label="Subscribe to Premium"]')
        .forEach(addShell);
      if (node.matches?.('a[href*="premium_sign_up"]')) {
        const root = rootForPremiumSignupLink(node);
        if (root) addShell(root);
      }
      node.querySelectorAll('a[href*="premium_sign_up"]').forEach((a) => {
        const root = rootForPremiumSignupLink(a);
        if (root) addShell(root);
      });
    }
  }
  shells.forEach((el) => el.classList.add(PREMIUM_PROMO_CLASS));
}

function ensurePremiumPromoHideStyle() {
  if (document.getElementById(PREMIUM_PROMO_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = PREMIUM_PROMO_STYLE_ID;
  style.textContent = `.${PREMIUM_PROMO_CLASS} { display: none !important; }`;
  document.head.append(style);
}

function removePremiumPromoHideStyle() {
  document.getElementById(PREMIUM_PROMO_STYLE_ID)?.remove();
}

function setPremiumPromoEnabled(enabled) {
  if (premiumPromoDebounce !== null) {
    clearTimeout(premiumPromoDebounce);
    premiumPromoDebounce = null;
  }
  if (premiumPromoObserver) {
    premiumPromoObserver.disconnect();
    premiumPromoObserver = null;
  }
  pendingPremiumRecords = [];
  if (enabled) {
    ensurePremiumPromoHideStyle();
    scanPremiumPromos();
    premiumPromoObserver = new MutationObserver((records) => {
      pendingPremiumRecords.push(...records);
      if (premiumPromoDebounce !== null) clearTimeout(premiumPromoDebounce);
      premiumPromoDebounce = setTimeout(() => {
        premiumPromoDebounce = null;
        const toProcess = pendingPremiumRecords;
        pendingPremiumRecords = [];
        processPremiumPromoMutations(toProcess);
      }, 120);
    });
    const premiumObserverRoot =
      document.querySelector('main[role="main"]') ||
      document.querySelector('[data-testid="primaryColumn"]') ||
      document.documentElement;
    premiumPromoObserver.observe(premiumObserverRoot, {
      childList: true,
      subtree: true
    });
  } else {
    removePremiumPromoHideStyle();
    document.querySelectorAll(`.${PREMIUM_PROMO_CLASS}`).forEach((el) => {
      el.classList.remove(PREMIUM_PROMO_CLASS);
    });
  }
}

const OPTIONS = {
  grok: {
    id: 'grok',
    label: 'Grok',
    selector: 'grok',
    display: 'none',
    role: ROLES.BANNER,
    location: LOCATIONS.SIDEBAR
  },
  communities: {
    id: 'communities',
    label: 'Communities',
    selector: 'communities',
    display: 'none',
    role: ROLES.LINK,
    location: LOCATIONS.SIDEBAR
  },
  premium: {
    id: 'premium',
    label: 'Premium',
    selector: 'premium',
    display: 'none',
    role: ROLES.BANNER,
    location: LOCATIONS.SIDEBAR
  },
  premiumSubscribePromo: {
    id: 'premiumSubscribePromo',
    label: 'Premium subscribe promo',
    selector: '',
    skipCss: true,
    display: 'none',
    role: ROLES.NONE,
    location: LOCATIONS.GROK
  },
  creatorsStudio: {
    id: 'creatorsStudio',
    label: 'Creators Studio',
    selector: 'creators/studio',
    display: 'none',
    role: ROLES.LINK,
    location: LOCATIONS.SIDEBAR
  },
  business: {
    id: 'business',
    label: 'Business',
    selector: 'verified-orgs-signup',
    display: 'none',
    role: ROLES.LINK,
    location: LOCATIONS.SIDEBAR
  },
  lists: {
    id: 'lists',
    label: 'Lists',
    selector: 'lists',
    display: 'none',
    role: ROLES.MENU,
    location: LOCATIONS.DROPDOWN
  },
  monetization: {
    id: 'monetization',
    label: 'Monetization',
    selector: 'monetization',
    display: 'none',
    role: ROLES.MENU,
    location: LOCATIONS.DROPDOWN
  },
  ads: {
    id: 'ads',
    label: 'Ads',
    selector: 'ads',
    display: 'none',
    role: ROLES.MENU,
    location: LOCATIONS.DROPDOWN
  },
  jobs: {
    id: 'jobs',
    label: 'Jobs',
    selector: 'jobs',
    display: 'none',
    role: ROLES.MENU,
    location: LOCATIONS.DROPDOWN
  },
  spaces: {
    id: 'spaces',
    label: 'Spaces',
    selector: 'spaces',
    display: 'none',
    role: ROLES.MENU,
    location: LOCATIONS.DROPDOWN
  },
  drawer: {
    id: 'drawer',
    label: 'Drawer',
    selector: 'div[data-testid="GrokDrawer"]',
    display: 'none',
    role: ROLES.NONE,
    location: LOCATIONS.GROK
  },
  profileSummary: {
    id: 'profileSummary',
    label: 'Summary',
    selector:
      'div[data-testid="HoverCard"] > div > div > div:last-child:has(> button), div:has(> div[data-testid="placementTracking"]) > :nth-child(2)',
    display: 'none',
    role: ROLES.NONE,
    location: LOCATIONS.GROK
  },
  postEnhancer: {
    id: 'postEnhancer',
    label: 'Enhance',
    selector:
      'div[role="tablist"] div[role="presentation"]:has(> button[data-testid="grokImgGen"])',
    display: 'none',
    role: ROLES.NONE,
    location: LOCATIONS.GROK
  },
  postExplainer: {
    id: 'postExplainer',
    label: 'Explain',
    selector: 'article div:has(> button[aria-label*="Grok"])',
    display: 'none',
    role: ROLES.NONE,
    location: LOCATIONS.GROK
  },
  postsWithGrokTag: {
    id: 'postsWithGrokTag',
    label: 'Posts with @grok',
    selector: '',
    skipCss: true,
    display: 'none',
    role: ROLES.NONE,
    location: LOCATIONS.GROK
  }
};

function createAndAppendStyleElement(targetItems) {
  const style = document.createElement('style');
  const css = targetItems
    .filter((targetItem) => !targetItem.skipCss)
    .map((targetItem) => {
      const selector = getSelector(targetItem);
      return `${selector} {\n  display: ${targetItem.display} !important;\n}`;
    })
    .join('\n');
  style.textContent = css;
  document.head.append(style);
}

ext.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'optionChange') {
    const targetItem = OPTIONS[msg.id];
    if (!targetItem) return;
    targetItem.display = msg.checked ? 'none' : 'flex';
    if (targetItem.skipCss && msg.id === 'postsWithGrokTag') {
      setPostsWithGrokTagEnabled(msg.checked);
    } else if (targetItem.skipCss && msg.id === 'premiumSubscribePromo') {
      setPremiumPromoEnabled(msg.checked);
    } else if (!targetItem.skipCss) {
      createAndAppendStyleElement([targetItem]);
    }
  }
});

function applyOptionsFromSync(data) {
  if (!data) return;
  const targetItems = [];
  Object.keys(data).forEach((key) => {
    const targetItem = OPTIONS[key];
    if (!targetItem) return;
    targetItem.display = data[key] ? 'none' : 'flex';
    targetItems.push(targetItem);
  });
  createAndAppendStyleElement(targetItems);
  setPostsWithGrokTagEnabled(data.postsWithGrokTag === true);
  setPremiumPromoEnabled(data.premiumSubscribePromo === true);
}

let awaitPossibleInstallDefaults = false;

ext.storage.sync.get(null).then((data) => {
  awaitPossibleInstallDefaults = !Object.keys(OPTIONS).some((k) =>
    Object.prototype.hasOwnProperty.call(data, k)
  );
  applyOptionsFromSync(data);
});

ext.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'sync' || !awaitPossibleInstallDefaults) return;
  if (!Object.keys(changes).some((k) => OPTIONS[k])) return;
  awaitPossibleInstallDefaults = false;
  void ext.storage.sync.get(null).then(applyOptionsFromSync);
});
