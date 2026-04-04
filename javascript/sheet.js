"use strict";
const frontpage = (data) => data;
function teachersSched(data) {
  return "bacon";
}
const contactOpp = (data) => data;
function imgGalleries(data) {
  const obj = Object.entries(data).reduce((payload, [category, images]) => {
    payload[category] = images.filter(Boolean);
    return payload;
  }, {});
  return Object.entries(obj).length > 0 ? obj : null;
}
//----------helpers----------//
const funcLUT = {
  "front page": frontpage,
  "teachers + schedules": teachersSched,
  "contact info + opportunities": contactOpp,
  "image galleries": imgGalleries,
};
export async function sheet(fetchlink, abortTimeout) {
  console.log("sheet js");
  const controller = new AbortController();
  const signal = controller.signal;
  const timeout = setTimeout(() => controller.abort(), abortTimeout);
  try {
    const data = await fetch(fetchlink, { signal });
    // const data = await fetch("../test.json", { signal });
    const sheets = (await data.json())?.sheets ?? {};
    return Object.entries(sheets).reduce((obj, [name, sheetData]) => {
      const func = funcLUT[name.trim().toLowerCase()];
      if (func) Object.assign(obj, func(sheetData))
      return obj;
    }, {});
  } catch (err) {
    throw new Error(`Error fetching or processing sheets: ${err.message}`);
  } finally {
    clearTimeout(timeout);
  }
}
