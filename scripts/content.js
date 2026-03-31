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
  }
};

function createAndAppendStyleElement(targetItems) {
  const style = document.createElement('style');
  const css = targetItems
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
    targetItem.display = msg.checked ? 'none' : 'flex';
    createAndAppendStyleElement([targetItem]);
  }
});

ext.storage.sync.get(null).then((data) => {
  const options = data;
  if (options) {
    const targetItems = [];
    Object.keys(options).forEach((key) => {
      const targetItem = OPTIONS[key];
      targetItem.display = options[key] ? 'none' : 'flex';
      targetItems.push(targetItem);
    });
    createAndAppendStyleElement(targetItems);
  }
});
