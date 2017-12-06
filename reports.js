const fs = require("fs-extra");
const _ = require("lodash");
const files = require("./src/fs");

const IMG_ROOT = "https://image.tmdb.org/t/p/w500";
const SAVE_ROOT = "./reports";

const printAll = async ({ rows, name, top }) => {
  // console.log("#printAll rows", rows);
  await printMd({ rows, name, top });
  // await printMd({ rows, name });
  await printHtml({ rows, name, top });
  // await printHtml({ rows, name });
};
const printMd = async ({ rows, name, top }) => {
  // console.log("#printMd rows", rows);
  const columns = Object.keys(rows[0]);
  const separator = columns.map(() => "---");
  const fmtHeader = `${columns.join("|")}
  ${separator.join("|")}`;
  const fmtRows = rows.slice(0, top - 1).map(r => {
    const keys = Object.keys(r);
    let fmtRow = "";
    keys.forEach(key => {
      fmtRow = `${fmtRow}|${r[key]}`;
    });
    return fmtRow;
  });
  const fmtTable = fmtHeader + fmtRows.join("\n");
  const savePath = `${SAVE_ROOT}/${name}.md`;
  await fs.writeFile(savePath, fmtTable, "utf8");
};
const printHtml = async ({ rows, name, top }) => {};

const getMoviesByNames = async ({ movieNames }) => {
  const tmdbSearch = await files.getContent({
    newPath: "./dump/tmdb_search.json"
  });
  return movieNames.map(name => {
    const search = tmdbSearch[name] || {};
    return { search };
  });
};

const getMoviesToRows = ({ movies }) => {
  // console.log("#getMoviesToRows movies", movies);
  const mdRows = movies.map((movie, index) => {
    const { poster_path, original_title, vote_average } = movie.search;
    const poster = `![img](${IMG_ROOT}${poster_path})`;
    const title = original_title;
    const rating = vote_average;
    const row = {
      num: index + 1,
      poster,
      title,
      rating
    };
    return row;
  });
  // console.log("#getMoviesToRows mdRows", mdRows.length);
  return mdRows;
};

const printMostVoted = async () => {
  const topMovies = await files.getContent({
    newPath: "./dump/orderedMovies.json"
  });
  // console.log("topMovies", topMovies.length);
  const movieNames = topMovies.map(m => m.name);
  const movies = await getMoviesByNames({ movieNames });
  const rows = getMoviesToRows({ movies });
  // console.log("#printMostVoted rows", rows);
  await printAll({
    rows,
    name: "most_voted",
    top: 15
  });
};

(async () => {
  await printMostVoted();
})();
