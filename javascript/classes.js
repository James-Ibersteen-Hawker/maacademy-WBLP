class Hit {
  constructor(match, url) {
    this.match = match;
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
class MediaIcon {
  constructor(icon, url, alt) {
    this.icon = icon;
    this.url = url;
    this.alt = alt;
  }
}
class Teacher {
  constructor(name, image, specs, blurb) {
    this.name = name;
    this.image = image;
    this.specs = specs;
    this.blurb = blurb;
  }
}
class Instrument {
  constructor(name, teachers) {
    this.name = name;
    this.teachers = teachers.map(e => this.processTeacher(e));
  }
  processTeacher(t) {
    const { TEACHERS, SCHEDULES } = t;
    
  }
}