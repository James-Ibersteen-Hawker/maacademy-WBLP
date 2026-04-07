class Hit {
  constructor(exact, preamble, postamble, url) {
    this.exact = exact;
    this.preamble = preamble;
    this.postamble = postamble;
    this.url = url;
  }
}
class Page {
  constructor(name, url, icon) {
    this.name = name;
    this.url = url;
    this.icon = icon;
  }
}