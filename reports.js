const _ = require("lodash");
const fs = require("./src/fs");
const printMd = require("./src/printer/markdown");
const printHtml = require("./src/printer/html");
const sorter = require("./src/sorter");

const DEFAULT_TOP = 15;
const MAX_TOP = 100;

const printAll = async ({ rows, name, top }) => {
  // console.log("#printAll rows", rows);
  await printMd({ rows, name, top: 3 });
  await printMd({ rows, name, top });
  await printMd({ rows, name, top: MAX_TOP });
  await printHtml({ rows, name, top: 3 });
  await printHtml({ rows, name, top });
  await printHtml({ rows, name, top: MAX_TOP });
};

const getMoviesByNames = async ({ movieNames }) => {
  const tmdbSearch = await fs.getContent({
    newPath: "./dump/tmdb_search.json"
  });
  const tmdbMovies = await fs.getContent({
    newPath: "./dump/tmdb_movies.json"
  });
  const tmdbCredits = await fs.getContent({
    newPath: "./dump/tmdb_credits.json"
  });
  const orderedMovies = await fs.getContent({
    newPath: "./dump/orderedMovies.json"
  });
  return orderedMovies.map(movie => {
    const name = movie.name;
    const search = tmdbSearch[name] || {};
    const details = tmdbMovies[name] || {};
    const credits = tmdbCredits[name] || {};
    const twitter = movie || {};
    return { search, details, credits, twitter };
  });
};

const getDataToRows = ({ movies }) => {
  const mdRows = movies.map((datum, index) => {
    return {
      num: index + 1,
      ...datum
    };
  });
  return mdRows;
};

const getDirectorFromCrew = ({ crew = [] }) => {
  let director = {};
  crew.forEach(person => {
    if (person.job === "Director") {
      director = person;
    }
  });
  return director;
};

// const getDirectorsToRows = ({ movies }) => {
//   const mdRows = movies.map((movie, index) => {
//     const { credits, twitter, search, details } = movies;
//     const { count } = twitter;
//     const { crew, cast } = credits;
//     const { name = "", poster_path } = getDirectorFromCrew({ crew });

//     const poster = `${IMG_ROOT}${poster_path}`;

//     const row = {
//       num: index + 1,
//       name,
//       title,
//       count: `${count} votes`
//     };
//     return row;
//   });
//   // console.log("#getMoviesToRows mdRows", mdRows.length);
//   return mdRows;
// };

const getMoviesToRows = ({ movies }) => {
  // console.log("#getMoviesToRows movies", movies);
  // console.log(">> #getMoviesToRows");
  const mdRows = movies.map((movie, index) => {
    const { credits, twitter, search, details } = movie;
    const { count } = twitter;
    const { crew, cast } = credits;
    const {
      poster_path,
      original_title,
      vote_average,
      release_date = "x-x-x"
    } = search;
    const rating = `${vote_average}/10`;
    const directorDetails = getDirectorFromCrew({ crew });
    const director = directorDetails.name || "";
    const poster = `${poster_path}`;
    const date = release_date.split("-")[0];
    const title = `${original_title} (${date})

${director}

${rating}`;

    const row = {
      num: index + 1,
      poster,
      title,
      count: `${count} votes`
    };
    return row;
  });
  // console.log("#getMoviesToRows mdRows", mdRows.length);
  return mdRows;
};

const printMostVoted = async () => {
  await printMaster({
    name: "most_voted",
    sorterFn: sorter.movieByVote,
    rowFn: getMoviesToRows
  });
};

const printBestRating = async () => {
  await printMaster({
    name: "best_rating",
    sorterFn: sorter.movieByRating,
    rowFn: getMoviesToRows
  });
};

const printCountriesRepresentation = async () => {
  await printMaster({
    name: "countries_representation",
    sorterFn: sorter.moviesByCountry,
    rowFn: getDataToRows
  });
};

const printMostVotedDirector = async () => {
  await printMaster({
    name: "most_voted_director",
    sorterFn: sorter.directorsByVotes,
    rowFn: getDataToRows
  });
};

const printMaster = async ({ name, sorterFn, rowFn }) => {
  const topMovies = await fs.getContent({
    newPath: "./dump/orderedMovies.json"
  });
  // console.log("topMovies", topMovies.length);
  // console.log("#1");
  const movieNames = topMovies.map(m => m.name);
  // console.log("#2");
  const rawMovies = await getMoviesByNames({ movieNames });
  // console.log("#3");
  const movies = await sorterFn(rawMovies);
  // console.log("#4");
  const rows = rowFn({ movies });
  // console.log("#5");
  // console.log("#printMostVoted rows", rows);
  await printAll({
    rows,
    name,
    top: DEFAULT_TOP
  });
  // console.log("#6");
};

(async () => {
  await printMostVoted();
  await printBestRating();
  await printCountriesRepresentation();
  await printMostVotedDirector();
})();
