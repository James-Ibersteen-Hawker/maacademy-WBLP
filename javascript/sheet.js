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
  }).map(({TEACHERS: t, SCHEDULES}) => {
    const { Name, Specialization, Photo, About } = t;
    const specs = Specialization.split(" / ");
    specs.forEach(e => filters.add(e));
     return {
        TEACHERS: new Teacher(Name, Photo, specs, About),
        SCHEDULES,
      };
  });
  return { teachers: arr, filters: Array.from(filters) };
}
const contactOpp = (data) => data;
function imgGalleries(data) {
  const obj = Object.entries(data).reduce((payload, [category, images]) => {
    payload[category] = images.filter(Boolean);
    return payload;
  }, {});
  return Object.entries(obj).length > 0 ? obj : null;
}
const radioCity = (data) => data;
//----------helpers----------//
const funcLUT = {
  "front page": frontpage,
  "teachers + schedules": teachersSched,
  "contact info + opportunities": contactOpp,
  "image galleries": imgGalleries,
  "radio city gallery": radioCity,
};
export async function sheet(fetchlink, abortTimeout) {
  const controller = new AbortController();
  const signal = controller.signal;
  const timeout = setTimeout(() => controller.abort(), abortTimeout);
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
