const SIDEBAR_ITEMS = [
  {
    id: 'grok',
    label: 'Grok'
  },
  {
    id: 'communities',
    label: 'Communities'
  },
  {
    id: 'premium',
    label: 'Premium'
  },
  {
    id: 'verified-orgs',
    label: 'Verified Orgs'
  },
  {
    id: 'lists',
    label: 'Lists'
  },
  {
    id: 'monetization',
    label: 'Monetization'
  },
  {
    id: 'ads',
    label: 'Ads'
  },
  {
    id: 'jobs',
    label: 'Jobs'
  },
  {
    id: 'spaces',
    label: 'Spaces'
  }
];

async function main() {
  const checklist = document.querySelector('#grok-gone-checklist');
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
      chrome.tabs.query({ url: 'https://x.com/*' }, (tabs) => {
        if (!tabs.length) return;
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, {
            type: 'optionChange',
            id: item.id,
            checked: input.checked
          });
        });
      });
    });
    input.addEventListener('click', (event) => {
      event.stopPropagation();
    });
    label.addEventListener('click', (event) => {
      event.stopPropagation();
    });
    li.addEventListener('click', () => {
      input.checked = !input.checked;
      const e = new Event('change');
      input.dispatchEvent(e);
    });
    checklist.append(li);
  });

  document.querySelector('#select-all').addEventListener('click', () => {
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
}

main();
