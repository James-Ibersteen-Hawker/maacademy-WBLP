const MAASHEET = "19mxPMyE2bvWBdp2Xy_ty_2eEYxzDD9RTlBHEw7p-0I0";
const NAMES = ["FRONT PAGE", "TEACHERS + SCHEDULES", "CONTACT INFO + OPPORTUNITIES", "IMAGE GALLERIES", "RADIO CITY GALLERY", "SPECIAL CLASSES"];
const DISPLAYPREFIX = "https://lh3.googleusercontent.com/d/";
function doGet(e) {
  function response(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj))
      .setMimeType(ContentService.MimeType.JSON);
  }
  const sheet = SpreadsheetApp.openById(MAASHEET);
  const inSheets = sheet.getSheets();
  const responseOBJ = {
    sheets: {},
  };
  for (let i = 0; i < inSheets.length; i++) {
    const current = inSheets[i];
    let response;
    switch (current.getName()) {
      case NAMES[0]:
        response = FRONTPAGE(current);
        break;
      case NAMES[1]:
        response = TEACHERPAGE(current);
        break;
      case NAMES[2]:
        response = CONTACTPAGE(current);
        break;
      case NAMES[3]:
        response = GALLERY(current);
        break;
      case NAMES[4]:
        response = RADIOCITY(current);
        break;
      case NAMES[5]:
        response = SPECIAL(current);
        break;
    }
    if (!response) continue;
    responseOBJ.sheets[current.getName()] = response;
  }
  return response(responseOBJ);
}
function FRONTPAGE(page) {
  const headerObj = { reviews: [] };
  headerObj.headerImage = DISPLAYPREFIX + page.getRange("A2")
                          .getFormula()
                          .slice(8, -2)
                          .replace("https://drive.google.com/uc?export=view&id=", "");
  headerObj.teacherImage = DISPLAYPREFIX + page.getRange("E2")
                          .getFormula()
                          .slice(8, -2)
                          .replace("https://drive.google.com/uc?export=view&id=", "");
  headerObj.copyright = page.getRange("C3").getValue();
  const lastRow = page.getLastRow();
  const lastCol = page.getLastColumn();
  const reviewRange = page.getRange(4,1, lastRow - 3, lastCol);
  const reviewVals = reviewRange.getValues();
  const reviewFormulas = reviewRange.getFormulas();
  const headers = reviewVals[0];
  const data = reviewVals.slice(1);
  data.forEach((row, r) => {
    const reviewObj = {};
    row.forEach((cell, c) => {
      if (!headers[c]) return;
      const thisFormula = reviewFormulas[r + 1][c];
      if (thisFormula) {
        const id = thisFormula.slice(8, -2).replace("https://drive.google.com/uc?export=view&id=", "");
        reviewObj[headers[c]] = DISPLAYPREFIX + id;
      }
      else reviewObj[headers[c]] = cell;
    })
    headerObj.reviews.push(reviewObj);
  })
  return headerObj;
}
function TEACHERPAGE(page) {
  const range = page.getDataRange();
  const values = range.getValues();
  const formulas = range.getFormulas();
  let holdVal = ""
  const overHeaders = values[0].map(e => {
    if (e !== "") holdVal = e;
    return holdVal;
  });
  const collapse = Array.from(new Set(overHeaders));
  const headers = values[1];
  const data = values.slice(2);
  const returnObj = { teachers: []};
  data.forEach((row, r) => {
    const teacher = collapse.reduce((accumulator, key) => {
      accumulator[key] = {}
      return accumulator;
    }, {});
    row.forEach((cell, c) => {
      const thisFormula = formulas[r + 2][c];
      if (thisFormula) {
        const id = thisFormula.slice(8, -2).replace("https://drive.google.com/uc?export=view&id=", "");
        teacher[overHeaders[c]][headers[c]] =  DISPLAYPREFIX + id;
      } else {
        teacher[overHeaders[c]][headers[c]] = cell;
      }
    })
    returnObj.teachers.push(teacher)
  })
  return returnObj;
}
function CONTACTPAGE(page) {
  const contactRange = page.getRange(2,3, 4, 1);
  const rowHeads = page.getRange(2,1, 4, 1);
  const values = contactRange.getValues().flat();
  const formulas = contactRange.getRichTextValues().flat();
  const rowHeadVals = rowHeads.getValues().flat().map(e => e.slice(0,-1));
  const returnObj = {
    Radio: null,
    contacts: [],
    jobs: [],
  };
  const radioRange = page.getRange("H2").getValue();
  values.forEach((e,i) => {
    if (rowHeadVals[i] === "Map") returnObj[rowHeadVals[i]] = formulas[i].getLinkUrl()
    else returnObj[rowHeadVals[i]] = e;
  });
  returnObj["Radio"] = radioRange;
  const btmRow = page.getLastRow();
  const mediaRange = page.getRange(2,11, btmRow - 1, 3)
  const mValues = mediaRange.getValues();
  const mFormulas = mediaRange.getFormulas();
  const mHeaders = mValues[0];
  const mData = mValues.slice(1);
  mData.forEach((row, r) => {
    const obj = {};
    row.forEach((cell, c) => {
      const thisFormula = mFormulas[r + 1][c];
      if (thisFormula) {
        const id = thisFormula.slice(8, -2).replace("https://drive.google.com/uc?export=view&id=", "");
        obj[mHeaders[c]] = DISPLAYPREFIX + id;
      } else obj[mHeaders[c]] = cell;
    })
    returnObj.contacts.push(obj)
  })
  const jobRange = page.getRange(8, 1, btmRow - 7, 1);
  const jValues = jobRange.getValues().flat();
  returnObj.jobs = jValues;
  return returnObj;
}
function GALLERY(page) {
  const range = page.getDataRange();
  const values = range.getValues();
  const formulas = range.getFormulas();
  const headers = values[0];
  const data = values.slice(1);
  const returnOBJ = headers.reduce((accu, key) => {
    accu[key] = [];
    return accu;
  }, {});
  data.forEach((row, r) => {
    row.forEach((cell, c) => {
      const thisFormula = formulas[r + 1][c];
      if (thisFormula) {
        const id = thisFormula.slice(8, -2).replace("https://drive.google.com/uc?export=view&id=", "");
        returnOBJ[headers[c]].push(DISPLAYPREFIX + id);
      }
      else returnOBJ[headers[c]].push(cell);
    })
  })
  return returnOBJ;
}
function RADIOCITY(page) {
  const range = page.getDataRange();
  const values = range.getValues();
  const formulas = range.getFormulas();
  const headers = values[0];
  const vals = values.slice(1);
  const payload = {
    images: [],
  }
  vals.forEach((row, r) => {
    const obj = {};
    row.forEach((cell, c) => {
      const thisFormula = formulas[r + 1][c];
      if (thisFormula) {
        const id = thisFormula.slice(8, -2).replace("https://drive.google.com/uc?export=view&id=", "");
        obj[headers[c]] = DISPLAYPREFIX + id;
      } else obj[headers[c]] = cell;
    })
    payload.images.push(obj);
  })
  return payload;
}
function SPECIAL(page) {
  const range = page.getDataRange();
  const values = range.getValues();
  const headers = values[0];
  const data = values.slice(1);
  const payload = [];
  data.forEach((row, r) => {
    const obj = {};
    row.forEach((cell, c) => obj[headers[c]] = cell);
    payload.push(obj);
  })
  return payload;
}
function testMyPostRequest() {
  var e = {
    parameter: {
      name: "Test User",
      email: "526rserbinenko@frhsd.com",
      message: "This is a dummy message to see if the Workspace email fires!",
      subject: "Contact Email",
      phone: "XXXXXXXXXX"
    },
  };
  var response = doPost(e);
  console.log("Response from Script: " + response.getContent());
}
function doPost(e) {
  try {
    const ownerEmail = "remy.serbinenko@gmail.com"
    const data = e.parameter;
    EMAIL(data, ownerEmail);
    const html = HtmlService.createTemplateFromFile("index");
    html.location = data.location;
    return html.evaluate().setTitle("Redirect")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
  } catch (err) {
    Logger.log(["POSTERROR", err]);
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": err.toString(),
      "payload": e.parameter
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
function EMAIL(e, destination) {
  GmailApp.sendEmail(destination, e.subject, `${e.message}\n-------\nEmail: ${e.email}\nPhone: ${e.phone}\n\nFrom,\n${e.name}`);
}