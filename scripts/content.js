const LOCATIONS = {
  SIDEBAR: 'sidebar',
  DROPDOWN: 'dropdown'
};
const SIDEBAR_ITEMS = {
  grok: {
    id: 'grok',
    label: 'Grok',
    hrefSelector: 'grok',
    display: 'none',
    location: LOCATIONS.SIDEBAR
  },
  communities: {
    id: 'communities',
    label: 'Communities',
    hrefSelector: 'communities',
    display: 'none',
    location: LOCATIONS.SIDEBAR
  },
  premium: {
    id: 'premium',
    label: 'Premium',
    hrefSelector: 'premium',
    display: 'none',
    location: LOCATIONS.SIDEBAR
  },
  'verified-orgs': {
    id: 'verified-orgs',
    label: 'Verified Orgs',
    hrefSelector: 'verified',
    display: 'none',
    location: LOCATIONS.SIDEBAR
  },
  lists: {
    id: 'lists',
    label: 'Lists',
    hrefSelector: 'lists',
    display: 'none',
    location: LOCATIONS.DROPDOWN
  },
  monetization: {
    id: 'monetization',
    label: 'Monetization',
    hrefSelector: 'monetization',
    display: 'none',
    location: LOCATIONS.DROPDOWN
  },
  ads: {
    id: 'ads',
    label: 'Ads',
    hrefSelector: 'ads',
    display: 'none',
    location: LOCATIONS.DROPDOWN
  },
  jobs: {
    id: 'jobs',
    label: 'Jobs',
    hrefSelector: 'jobs',
    display: 'none',
    location: LOCATIONS.DROPDOWN
  },
  spaces: {
    id: 'spaces',
    label: 'Spaces',
    hrefSelector: 'spaces',
    display: 'none',
    location: LOCATIONS.DROPDOWN
  }
};

function createAndAppendStyleElement(targetItems) {
  const style = document.createElement('style');

  targetItems.forEach((targetItem) => {
    if (targetItem.location === LOCATIONS.SIDEBAR) {
      style.innerHTML += `
      [role="banner"] a[href*="${targetItem.hrefSelector}"] {
        display: ${targetItem.display} !important;
      }
      `;
    }
    if (targetItem.location === LOCATIONS.DROPDOWN) {
      style.innerHTML += `
      [role="menu"] a[href*="${targetItem.hrefSelector}"] {
        display: ${targetItem.display} !important;
      }
      `;
    }
  });

  document.head.append(style);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'optionChange') {
    const targetItem = SIDEBAR_ITEMS[msg.id];
    targetItem.display = msg.checked ? 'none' : 'flex';
    createAndAppendStyleElement([targetItem]);
  }
});

chrome.storage.sync.get(null, (data) => {
  const options = data;
  if (options) {
    const targetItems = [];
    Object.keys(options).forEach((key) => {
      const targetItem = SIDEBAR_ITEMS[key];
      targetItem.display = options[key] ? 'none' : 'flex';
      targetItems.push(targetItem);
    });
    createAndAppendStyleElement(targetItems);
  }
});
