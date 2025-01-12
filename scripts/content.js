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
    regex: /\/i\/premium*/
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
    return;
  }
  setTimeout(() => waitForElement(selector, callback), 100);
}

async function toggleLinksVisibility(links) {
  const currentLinksStates = await chrome.storage.sync.get(
    SIDEBAR_ITEMS.map((item) => item.id)
  );
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

waitForElement(
  '[role="banner"] [role="navigation"]',
  async (selectedElement) => {
    const links = selectedElement.querySelectorAll('a');
    await toggleLinksVisibility(links);
    const showMoreButton = selectedElement.querySelector(
      'button[aria-expanded="false"]'
    );
    showMoreButton.addEventListener('click', (event) => {
      console.log('showMoreButtonClicked');
      const expanded = event.target.getAttribute('aria-expanded') === 'true';
      const showMoreEvent = new CustomEvent('showMoreButtonClicked', {
        detail: { expanded }
      });
      window.dispatchEvent(showMoreEvent);
    });
  }
);

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'optionChange') {
    waitForElement(
      '[role="banner"] [role="navigation"]',
      async (selectedElement) => {
        const links = selectedElement.querySelectorAll('a');
        await toggleLinksVisibility(links);
      }
    );
    waitForElement(
      '[role="menu"] [data-testid="Dropdown"]',
      async (selectedElement) => {
        const links = selectedElement.querySelectorAll('a');
        await toggleLinksVisibility(links);
      }
    );
  }
});

window.addEventListener('showMoreButtonClicked', (event) => {
  if (!event.detail.expanded) {
    waitForElement(
      '[role="menu"] [data-testid="Dropdown"]',
      async (selectedElement) => {
        const links = selectedElement.querySelectorAll('a');
        await toggleLinksVisibility(links);
      }
    );
  }
});
