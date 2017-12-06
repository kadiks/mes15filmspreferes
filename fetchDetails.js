require("dotenv").config();
const fetch = require("isomorphic-fetch");
const API_KEY = process.env.TMDB_API_KEY;

const fs = require("./src/fs");
const TMDB_PATH = "./dump/tmdb.json";
const TOP_MOVIES_PATH = "./dump/orderedMovies.json";

const getMovie = async search => {
  const url = `http://api.themoviedb.org/3/search/movie?query=${
    search
  }&api_key=${API_KEY}`;
  console.log("url", url);
  const res = await fetch(url);
  const json = await res.json();
  const movie = json.results[0] || [];
  return movie;
};

(async () => {
  const topMovies = await fs.getContent({ newPath: TOP_MOVIES_PATH });
  const tmdb = await fs.getContent({ newPath: TMDB_PATH });
  const tmdbKeys = Object.keys(tmdb);
  let movieSearchTerm = null;
  topMovies.forEach(movie => {
    if (tmdbKeys.indexOf(movie.name) === -1) {
      if (movieSearchTerm === null) {
        movieSearchTerm = movie.name;
      }
    }
  });
  // console.log("topMovies", movieSearchTerm);
  const movie = await getMovie(movieSearchTerm);
  tmdb[movieSearchTerm] = movie;
  await fs.saveContent(tmdb, { newPath: TMDB_PATH });
})();
