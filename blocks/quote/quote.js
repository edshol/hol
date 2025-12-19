import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  block.querySelectorAll('img').forEach((img) => {
    // 既存のpicture要素を取得
    const originalPicture = img.closest('picture');
    
    // 1200pxを明示的に含めたブレークポイントを指定
    // 第3引数は eager（即時読み込み）にするかどうか
    // 第4引数の width が、実際にサーバーへ要求する画像サイズになります
    const optimizedPicture = createOptimizedPicture(img.src, img.alt, false, [
      { media: '(min-width: 600px)', width: '1200' }, // 600px以上の画面では1200pxの画像を要求
      { width: '750' } // それ以外（スマホなど）
    ]);

    originalPicture.replaceWith(optimizedPicture);
  });
}