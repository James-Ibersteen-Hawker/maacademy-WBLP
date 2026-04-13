"use strict";
class Teacher {
  constructor(name, image, specs, blurb) {
    this.name = name;
    this.image = image;
    this.specs = specs;
    this.blurb = blurb;
  }
}
const frontpage = (data) => data;
function teachersSched(data) {
  const teachers = data.teachers;
  const filters = new Set();
  const arr = teachers.filter(({ TEACHERS: t, SCHEDULES }) => {
    const schedFilter = Object.values(SCHEDULES).some(Boolean);
    return schedFilter;
  }).map(({ TEACHERS: t, SCHEDULES }) => {
    const { Name, Specialization, Photo, About } = t;
    const specs = Specialization.split(" / ");
    specs.forEach(e => filters.add(e));
    return {
      TEACHERS: new Teacher(Name, Photo, specs, About),
      SCHEDULES,
    };
  });
  const classes = Array.from(filters).reduce((acc, val) => {
    acc[val] = [];
    return acc;
  }, {})
  arr.forEach(({ TEACHERS: t, SCHEDULES: s }) => {
    if (t.specs.length === 1) {
      classes[t.specs[0]].push({
        TEACHERS: t,
        SCHEDULES: s
      })
    }
    else if (t.specs.length > 1) {
      t.specs.forEach(spec => {
        const id = spec[0];
        const newSchedule = Object.entries(s).reduce((accu, [k, v]) => {
          const splitted = v.split("\n")
          const match = splitted.filter(e => e.toLowerCase().includes(`${id.toLowerCase()}:`));
          if (match.length > 0) accu[k] = match[0].slice(2).trim();
          else if (match.length === 0) accu[k] = "";
          return accu;
        }, {});
        if (Object.values(newSchedule).every(e => e === "")) return;
        classes[spec].push({
          TEACHERS: t,
          SCHEDULES: newSchedule
        })
      })
    }
  })
  const schedules = [];
  Object.entries(classes).forEach(([k, teachers]) => {
    const obj = {
      name: k,
      teachers: teachers.map(({TEACHERS, SCHEDULES}) => {
        const item = { name: TEACHERS.name, times: [] }
        Object.entries(SCHEDULES).forEach(([day, time]) => {
          if (!time) return;
          item.times.push(`${day} - ${time}`)
        })
        return item;
      })
    }
    schedules.push(obj)
  })
  return { teachers: arr, filters: Array.from(filters), schedules: schedules };
}
//item in classes = instrument, instrument.teachers, -> {name, days, times}
const contactOpp = (data) => data;
function imgGalleries(data) {
  const obj = Object.entries(data).reduce((payload, [category, images]) => {
    payload[category] = images.filter(Boolean);
    return payload;
  }, {});
  return Object.entries(obj).length > 0 ? obj : null;
}
const radioCity = (data) => data;
const special = (data) => ({special: data});
//----------helpers----------//
const funcLUT = {
  "front page": frontpage,
  "teachers + schedules": teachersSched,
  "contact info + opportunities": contactOpp,
  "image galleries": imgGalleries,
  "radio city gallery": radioCity,
  "special classes": special,
};
export async function sheet(fetchlink, abortTimeout) {
  const controller = new AbortController();
  const signal = controller.signal;
  const timeout = setTimeout(() => controller.abort(new Error("Timeout Exceeded")), abortTimeout);
  try {
    const data = await fetch(fetchlink, { signal });
    const sheets = (await data.json())?.sheets ?? {};
    return Object.entries(sheets).reduce((obj, [name, sheetData]) => {
      const func = funcLUT[name.trim().toLowerCase()];
      if (func) Object.assign(obj, func(sheetData));
      return obj;
    }, {});
  } catch (err) {
    throw new Error(`Error fetching or processing sheets: ${err.message}`);
  } finally {
    clearTimeout(timeout);
  }
}
