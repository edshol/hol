/**
 * "YYYY/MM/DD HH24:MI" → Date
 * 未定義・空・不正は null
 */
function parseDateTime(str) {
  if (!str || !str.trim()) return null;

  const iso = str
    .trim()
    .replace(/\//g, '-')
    .replace(' ', 'T') + ':00';

  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * エントリーの代表日時
 * startdate → lastmodified
 */
function getEntryDate(page) {
  return (
    parseDateTime(page.startdate) ||
    (page.lastmodified ? new Date(page.lastmodified) : null) ||
    new Date(0)
  );
}

/**
 * 日付範囲内か（未設定は true）
 */
function isWithinDateRange(page, now = new Date()) {
  const start = parseDateTime(page.startdate);
  const end = parseDateTime(page.enddate);

  if (start && now < start) return false;
  if (end && now > end) return false;

  return true;
}

/**
 * badge 判定
 * return: 'upcoming' | 'active' | 'ended' | null
 */
function getCampaignStatus(page, now = new Date()) {
  const start = parseDateTime(page.startdate);
  const end = parseDateTime(page.enddate);

  if (start && now < start) return 'upcoming';
  if (end && now > end) return 'ended';
  if (start) return 'active';

  return null;
}

/**
 * 代表日時で新しい順
 */
function sortByEntryDateDesc(a, b) {
  return getEntryDate(b) - getEntryDate(a);
}

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const config = {};

  // table → config
  rows.forEach((row) => {
    const key = row.children[0]?.textContent.trim();
    const value = row.children[1]?.textContent.trim();
    if (key && value) config[key] = value;
  });

  let { path, limit = 12 } = config;

  if (!path) {
    console.warn('page-list: path is required');
    return;
  }

  if (!path.endsWith('/')) path += '/';

  const resp = await fetch('/query-index.json');
  const json = await resp.json();

  const now = new Date();

  const pages = json.data
    .filter((item) => item.path.startsWith(path))
    .filter((item) => isWithinDateRange(item, now))
    .sort(sortByEntryDateDesc)
    .slice(0, Number(limit));

  const wrapper = document.createElement('div');
  wrapper.className = 'page-list';

  pages.forEach((page) => {
    const status = getCampaignStatus(page, now);

    const badgeHtml = status
      ? `<span class="campaign-badge campaign-badge--${status}">
          ${status === 'active' ? '開催中' : status === 'upcoming' ? '予告' : '終了'}
        </span>`
      : '';

    const card = document.createElement('a');
    card.className = 'page-card';
    card.href = page.path;

    card.innerHTML = `
      <div class="page-card-image">
        ${badgeHtml}
        ${page.image ? `<img src="${page.image}" alt="">` : ''}
      </div>
      <div class="page-card-body">
        <h3>${page.title || ''}</h3>
        <p>${page.description || ''}</p>
      </div>
    `;

    wrapper.appendChild(card);
  });

  block.replaceChildren(wrapper);
}
