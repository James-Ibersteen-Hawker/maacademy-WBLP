"use strict";
export async function sheet(fetchlink, abortTimeout) {
    const data = await fetch(fetchlink, { signal: AbortSignal.timeout(abortTimeout) });
    const json = await data.json();
    const sheets = json.sheets;
    const entries = Object.entries(sheets);
    const payload = {
        
    }
    entries.forEach(([name, data]) => {
        switch (name.toLowerCase()) {
            case "front page":
                payload[name] = frontpage(data)
                break;
            case "teachers + schedules":
                payload[name] = teachersSched(data)
                break;
            case "contact info + opportunities":
                payload[name] = contactOpp(data)
                break;
            case "image galleries":
                payload[name] = imgGalleries(data)
                break;
            default:
                break;
        }
    })
    return json;
}
function frontpage(data) {}
function teachersSched(data) {}
function contactOpp(data) {}
function imgGalleries(data) {}
