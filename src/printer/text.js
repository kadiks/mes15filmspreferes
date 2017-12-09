const fs = require("../fs");
const SAVE_ROOT = "./reports";

const printText = async ({ rows, name, top }) => {
  // console.log("#printHtml rows", rows);
  const columns = Object.keys(rows[0]);
  const fmtRows = rows.slice(0, top).map(r => {
    const keys = Object.keys(r);
    let fmtRow = {
      num: r.num,
      name: null,
      value: null
    };
    // console.log("keys", keys);
    keys.forEach(key => {
      let currentValue = r[key];
      if (["user", "country", "genre", "title"].includes(key) === true) {
        fmtRow.name = currentValue;
        if (key === "user") {
          fmtRow.name = `@${currentValue}`;
        }
      }
      if (["average", "count"].includes(key) === true) {
        fmtRow.value = currentValue;
      }
    });
    return `${fmtRow.num}. ${fmtRow.name} [${fmtRow.value}]`;
  });
  const fmtTable = fmtRows.join("\n");
  const savePath = `${SAVE_ROOT}/${name}_${top}.txt`;
  await fs.save({
    path: savePath,
    content: fmtTable
  });
};

module.exports = printText;
