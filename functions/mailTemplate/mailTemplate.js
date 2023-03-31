const fs = require("fs");
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const { Firestore, FieldValue } = require("@google-cloud/firestore");
const firestore = new Firestore();
exports.getTemplate = async (data, type) => {
  /**********read html template to change %variable%*******/
  let template = fs.readFileSync(
    path.resolve(__dirname, `./${type}.html`), //type of template
    "utf-8"
  );
  /*****************change %var% with their values*********/

  for (const [key, value] of Object.entries(data)) {
    template = template.replaceAll(`%${key}%`, value);
  }

  return template;
};
