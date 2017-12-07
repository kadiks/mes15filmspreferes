const fs = require("../fs");
const SAVE_ROOT = "./reports";
const IMG_ROOT = "https://image.tmdb.org/t/p/w500";

const printMd = async ({ rows, name, top }) => {
  // console.log("#printMd rows", rows);
  const columns = Object.keys(rows[0]);
  const separator = columns.map(() => "---");
  const fmtHeader = `${columns.join("|")}
  ${separator.join("|")}`;
  const fmtRows = rows.slice(0, top).map(r => {
    const keys = Object.keys(r);
    let fmtRow = "";
    keys.forEach(key => {
      let currentValue = r[key];
      if (key === "poster") {
        currentValue = `![img](${IMG_ROOT}${currentValue})`;
      }
      fmtRow = `${fmtRow}|${currentValue}`;
    });
    return fmtRow;
  });
  const fmtTable = `${fmtHeader}
  ${fmtRows.join("\n")}`;
  const savePath = `${SAVE_ROOT}/${name}_${top}.md`;
  await fs.save({
    path: savePath,
    content: fmtTable
  });
};

module.exports = printMd;
