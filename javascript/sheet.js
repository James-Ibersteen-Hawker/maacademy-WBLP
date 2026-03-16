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
    const func = funcLUT[name.trim().toLowerCase()]
    if (func) obj[name] = func(sheetData);
    return obj;
  }, {});
}


function frontpage(data) {
  return "lollipop";
}
function teachersSched(data) {
  return "bacon";
}
function contactOpp(data) {
  return "sandwich";
}
function imgGalleries(data) {
  return "skerdoodlydumptious";
}
