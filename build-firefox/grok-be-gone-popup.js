const ext =
  typeof globalThis.browser !== 'undefined'
    ? globalThis.browser
    : globalThis.chrome;

const SIDEBAR_MASTER_ID = 'sidebar-master';

/** Sidebar & overflow menu — only inside fine-tune disclosure. */
const SIDEBAR_OPTIONS = [
  { id: 'grok', label: 'Grok' },
  { id: 'communities', label: 'Communities' },
  { id: 'premium', label: 'Premium' },
  { id: 'creatorsStudio', label: 'Creators Studio' },
  { id: 'business', label: 'Business' },
  { id: 'lists', label: 'Lists' },
  { id: 'monetization', label: 'Monetization' },
  { id: 'ads', label: 'Ads' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'spaces', label: 'Spaces' }
];

const GROK_UI_BUNDLE_IDS = [
  'drawer',
  'profileSummary',
  'postEnhancer',
  'postExplainer'
];

const GROK_SECTION_ROWS = [
  {
    kind: 'storage',
    id: 'postsWithGrokTag',
    label: 'Hide @grok mentions',
    sub: 'Remove timeline posts that tag or mention Grok.',
    logoId: 'at-grok-mention'
  },
  {
    kind: 'bundle',
    inputId: 'grok-ui-bundle',
    label: 'Hide Grok in the app',
    sub: 'Drawer, profile summaries, Enhance / Explain on posts.'
  },
  {
    kind: 'storage',
    id: 'premiumSubscribePromo',
    label: 'Hide Premium subscribe promo',
    sub: 'Sidebar card pushing X Premium signup.',
    logoId: 'premium'
  }
];

async function notifyTabsOptionChange(id, checked) {
  const tabs = await ext.tabs.query({ url: 'https://x.com/*' });
  if (!tabs.length) return;
  await Promise.all(
    tabs.map((tab) =>
      ext.tabs.sendMessage(tab.id, {
        type: 'optionChange',
        id,
        checked
      })
    )
  );
}

function grokBundleChecked(store) {
  return GROK_UI_BUNDLE_IDS.every((id) => store[id] === true);
}

async function setGrokBundle(checked) {
  const patch = Object.fromEntries(
    GROK_UI_BUNDLE_IDS.map((id) => [id, checked])
  );
  await ext.storage.sync.set(patch);
  await Promise.all(
    GROK_UI_BUNDLE_IDS.map((id) => notifyTabsOptionChange(id, checked))
  );
}

function getSidebarMasterInput() {
  return document.getElementById(SIDEBAR_MASTER_ID);
}

function syncSidebarMasterFromInputs() {
  const master = getSidebarMasterInput();
  if (!master) return;
  const states = SIDEBAR_OPTIONS.map(
    (o) => document.getElementById(o.id)?.checked === true
  );
  const count = states.filter(Boolean).length;
  const allOn = count === SIDEBAR_OPTIONS.length;
  const noneOn = count === 0;
  master.indeterminate = !allOn && !noneOn;
  master.checked = allOn;
}

async function setAllSidebar(checked) {
  const patch = Object.fromEntries(SIDEBAR_OPTIONS.map((o) => [o.id, checked]));
  await ext.storage.sync.set(patch);
  SIDEBAR_OPTIONS.forEach((o) => {
    const input = document.getElementById(o.id);
    if (input) input.checked = checked;
  });
  await Promise.all(
    SIDEBAR_OPTIONS.map((o) => notifyTabsOptionChange(o.id, checked))
  );
  const master = getSidebarMasterInput();
  if (master) {
    master.indeterminate = false;
    master.checked = checked;
  }
}

function attachRowHandlers(li, input, label) {
  input.addEventListener('click', (event) => {
    event.stopPropagation();
  });
  label.addEventListener('click', (event) => {
    event.stopPropagation();
  });
  li.addEventListener('click', () => {
    input.checked = !input.checked;
    input.dispatchEvent(new Event('change'));
  });
}

