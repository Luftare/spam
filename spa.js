const SPA = {
  pages: [],
  scopedPageScripts: {},
  state: {},
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
    this.requestScopedPageScript(route);
    this.showPage(page);
  },
  requestScopedPageScript(rawRoute) {
    const route = this.getRouteFileName(rawRoute);
    const pageScript = this.scopedPageScripts[route];
    if (pageScript) {
      pageScript(this.state);
    }
  },
  getRequestedPageElement(rawRoute) {
    const route = this.getRouteFileName(rawRoute);
    return this.pages.find(page => page.getAttribute('data-route') === route);
  },
  getRouteFileName(rawRouteName) {
    if (rawRouteName === '/') return '/index.html';

    const explicitRouteName = rawRouteName + '.html';
    const explicitRouteNameCandidate = this.pages.find(
      page => page.getAttribute('data-route') === explicitRouteName
    );

    if (explicitRouteNameCandidate) return explicitRouteName;

    const implicitRouteName = rawRouteName + '/index.html';
    const implicitRouteNameCandidate = this.pages.find(
      page => page.getAttribute('data-route') === implicitRouteName
    );
    if (implicitRouteNameCandidate) implicitRouteName;
  }
};

window.onload = SPA.init.bind(SPA);
