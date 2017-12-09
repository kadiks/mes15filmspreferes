const _ = require("lodash");
const fs = require("./src/fs");
const printer = require("./src/printer/");
const sorter = require("./src/sorter");

const DEFAULT_TOP = 15;
const MAX_TOP = 100;

const printAll = async ({ rows, name, top }) => {
  // console.log("#printAll rows", rows);
  // await printer.markdown({ rows, name, top: 3 });
  // await printer.markdown({ rows, name, top });
  // await printer.markdown({ rows, name, top: MAX_TOP });
  await printer.text({ rows, name, top });
  await printer.html({ rows, name, top: 3 });
  await printer.html({ rows, name, top });
  await printer.html({ rows, name, top: MAX_TOP });
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
  const data = await fs.getContent({
    newPath: "./dump/data.json"
  });
  return orderedMovies.map(movie => {
    const name = movie.name;
    const search = tmdbSearch[name] || {};
    const details = tmdbMovies[name] || {};
    const credits = tmdbCredits[name] || {};
    const twitter = movie || {};
    return { search, details, credits, twitter, data };
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

const printGenreRepresentation = async () => {
  await printMaster({
    name: "genre_representation",
    sorterFn: sorter.moviesByGenre,
    rowFn: getDataToRows
  });
};

const printDecadeRepresentation = async () => {
  await printMaster({
    name: "decade_representation",
    sorterFn: sorter.moviesByDecade,
    rowFn: getDataToRows
  });
};

const printMostVotedFrenchMovies = async () => {
  await printMaster({
    name: "most_voted_french_movies",
    sorterFn: sorter.movieInFrance,
    rowFn: getMoviesToRows
  });
};

const printMostFancyUsers = async () => {
  await printMaster({
    name: "most_fancy_users",
    sorterFn: sorter.votersByAverageMovieDesc,
    rowFn: getDataToRows
  });
};

const printMostTrollingUsers = async () => {
  await printMaster({
    name: "most_trolling_users",
    sorterFn: sorter.votersByAverageMovieAsc,
    rowFn: getDataToRows
  });
};

const printMostVotedByGenre = async ({ genre }) => {
  await printMaster({
    name: `most_voted_by_genre_${genre}`,
    sorterFn: sorter.movieByGenre[genre],
    rowFn: getMoviesToRows
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
  await printGenreRepresentation();
  await printDecadeRepresentation();
  await printMostVotedDirector();
  await printMostVotedFrenchMovies();
  await printMostFancyUsers();
  await printMostTrollingUsers();
  const genres = [
    "action",
    "adventure",
    "animation",
    "comedy",
    "crime",
    "documentary",
    "drama",
    "family",
    "fantasy",
    "history",
    "horror",
    "music",
    "mystery",
    "romance",
    "science fiction",
    "tv movie",
    "thriller",
    "war",
    "western"
  ];
  await Promise.all(genres.map(genre => printMostVotedByGenre({ genre })));
})();
