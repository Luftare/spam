const SPA = {
  pages: [],
  init() {
    this.pages = [...document.querySelectorAll('.page')];
    const route = document.location.pathname;
    this.handleNewRoute(route);

    window.onpopstate = ({ state }) => {
      this.handleNewRoute(state.route);
    };
  },
  followLink(linkElement) {
    const route = linkElement.getAttribute('data-href');
    this.handleNewRoute(route);
    history.pushState({ route }, '', route);
  },
  showPage(pageToShow) {
    this.pages.forEach(page => {
      page.hidden = page !== pageToShow;
    });
  },
  handleNewRoute(route) {
    const page = this.getRequestedPageElement(route);
    this.showPage(page);
  },
  getRequestedPageElement(route) {
    if (route === '/') {
      return this.pages.find(
        page => page.getAttribute('data-route') === '/index.html'
      );
    }

    const extendedPageName = route + '.html';
    const namedFileMatch = this.pages.find(
      page => page.getAttribute('data-route') === extendedPageName
    );

    if (namedFileMatch) return namedFileMatch;

    const indexExtendedPageName = route + '/index.html';
    return this.pages.find(
      page => page.getAttribute('data-route') === indexExtendedPageName
    );
  }
};

SPA.init();
