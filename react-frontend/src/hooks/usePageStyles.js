import { useInsertionEffect } from 'react';
import themeStyles from '../../../styles/bugdex-theme.css?inline';

const themeStylesWithoutFontImport = themeStyles.replace(/^@import[^\n]*\n+/, '');

export function usePageStyles(pageName, pageStyles) {
  useInsertionEffect(() => {
    const element = document.createElement('style');
    element.dataset.pageStyles = pageName;
    element.textContent = `${pageStyles}\n${themeStylesWithoutFontImport}`;
    document.head.appendChild(element);

    return () => element.remove();
  }, [pageName, pageStyles]);
}
