class Hit {
  constructor(exact, preamble, postamble, url, value) {
    this.exact = exact;
    this.preamble = preamble;
    this.postamble = postamble;
    this.url = url;
    this.value = value;
  }
}
class Page {
  constructor(name, url, icon) {
    this.name = name;
    this.url = url;
    this.icon = icon;
  }
}