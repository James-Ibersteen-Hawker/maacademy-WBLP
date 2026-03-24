class Hit {
  constructor(exact, match, url) {
    this.exact = exact;
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
      const applicable = entries.filter((e) => {
        const scnd = e?.[1] ? true : false;
        if (scnd) return e[0] === this.name.substring(0,1);
        else return true;
      }).flat().filter(e => isFinite(+e.substring(0,1)));
      return `${days}: ${applicable.join(" ; ")}`;
    });
    return { name, days, times };
  }
}
