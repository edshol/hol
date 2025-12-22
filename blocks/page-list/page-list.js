export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const config = {};

  // table → config に変換
  rows.forEach((row) => {
    const key = row.children[0]?.textContent.trim();
    const value = row.children[1]?.textContent.trim();
    if (key && value) config[key] = value;
  });

  const {
    path = '/',
    limit = 10,
    template = 'simple',
  } = config;

  // index取得
  const resp = await fetch('/query-index.json');
  const json = await resp.json();

  // path filter
  const pages = json.data
    .filter((item) => item.path.startsWith(path))
    .slice(0, Number(limit));

  // 描画
  const ul = document.createElement('ul');
  ul.className = `page-list-${template}`;

  pages.forEach((page) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <a href="${page.path}">
        <strong>${page.title || ''}</strong><br>
        <span>${page.description || ''}</span>
      </a>
    `;
    ul.appendChild(li);
  });

  block.textContent = '';
  block.appendChild(ul);
}
