const fs = require("./src/fs");

const TMDB_SEARCH_PATH = "./dump/tmdb_search.json";
const TMDB_MOVIES_PATH = "./dump/tmdb_movies.json";
const TMDB_CREDITS_PATH = "./dump/tmdb_credits.json";

(async () => {
  let oldTmdbSearch = await fs.getContent({
    newPath: "./dump/tmdb_search.json"
  });
  let oldTmdbDetails = await fs.getContent({
    newPath: "./dump/tmdb_movies.json"
  });
  let oldTmdbCredits = await fs.getContent({
    newPath: "./dump/tmdb_credits.json"
  });

  const tmdbSearch = {};
  const tmdbDetails = {};
  const tmdbCredits = {};

  const searchKeys = Object.keys(oldTmdbSearch);
  searchKeys.forEach(key => {
    const movie = oldTmdbSearch[key];
    if (Object.keys(movie).length > 0) {
      tmdbSearch[key] = movie;
    }
  });

  const detailsKeys = Object.keys(oldTmdbDetails);
  detailsKeys.forEach(key => {
    const movie = oldTmdbDetails[key];
    if (movie.hasOwnProperty("status_code") === false) {
      tmdbDetails[key] = movie;
    }
  });

  const creditsKeys = Object.keys(oldTmdbCredits);
  creditsKeys.forEach(key => {
    const movie = oldTmdbCredits[key];
    if (movie.hasOwnProperty("status_code") === false) {
      tmdbCredits[key] = movie;
    }
  });

  await fs.saveContent(tmdbSearch, { newPath: TMDB_SEARCH_PATH });
  await fs.saveContent(tmdbDetails, { newPath: TMDB_MOVIES_PATH });
  await fs.saveContent(tmdbCredits, { newPath: TMDB_CREDITS_PATH });
})();
