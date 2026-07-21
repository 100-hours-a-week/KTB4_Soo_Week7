import { useInsertionEffect } from 'react';
import themeStyles from '../../../styles/bugdex-theme.css?inline';

export function usePageStyles(pageName, pageStyles) {
  useInsertionEffect(() => {
    const element = document.createElement('style');
    element.dataset.pageStyles = pageName;
    element.textContent = `${pageStyles}\n${themeStyles}`;
    document.head.appendChild(element);

    return () => element.remove();
  }, [pageName, pageStyles]);
}
