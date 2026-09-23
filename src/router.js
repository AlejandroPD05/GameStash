import { renderCatalogView } from './views/catalogView.js';
import { renderDetailView } from './views/detailView.js';

const routes = {
  '#/': renderCatalogView,
  '#/catalog': renderCatalogView,
  '#/game': renderDetailView
};

export class Router {
  constructor(appElement) {
    this.app = appElement;
    this.isTransitioning = false;
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('DOMContentLoaded', () => this.handleRoute());
  }

  async handleRoute() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    try {
      const rawHash = window.location.hash || '#/';
      const [path, queryString] = rawHash.split('?');
      const queryParams = new URLSearchParams(queryString || '');

      const renderView = routes[path] || renderCatalogView;

      if (this.app.children.length > 0 && window.gsap) {
        await window.gsap.to(this.app, {
          opacity: 0,
          y: -15,
          duration: 0.2,
          ease: 'power1.in'
        });
      }

      this.app.innerHTML = '';
      window.scrollTo(0, 0);

      const viewElement = await renderView(queryParams);
      this.app.appendChild(viewElement);

      if (window.gsap) {
        window.gsap.fromTo(
          this.app,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
        );
      }
    } catch (error) {
      console.error("Error al cambiar de ruta:", error);
    } finally {
      this.isTransitioning = false;
    }
  }
}