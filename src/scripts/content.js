const SIDEBAR_ITEMS = [
  {
    id: 'grok',
    label: 'Grok',
    regex: /\/i\/grok/
  },
  {
    id: 'communities',
    label: 'Communities',
    regex: /\/*\/communities/
  },
  {
    id: 'premium',
    label: 'Premium',
    regex: /\/i\/premium_sign_up/
  },
  {
    id: 'verified-orgs',
    label: 'Verified Orgs',
    regex: /\/i\/verified-orgs-signup/
  },
  {
    id: 'lists',
    label: 'Lists',
    regex: /\/*\/lists/
  },
  {
    id: 'monetization',
    label: 'Monetization',
    regex: /\/i\/monetization/
  },
  {
    id: 'ads',
    label: 'Ads',
    regex: /https:\/\/ads.x.com/
  },
  {
    id: 'jobs',
    label: 'Jobs',
    regex: /\/*\/jobs/
  },
  {
    id: 'spaces',
    label: 'Spaces',
    regex: /\/i\/spaces\/start/
  }
];

function waitForElement(selector, callback) {
  const selectedElement = document.querySelector(selector);

  if (selectedElement) {
    callback(selectedElement);
  } else {
    setTimeout(() => waitForElement(selector, callback), 100);
  }
}

waitForElement(
  '[role="banner"] [role="navigation"]',
  async (selectedElement) => {
    const currentLinksStates = await chrome.storage.sync.get(
      SIDEBAR_ITEMS.map((item) => item.id)
    );

    console.log({ currentLinksStates });

    const links = selectedElement.querySelectorAll('a');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      SIDEBAR_ITEMS.forEach((sidebarItem) => {
        if (sidebarItem.regex.test(href)) {
          link.style.display = currentLinksStates[sidebarItem.id]
            ? 'none'
            : 'flex';
        }
      });
    });
  }
);

chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg.type === 'optionChange') {
    waitForElement('[role="banner"] [role="navigation"]', (selectedElement) => {
      const links = selectedElement.querySelectorAll('a');
      const sidebarItemChecked = SIDEBAR_ITEMS.find(
        (sidebarItem) => sidebarItem.id === msg.id
      );
      links.forEach((link) => {
        const href = link.getAttribute('href');
        if (sidebarItemChecked.regex.test(href)) {
          link.style.display = msg.checked ? 'none' : 'flex';
        }
      });
    });
  }
});
