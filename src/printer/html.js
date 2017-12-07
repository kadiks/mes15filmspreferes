const fs = require("../fs");
const SAVE_ROOT = "./reports";
const IMG_ROOT = "https://image.tmdb.org/t/p/w500";

const printHtml = async ({ rows, name, top }) => {
  // console.log("#printHtml rows", rows);
  const columns = Object.keys(rows[0]);
  const separator = columns.map(() => "---");
  const fmtHeader = `<thead><tr><td>${columns.join(
    "</td><td>"
  )}</td></tr></thead>`;
  const fmtRows = rows.slice(0, top).map(r => {
    const keys = Object.keys(r);
    let fmtRow = null;
    keys.forEach(key => {
      let currentValue = r[key];
      if (key === "poster") {
        currentValue = `<img src="${IMG_ROOT}${currentValue}" alt="${
          r.title
        }" style="max-width: 100px;" />`;
      }
      if (key === "title") {
        const titleRegex = /\n\n/g;
        // console.log("titleregex", currentValue.match(titleRegex));
        currentValue = currentValue.replace(titleRegex, "<br/>");
      }
      if (fmtRow === null) {
        // console.log("printer/html currentValue", currentValue);
        fmtRow = `${currentValue}`;
      } else {
        fmtRow = `${fmtRow}</td><td>${currentValue}`;
      }
    });
    return `<tr><td>${fmtRow}</td></tr>`;
  });
  const fmtTable = `<table>${fmtHeader}<tbody>${fmtRows.join(
    ""
  )}</tbody></table>`;
  const savePath = `${SAVE_ROOT}/${name}_${top}.html`;
  await fs.save({
    path: savePath,
    content: fmtTable
  });
};

module.exports = printHtml;
