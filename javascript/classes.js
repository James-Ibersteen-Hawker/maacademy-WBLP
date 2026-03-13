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
//reminder, sheet.js already FILTERED the teachers!
class Instrument {
  constructor(name, teachers) {
    this.name = name;
    this.teachers = teachers.map((e) => this.processTeacher(e));
  }
  processTeacher({ TEACHERS: { name } = {}, SCHEDULES: sched = {} }) {
    const schedule = Object.entries(sched).filter(([_, times]) => times !== "");
    const days = schedule.map(([day]) => day);
    const times = schedule.map(([days, times]) => {
      const entries = times.split(/\n/g).map((e) => e.split(": "));
      const applicable = entries.filter(
        (e) =>
          e.substring(0, 1).toLowerCase() ===
          this.name.substring(0, 1).toLowerCase(),
      );
    });
    return { name, days, times };
  }
}
