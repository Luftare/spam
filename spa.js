const SPA = {
  pages: [],
  scopedPageScripts: {},
  pageTemplates: {},
  state: {},
  init() {
    doT.templateSettings.varname = 'state';
    this.pages = [...document.querySelectorAll('.page')];
    const rawRoute = document.location.pathname;
    const route = this.getRouteFileName(rawRoute);
    this.handleNewRoute(route);

    if (history.state === null) {
      history.replaceState({ route: rawRoute }, '');
    }

    window.onpopstate = ({ state }) => {
      const route = this.getRouteFileName(state.route);
      this.handleNewRoute(route);
    };
  },
  initState(state) {
    const stateChangeHandler = {
      set: (target, key, value) => {
        target[key] = value;
        const rawRoute = document.location.pathname;
        const route = this.getRouteFileName(rawRoute);
        this.renderPageTemplate(route);
      }
    };

    this.state = new Proxy(state, stateChangeHandler);
  },
  followLink(linkElement) {
    const rawRoute = linkElement.getAttribute('data-href');
    const route = this.getRouteFileName(rawRoute);
    this.handleNewRoute(route);
    history.pushState({ route: rawRoute }, '', rawRoute);
  },
  showPage(pageToShow) {
    this.pages.forEach(page => {
      page.hidden = page !== pageToShow;
    });
  },
  handleNewRoute(route) {
    const page = this.getRequestedPageElement(route);
    this.requestScopedPageScript(route);
    this.renderPageTemplate(route);
    this.showPage(page);
  },
  renderPageTemplate(route) {
    const page = this.getRequestedPageElement(route);
    const pageTemplate = this.pageTemplates[route];
    const html = doT.template(pageTemplate)(this.state);
    page.innerHTML = html;
  },
  requestScopedPageScript(route) {
    const pageScript = this.scopedPageScripts[route];
    if (pageScript) {
      pageScript(this.state);
    }
  },
  getRequestedPageElement(route) {
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
