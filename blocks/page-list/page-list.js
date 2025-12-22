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

  const pages = json.data
    .filter((item) => item.path.startsWith(path))
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
