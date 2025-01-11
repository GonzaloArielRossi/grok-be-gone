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

waitForElement('#grok-gone-checklist', async (selectedElement) => {
  const storeState = await chrome.storage.sync.get();
  SIDEBAR_ITEMS.forEach((item) => {
    const isChecked = storeState[item.id] ?? true;
    const li = document.createElement('li');
    const img = document.createElement('img');
    img.src = `./assets/sidebar-logos/${item.id}-logo.svg`;
    img.alt = item.label;
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = isChecked;
    input.id = item.id;
    const label = document.createElement('label');
    label.htmlFor = item.id;
    label.textContent = item.label;
    li.append(img, input, label);
    input.addEventListener('change', () => {
      chrome.storage.sync.set({ [item.id]: input.checked });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'optionChange',
          id: item.id,
          checked: input.checked
        });
      });
    });
    input.addEventListener('click', (event) => {
      event.stopPropagation();
    });
    li.addEventListener('click', () => {
      input.checked = !input.checked;
      const e = new Event('change');
      input.dispatchEvent(e);
    });
    selectedElement.append(li);
  });
});

waitForElement('#select-all', (selectedElement) => {
  selectedElement.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(
      (checkbox) => checkbox.checked
    );
    checkboxes.forEach((checkbox) => {
      checkbox.checked = !allChecked;
      const event = new Event('change');
      checkbox.dispatchEvent(event);
    });
  });
});
