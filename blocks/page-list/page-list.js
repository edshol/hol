/**
 * "YYYY/MM/DD HH24:MI" → Date
 * 未定義・空・不正な場合は null を返す
 */
function parseDateTime(str) {
  if (!str || !str.trim()) return null;

  // "2025/03/31 23:59"
  // → "2025-03-31T23:59:00"
  const iso = str
    .trim()
    .replace(/\//g, '-')
    .replace(' ', 'T') + ':00';

  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * 今日(now)が start/end の範囲内か判定
 * - start が無い → 制限なし
 * - end が無い → 制限なし
 * - 両方無い → 常に表示
 */
function isWithinDateRange(page, now = new Date()) {
  const start = parseDateTime(page.startdate);
  const end = parseDateTime(page.enddate);

  if (start && now < start) return false;
  if (end && now > end) return false;

  return true;
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

  // 末尾スラッシュを保証
  if (!path.endsWith('/')) path += '/';

  const resp = await fetch('/query-index.json');
  const json = await resp.json();

  const now = new Date();

  const pages = json.data
    // path 配下のみ
    .filter((item) => item.path.startsWith(path))
    // 日付範囲内のみ（未設定は通す）
    .filter((item) => isWithinDateRange(item, now))
    // 件数制限
    .slice(0, Number(limit));

  const wrapper = document.createElement('div');
  wrapper.className = 'page-list';

  pages.forEach((page) => {
    const card = document.createElement('a');
    card.className = 'page-card';
    card.href = page.path;

    card.innerHTML = `
      <div class="page-card-image">
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
