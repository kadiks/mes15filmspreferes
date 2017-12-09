require("dotenv").config();
const fetch = require("isomorphic-fetch");
const qs = require("qs");
const _ = require("lodash");
const API_KEY = process.env.TMDB_API_KEY;

const fs = require("./src/fs");
const TMDB_SEARCH_PATH = "./dump/tmdb_search.json";
const TMDB_MOVIES_PATH = "./dump/tmdb_movies.json";
const TMDB_CREDITS_PATH = "./dump/tmdb_credits.json";
const TOP_MOVIES_PATH = "./dump/orderedMovies.json";

const rootUrl = "http://api.themoviedb.org/3";

const searchMovie = async searchTerm => {
  const url = `/search/movie/`;
  const json = await load({
    url,
    query: {
      query: searchTerm
    }
  });
  const movies = json.results;
  const movie = movies[0];
  return movie;
};

const getMovieById = async id => {
  const url = `/movie/${id}`;
  const movie = await load({
    url
  });
  return movie;
};

const getMovieCreditsById = async id => {
  const url = `/movie/${id}/credits`;
  const credits = await load({
    url
  });
  return credits;
};

const load = async ({ url, query = {} } = {}) => {
  query.api_key = API_KEY;
  const fullUrl = `${rootUrl}${url}?${qs.stringify(query)}`;
  // console.log("#load fullUrl", fullUrl);
  const res = await fetch(fullUrl);
  const json = await res.json();
  return json;
};

const getUnfetchedMovie = ({ list, fetched }) => {
  const fetchedKeys = Object.keys(fetched);
  let unfetchedMovie = null;
  list.forEach(movie => {
    if (fetchedKeys.indexOf(movie.name) === -1) {
      if (unfetchedMovie === null) {
        unfetchedMovie = movie.name;
      }
    }
  });
  return unfetchedMovie;
};

const getMoviesToSearch = async () => {
  const topMovies = await fs.getContent({ newPath: TOP_MOVIES_PATH });
  const names = topMovies.map(m => m.name);
  return names;
};

const getMoviesSearched = async () => {
  const tmdbSearch = await fs.getContent({ newPath: TMDB_SEARCH_PATH });
  return Object.keys(tmdbSearch);
};

const getMovieCount = async movieName => {
  const topMovies = await fs.getContent({ newPath: TOP_MOVIES_PATH });
  let selectedMovie = null;
  topMovies.forEach(movie => {
    if (movie.name === movieName) {
      selectedMovie = movie;
    }
  });

  return selectedMovie.count;
};

const getNextMovieDetails = async movieSearchTerm => {
  try {
    const tmdbSearch = await fs.getContent({ newPath: TMDB_SEARCH_PATH });
    const tmdbMovies = await fs.getContent({ newPath: TMDB_MOVIES_PATH });
    const tmdbCredits = await fs.getContent({ newPath: TMDB_CREDITS_PATH });

    const movieCount = await getMovieCount(movieSearchTerm);
    // if (movieCount === 1) {
    //   throw `Movie [${movieSearchTerm}] has too low count to be searchable`;
    // }
    console.log(`START ${movieSearchTerm} (${movieCount} votes)...`);
    const movie = (await searchMovie(movieSearchTerm)) || {};
    if (movie.hasOwnProperty("id") === false) {
      console.log(`Movie ID for [${movieSearchTerm}] has not been found`);
      return;
    }
    const movieId = movie.id;
    const movieDetails = await getMovieById(movieId);
    const credits = await getMovieCreditsById(movieId);

    tmdbSearch[movieSearchTerm] = movie;
    tmdbMovies[movieSearchTerm] = movieDetails;
    tmdbCredits[movieSearchTerm] = credits;

    await fs.saveContent(tmdbSearch, { newPath: TMDB_SEARCH_PATH });
    await fs.saveContent(tmdbMovies, { newPath: TMDB_MOVIES_PATH });
    await fs.saveContent(tmdbCredits, { newPath: TMDB_CREDITS_PATH });
    console.log(`END ${movieSearchTerm}...`);
  } catch (e) {
    throw e;
  }
};

// https://stackoverflow.com/a/43082995/185771

const sleep = ms => {
  return new Promise(res => {
    setTimeout(res, ms);
  });
};

const delayedSearch = async search => {
  console.log("Waiting...");
  await sleep(3000);
  await getNextMovieDetails(search);
};

(async () => {
  const movies = await getMoviesToSearch();
  const moviesSearched = await getMoviesSearched();
  // await getNextMovieDetails("pulp fiction");
  const moviesToSearch = _.difference(movies, moviesSearched);
  moviesToSearch.reduce(
    (p, x) => p.then(_ => delayedSearch(x)),
    Promise.resolve()
  );
  // console.log(moviesToSearch);
  // console.log(moviesToSearch.length);
  // console.log(movies.length);
})();
