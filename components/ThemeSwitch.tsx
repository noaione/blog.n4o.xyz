import { useEffect, useState } from 'react';
import { isNone } from '@/lib/utils';

function ThemeChangeCallback(theme: string) {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const utteranceMessage = {
      type: 'set-theme',
      theme: theme === 'dark' ? 'github-dark' : 'github-light',
    };
    const giscusMessage = {
      giscus: {
        setConfig: {
          theme: theme === 'dark' ? 'transparent_dark' : 'light',
        },
      },
    };
    const utteranceFrame = document.querySelector<HTMLIFrameElement>('.utterances-frame');
    const giscusFrame = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    if (utteranceFrame !== null) {
      utteranceFrame.contentWindow.postMessage(utteranceMessage, 'https://utteranc.es');
    }
    if (giscusFrame !== null) {
      giscusFrame.contentWindow.postMessage(giscusMessage, 'https://giscus.app');
    }
  }
}

function useThemeToggler() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storage = localStorage.getItem('theme');
    let resolvedTheme: string;
    let preferDark = false;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      preferDark = true;
    }
    if (isNone(storage)) {
      resolvedTheme = preferDark ? 'dark' : 'light';
      localStorage.setItem('theme', resolvedTheme);
    } else {
      if (['dark', 'light'].includes(storage)) {
        resolvedTheme = storage;
      } else {
        resolvedTheme = preferDark ? 'dark' : 'light';
        localStorage.setItem('theme', resolvedTheme);
      }
    }
    setTheme(resolvedTheme);
  }, []);

  const realSetTheme = (theme: string) => {
    if (['dark', 'light'].includes(theme)) {
      setTheme(theme);
      localStorage.setItem('theme', theme);
      const isDark = document.documentElement.classList.contains('dark');
      isDark
        ? document.documentElement.classList.remove('dark')
        : document.documentElement.classList.add('dark');
    }
  };

  return {
    theme,
    setTheme: realSetTheme,
  };
}

const ThemeSwitch = () => {
  const { theme, setTheme } = useThemeToggler();

  useEffect(() => {
    ThemeChangeCallback(theme);
  }, [theme]);

  return (
    <button
      aria-label="Toggle Dark Mode"
      type="button"
      className="w-8 h-8 p-1 ml-1 mr-1 rounded sm:ml-4 focus:outline-none hover:opacity-80 duration-150"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="text-gray-900 dark:text-gray-100"
      >
        {theme === 'dark' ? (
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        ) : (
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        )}
      </svg>
    </button>
  );
};

export default ThemeSwitch;
