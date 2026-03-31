const SECTIONS = {
  SIDEBAR: 'sidebar',
  GROK: 'grok'
};

const OPTIONS = [
  {
    id: 'grok',
    label: 'Grok',
    section: SECTIONS.SIDEBAR
  },
  {
    id: 'communities',
    label: 'Communities',
    section: SECTIONS.SIDEBAR
  },
  {
    id: 'premium',
    label: 'Premium',
    section: SECTIONS.SIDEBAR
  },
  {
    id: 'creatorsStudio',
    label: 'Creators Studio',
    section: SECTIONS.SIDEBAR
  },
  {
    id: 'business',
    label: 'Business',
    section: SECTIONS.SIDEBAR
  },
  {
    id: 'lists',
    label: 'Lists',
    section: SECTIONS.SIDEBAR
  },
  {
    id: 'monetization',
    label: 'Monetization',
    section: SECTIONS.SIDEBAR
  },
  {
    id: 'ads',
    label: 'Ads',
    section: SECTIONS.SIDEBAR
  },
  {
    id: 'jobs',
    label: 'Jobs',
    section: SECTIONS.SIDEBAR
  },
  {
    id: 'spaces',
    label: 'Spaces',
    section: SECTIONS.SIDEBAR
  },
  {
    id: 'drawer',
    label: 'Drawer',
    section: SECTIONS.GROK
  },
  {
    id: 'profileSummary',
    label: 'Summary',
    section: SECTIONS.GROK
  },
  {
    id: 'postEnhancer',
    label: 'Enhance',
    section: SECTIONS.GROK
  },
  {
    id: 'postExplainer',
    label: 'Explain',
    section: SECTIONS.GROK
  }
];

async function main() {
  const sidebarChecklist = document.querySelector(
    '#grok-gone-sidebar-checklist'
  );
  const grokChecklist = document.querySelector('#grok-gone-grok-checklist');

  const storeState = await browser.storage.sync.get();
  OPTIONS.forEach((item) => {
    const isChecked = storeState[item.id] ?? false;
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
    input.addEventListener('change', async () => {
      await browser.storage.sync.set({ [item.id]: input.checked });
      const tabs = await browser.tabs.query({ url: 'https://x.com/*' });
      if (!tabs.length) return;
      await Promise.all(
        tabs.map((tab) =>
          browser.tabs.sendMessage(tab.id, {
            type: 'optionChange',
            id: item.id,
            checked: input.checked
          })
        )
      );
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

    if (item.section === SECTIONS.SIDEBAR) {
      sidebarChecklist.append(li);
    }
    if (item.section === SECTIONS.GROK) {
      grokChecklist.append(li);
    }
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
