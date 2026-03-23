function wrapWithDoubleQuotes(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed;
  }
  return `"${trimmed}"`;
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const quoteCell = rows[0]?.querySelector(':scope > div');
  const authorCell = rows[1]?.querySelector(':scope > div');

  if (!quoteCell) return;

  const quoteText = quoteCell.textContent || '';
  const blockquote = document.createElement('blockquote');
  const quoteParagraph = document.createElement('p');
  quoteParagraph.textContent = wrapWithDoubleQuotes(quoteText);
  blockquote.append(quoteParagraph);

  block.textContent = '';
  block.append(blockquote);

  if (authorCell) {
    const authorText = authorCell.textContent.trim().replace(/^\-\s*/, '');
    if (authorText) {
      const author = document.createElement('p');
      author.className = 'quote-author';
      author.textContent = `- ${authorText}`;
      block.append(author);
    }
  }
}
