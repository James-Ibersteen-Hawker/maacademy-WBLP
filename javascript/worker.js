import { sheet } from "/javascript/sheet.js";
self.onmessage = async (e) => {
  const { mode } = e.data;
  const message = { data: null, err: null };
  try {
    switch (mode) {
      case "load":
        if (!sheet) throw new Error("Sheet Function is Invalid");
        message.data = await sheet();
        break;
      default:
        throw new Error(`Invalid Mode: ${mode}`);
    }
  } catch (error) {
    message.err = { message: error.message, stack: error.stack };
  } finally {
    self.postMessage(message);
  }
};