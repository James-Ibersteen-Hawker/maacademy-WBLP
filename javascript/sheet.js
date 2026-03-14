"use strict";
export async function sheet(fetchlink, abortTimeout) {
    const data = await fetch(fetchlink, { signal: AbortSignal.timeout(abortTimeout) });
    const json = await data.json()
    return json;
}