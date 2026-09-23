import { Router } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  const router = new Router(appContainer);
  router.init();

  const themeToggleBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('gamestash-theme') || 'dark';

  const moonIcon = `<svg class="icon-theme" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  const sunIcon = `<svg class="icon-theme" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gamestash-theme', theme);
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
    }
  }

  setTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  }

  const logoLink = document.querySelector('.logo');
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      e.preventDefault();

      const currentHash = window.location.hash;
      const hasQueryParams = currentHash.includes('?');
      const isOtherView = !currentHash.startsWith('#/catalog') && currentHash !== '#/' && currentHash !== '';
      const needsReset = hasQueryParams || isOtherView;

      const performReset = () => {
        if (needsReset) {
          window.location.hash = '#/catalog';
        }
      };

      if (window.scrollY > 0) {
        const scrollTarget = { y: window.scrollY };
        gsap.to(scrollTarget, {
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          onUpdate: () => {
            window.scrollTo(0, scrollTarget.y);
          },
          onComplete: () => {
            performReset();
          }
        });
      } else {
        performReset();
      }
    });
  }
});