function buildSidebarRow(item, storeState, onIndividualChange) {
  const li = document.createElement('li');
  const img = document.createElement('img');
  img.src = `./assets/sidebar-logos/${item.id}-logo.svg`;
  img.alt = '';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = storeState[item.id] ?? false;
  input.id = item.id;
  const label = document.createElement('label');
  label.htmlFor = item.id;
  label.textContent = item.label;
  li.append(img, input, label);

  input.addEventListener('change', async () => {
    await ext.storage.sync.set({ [item.id]: input.checked });
    await notifyTabsOptionChange(item.id, input.checked);
    onIndividualChange();
  });
  attachRowHandlers(li, input, label);
  return li;
}

function buildSidebarMasterRow(storeState) {
  const li = document.createElement('li');
  li.classList.add('checklist__row--stack');
  const img = document.createElement('img');
  img.src = './assets/sidebar-logos/lists-logo.svg';
  img.alt = '';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = SIDEBAR_MASTER_ID;
  input.checked = SIDEBAR_OPTIONS.every((o) => storeState[o.id] === true);
  const count = SIDEBAR_OPTIONS.filter((o) => storeState[o.id] === true).length;
  input.indeterminate = count > 0 && count < SIDEBAR_OPTIONS.length;
  const label = document.createElement('label');
  label.htmlFor = SIDEBAR_MASTER_ID;
  const title = document.createElement('span');
  title.className = 'stack-row__title';
  title.textContent = 'Hide sidebar clutter';
  label.append(title);
  li.append(img, input, label);
  input.addEventListener('change', () => {
    const wantOn = input.checked;
    input.indeterminate = false;
    void setAllSidebar(wantOn);
  });
  attachRowHandlers(li, input, label);
  return li;
}

function buildGrokSectionRow(row, storeState) {
  const li = document.createElement('li');
  li.classList.add('checklist__row--stack');

  if (row.kind === 'bundle') {
    const img = document.createElement('img');
    img.src = './assets/sidebar-logos/grok-logo.svg';
    img.alt = '';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = grokBundleChecked(storeState);
    input.id = row.inputId;
    const label = document.createElement('label');
    label.htmlFor = row.inputId;
    const title = document.createElement('span');
    title.className = 'stack-row__title';
    title.textContent = row.label;
    label.append(title);
    if (row.sub) {
      const sub = document.createElement('span');
      sub.className = 'stack-row__sub';
      sub.textContent = row.sub;
      label.append(sub);
    }
    li.append(img, input, label);
    input.addEventListener('change', async () => {
      await setGrokBundle(input.checked);
    });
    attachRowHandlers(li, input, label);
    return li;
  }

  const logoBase = row.logoId ?? row.id;
  const img = document.createElement('img');
  img.src = `./assets/sidebar-logos/${logoBase}-logo.svg`;
  img.alt = '';
  if (logoBase === 'at-grok-mention') {
    img.classList.add('checklist__icon--mention-at');
  }
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = storeState[row.id] ?? false;
  input.id = row.id;
  const label = document.createElement('label');
  label.htmlFor = row.id;
  const title = document.createElement('span');
  title.className = 'stack-row__title';
  title.textContent = row.label;
  label.append(title);
  if (row.sub) {
    const sub = document.createElement('span');
    sub.className = 'stack-row__sub';
    sub.textContent = row.sub;
    label.append(sub);
  }
  li.append(img, input, label);
  input.addEventListener('change', async () => {
    await ext.storage.sync.set({ [row.id]: input.checked });
    await notifyTabsOptionChange(row.id, input.checked);
  });
  attachRowHandlers(li, input, label);
  return li;
}

async function main() {
  const sidebarMasterList = document.querySelector('#sidebar-master-list');
  const sidebarChecklist = document.querySelector(
    '#grok-gone-sidebar-checklist'
  );
  const grokChecklist = document.querySelector('#grok-gone-grok-checklist');
  const storeState = await ext.storage.sync.get();

  const onSidebarIndividualChange = () => syncSidebarMasterFromInputs();

  sidebarMasterList.append(buildSidebarMasterRow(storeState));

  SIDEBAR_OPTIONS.forEach((item) => {
    sidebarChecklist.append(
      buildSidebarRow(item, storeState, onSidebarIndividualChange)
    );
  });

  GROK_SECTION_ROWS.forEach((row) => {
    grokChecklist.append(buildGrokSectionRow(row, storeState));
  });

  syncSidebarMasterFromInputs();
}

main();
