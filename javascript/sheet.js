"use strict";
const funcLUT = {
  "front page": frontpage,
  "teachers + schedules": teachersSched,
  "contact info + opportunities": contactOpp,
  "image galleries": imgGalleries,
};
export async function sheet(fetchlink, abortTimeout) {
  const data = await fetch(fetchlink, {
    signal: AbortSignal.timeout(abortTimeout),
  });
  const sheets = (await data.json())?.sheets ?? {};
  return Object.entries(sheets).reduce((obj, [name, sheetData]) => {
    const func = funcLUT[name.trim().toLowerCase()];
    if (func) obj[name] = func(sheetData);
    return obj;
  }, {});
}

const frontpage = (data) => data;
function teachersSched(data) {
  return "bacon";
}
const contactOpp = (data) => data;
function imgGalleries(data) {
  return Object.entries(data).reduce((payload, [category, images]) => {
    payload[category] = images.filter(Boolean);
    return payload;
  }, {});
}