const LOCATIONS = {
  SIDEBAR: 'sidebar',
  DROPDOWN: 'dropdown',
  GROK: 'grok'
};

function getHrefSelector(option) {
  const role = option.location === LOCATIONS.SIDEBAR ? 'banner' : 'menu';
  return `[role="${role}"] a[href*="${option.selector}"]`;
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
    location: LOCATIONS.SIDEBAR
  },
  communities: {
    id: 'communities',
    label: 'Communities',
    selector: 'communities',
    display: 'none',
    location: LOCATIONS.SIDEBAR
  },
  premium: {
    id: 'premium',
    label: 'Premium',
    selector: 'premium',
    display: 'none',
    location: LOCATIONS.SIDEBAR
  },
  'verified-orgs': {
    id: 'verified-orgs',
    label: 'Verified Orgs',
    selector: 'verified',
    display: 'none',
    location: LOCATIONS.SIDEBAR
  },
  lists: {
    id: 'lists',
    label: 'Lists',
    selector: 'lists',
    display: 'none',
    location: LOCATIONS.DROPDOWN
  },
  monetization: {
    id: 'monetization',
    label: 'Monetization',
    selector: 'monetization',
    display: 'none',
    location: LOCATIONS.DROPDOWN
  },
  ads: {
    id: 'ads',
    label: 'Ads',
    selector: 'ads',
    display: 'none',
    location: LOCATIONS.DROPDOWN
  },
  jobs: {
    id: 'jobs',
    label: 'Jobs',
    selector: 'jobs',
    display: 'none',
    location: LOCATIONS.DROPDOWN
  },
  spaces: {
    id: 'spaces',
    label: 'Spaces',
    selector: 'spaces',
    display: 'none',
    location: LOCATIONS.DROPDOWN
  },
  drawer: {
    id: 'drawer',
    label: 'Drawer',
    selector: 'div[data-testid="GrokDrawer"]',
    display: 'none',
    location: LOCATIONS.GROK
  },
  profileSummary: {
    id: 'profileSummary',
    label: 'Summary',
    selector:
      'div[data-testid="HoverCard"] > div > div > div:last-child:has(> button), div:has(> div[data-testid="placementTracking"]) > :nth-child(2)',
    display: 'none',
    location: LOCATIONS.GROK
  },
  postEnhancer: {
    id: 'postEnhancer',
    label: 'Enhance',
    selector:
      'div[role="tablist"] div[role="presentation"]:has(> button[data-testid="grokImgGen"])',
    display: 'none',
    location: LOCATIONS.GROK
  },
  postExplainer: {
    id: 'postExplainer',
    label: 'Explain',
    selector: 'article div:has(> button[aria-label*="Grok"])',
    display: 'none',
    location: LOCATIONS.GROK
  }
};

function createAndAppendStyleElement(targetItems) {
  const style = document.createElement('style');

  targetItems.forEach((targetItem) => {
    const selector = getSelector(targetItem);
    style.innerHTML += `
      ${selector} {
        display: ${targetItem.display} !important;
      }
    `;
  });

  document.head.append(style);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'optionChange') {
    const targetItem = OPTIONS[msg.id];
    targetItem.display = msg.checked ? 'none' : 'flex';
    createAndAppendStyleElement([targetItem]);
  }
});

chrome.storage.sync.get(null, (data) => {
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
