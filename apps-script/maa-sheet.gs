"use strict";
const IMGVIEWPREFIX = "https://drive.google.com/uc?export=view&id=";
const sheetID = "19mxPMyE2bvWBdp2Xy_ty_2eEYxzDD9RTlBHEw7p-0I0";
const TEACHERSCHED = "TEACHERS + SCHEDULES";
const INFOPAGE = "CONTACT INFO";
const IMGRESPONSE = "Form Responses 1";
const maaFolderID = "13lmE59FF2z3XUvTXmMBGeClm-93lXGik";
// const maaFolderID = '1IlUqck8Imh2yBNQP2dsLC_URAoCcryRR'
const CACHE_KEY = 'FILES_LUT';
const HEADER_KEY = 'HEADERS';
const FOLDER_KEY = 'MAAFOLDER'
const DISPLAYPREFIX = "https://lh3.googleusercontent.com/d/";
let filesLUT;
let headers;


function placeImage() {
  const activeSheet = SpreadsheetApp.getActiveSpreadsheet();
  activeSheet.toast("Inserting Image...", "", 2)
  Utilities.sleep(1000);
  const responseSheet = SpreadsheetApp.openById(sheetID);
  const sheet = responseSheet.getSheetByName(IMGRESPONSE);
  const response = sheet.getRange(sheet.getLastRow(), 2).getValue();
  if (!response) return;
  const imgFormula = `=IMAGE("${IMGVIEWPREFIX}${response}")`;
  const selectedRange = activeSheet.getActiveRange();
  if (!selectedRange) return;
  const height = selectedRange.getNumRows();
  const width = selectedRange.getNumColumns();
  const outputArr = Array.from({length: height}, () => new Array(width).fill(imgFormula));
  Logger.log(outputArr)
  selectedRange.setValues(outputArr);
}
function refreshSidebar() {
  const cache = CacheService.getScriptCache();
  cache.remove(CACHE_KEY);
  SIDEBAR();
}
function checkFiles() {
  const thisSheet = SpreadsheetApp.openById(sheetID);
  thisSheet.toast("Checking Files...", "", 2)
  const cache = CacheService.getScriptCache();
  const cachedFiles = cache.get(CACHE_KEY);
  const files = !cachedFiles ? preloadFiles(false) : JSON.parse(cachedFiles);
  const result = Object.entries(files).map(([name, id]) => {
    return { name, id, image: `${DISPLAYPREFIX}${id}` };
  });
  return result;
}
function OPENHANDLER() {
  CUSTOMMENU();
  preloadFiles();
  getFolder();
  preloadHeaders();
}
function CUSTOMMENU() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Images")
    .addItem("Open Menu", "SIDEBAR")
    .addItem("Refresh Menu", "refreshSidebar")
    .addSeparator()
    .addItem("Place Selected Image", "placeImage")
    .addToUi();
}
function SIDEBAR() {
  const sheet = SpreadsheetApp.openById(sheetID);
  sheet.toast("Loading Data...");
  const files = checkFiles();
  const cache = CacheService.getScriptCache();
  const cacheFolder = cache.get(FOLDER_KEY);
  const folder = !cacheFolder ? getFolder() : cacheFolder;
  const template = HtmlService.createTemplateFromFile('sidebar');
  template.preLoadedFiles = JSON.stringify(files);
  console.log(files)
  template.folderTitle = JSON.stringify(folder);
  const html = template.evaluate().setTitle("Insert Images From Folder").setWidth(400)
  SpreadsheetApp.getUi().showSidebar(html)
}
function preloadFiles() {
  const response = Drive.Files.list({
    q: `'${maaFolderID}' in parents and trashed = false`,
    fields: "files(id, name, shared, permissions(type))"
  });
  filesLUT = response.files.reduce((map, { id, name, shared, permissions }) => {
    const viewable = permissions && permissions.some(e => e.type && e.type === "anyone")
    if (shared && viewable) map[name] = id;
    return map;
  }, {});
  const cache = CacheService.getScriptCache();
  cache.put(CACHE_KEY, JSON.stringify(filesLUT), 3600);
  const thisSheet = SpreadsheetApp.openById(sheetID);
  thisSheet.toast("Retrieved necessary files", "Drive Scrubbing", 5)
  return filesLUT;
}
function getFolder() {
  const folder = DriveApp.getFolderById(maaFolderID);
  const foldername = folder.getName();
  const cache = CacheService.getScriptCache();
  cache.put(FOLDER_KEY, foldername);
  return foldername;
}
function preloadHeaders() {
  const thisSheet = SpreadsheetApp.openById(sheetID);
  const ss = thisSheet.getSheetByName(TEACHERSCHED);
  const headers = ss.getRange(2, 1, 1, ss.getLastColumn());
  const hVals = headers.getValues()[0];
  const cache = CacheService.getScriptCache();
  cache.put(HEADER_KEY, JSON.stringify(hVals), 3600);
  return hVals;
}
function handleEdit(e) {
  const range = e?.range;
  const ss = range?.getSheet();
  if (!ss) return;
  const startCol = range.getColumn();
  const startRow = range.getRow();
  const values = range.getValues();
  const output = values.map(row => [...row]);
  const cache = CacheService.getScriptCache();
  const cachedFiles = cache.get(CACHE_KEY);
  filesLUT = !cachedFiles ? preloadFiles(false) : JSON.parse(cachedFiles)
  const cachedHeaders = cache.get(HEADER_KEY);
  const hVals = !cachedHeaders ? preloadHeaders() : JSON.parse(cachedHeaders);
  switch (ss.getName()) {
    case TEACHERSCHED:
      TEACHERS(output, values, hVals, startCol, startRow);
      break;
    case INFOPAGE:
      infoPage(output, values, hVals, startCol, startRow);
      break;
    default: return;
  }
  if (JSON.stringify(values) !== JSON.stringify(output)) range.setValues(output);
}
function TEACHERS(output, values, hVals, startCol, startRow) {
  const photoCol = hVals.indexOf("Photo") + 1;
  values.forEach((row, r) => {
    row.forEach((cell, c) => {
      const coords = { r: r + startRow, c: c + startCol }
      if (coords.c === photoCol) {

        const returnedImage = getImage(cell);
        output[r][c] = returnedImage;
      }
    })
  })
}
function infoPage(output, values, hVals, startCol, startRow) {
  // const 
}
function getImage(name) {
  if (typeof name === "object" || !name || name.startsWith("=")) return name;
  const input = name.trim();
  if (filesLUT[input]) return `=IMAGE("${IMGVIEWPREFIX}${filesLUT[input]}")`
  return name;
}
///testing functions
function demoOnEdit() {
  const spreadsheet = SpreadsheetApp.openById(sheetID);
  const sheet = spreadsheet.getSheetByName(TEACHERSCHED);
  const range = sheet.getRange(3, 3);
  const e = {
    range: range,
    value: range.getValue(),
    oldValue: "",
  };
  onEdit(e, sheet);
}