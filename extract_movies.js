require("dotenv").config();
const fs = require("./src/fs");
const fsE = require("fs-extra");
const slug = require("diacritics").remove;
const _ = require("lodash");

const processedTweetIds = [];
const movies = [];
const blackListMovies = ["mes15filmspreferes", "kaamelott"];
const reassignedMovies = {
  lalaland: "la la land",
  "001": "2001 l'odyssee de l'espace",
  "2001": "2001 l'odyssee de l'espace",
  "001 l'odyssee de l'espace": "2001 l'odyssee de l'espace",
  t2: "terminator 2",
  jaws: "les dents de la mer",
  gattaca: "bienvenue a gattaca",
  "trueman show": "truman show",
  "eme sens": "sixieme sens",
  arrival: "premier contact",
  "madmax fury road": "mad max fury road",
  "un nid de coucou": "vol au dessus d'un nid de coucou",
  "vol audessus d'un nid de coucou": "vol au dessus d'un nid de coucou",
  "vice-versa": "vice versa",
  viceversa: "vice versa",
  "et. l'extraterrestre": "e.t.",
  "et.": "e.t.",
  et: "e.t.",
  "dead poets society": "cercle des poetes disparus",
  "00 days of summer": "500 days of summer",
  "fury road": "mad max fury road",
  "2 hommes en colere": "12 hommes en colere"
};

// const regex = new RegExp(
//   "[1|2|3|4|5|6|7|8|9|10|11|12|13|14|15]?[-]?([\w'\. ])+\\n",
//   "gi"
// );
// const regex = new RegExp(
//   "[1|2|3|4|5|6|7|8|9|10|11|12|13|14|15]?[-]?([\\w'\\. -])+[\\(\\w \\)]*\\\n",
//   "gi"
// );
const regex = /[1|2|3|4|5|6|7|8|9|10|11|12|13|14|15]?[-|\.|*]?([\w'\. -])+[\(\w \)]*\n/gi;
// const regex = new RegExp("([\\w'\\. ])+", "gi");

const makeTop = (movies, max = 5) => {
  const top = [];
  movies.forEach((movie, index) => {
    // console.log("maxIndex", max, index);
    if (index < max) {
      top.push(movie);
    }
  });
  return top;
};

const orderMovies = movies => {
  return _.orderBy(movies, ["count"], ["desc"]);
};

const addMovie = (movie, screen_name) => {
  if (
    movie.toLowerCase().includes("Mes15filmspreferes".toLowerCase()) === true
  ) {
    return;
  }
  if (blackListMovies.indexOf(movie) >= 0) {
    return;
  }
  if (movie.length === 0) {
    return;
  }
  if (reassignedMovies.hasOwnProperty(movie)) {
    movie = reassignedMovies[movie];
  }
  const moviesKey = movies.map(m => m.name);
  const movieIndex = moviesKey.indexOf(movie);
  if (movieIndex >= 0) {
    const el = movies[movieIndex];
    el.count = el.count + 1;
    el.users.push(screen_name);
  } else {
    movies.push({ name: movie, count: 1, users: [screen_name] });
  }
};

(async () => {
  const rawTweets = await fs.getContent({ raw: true });

  rawTweets.forEach(rawTweet => {
    if (rawTweet.hasOwnProperty("full_text") === false) {
      return;
    }
    if (rawTweet.hasOwnProperty("retweet_status") === true) {
      return;
    }
    const tweetId = rawTweet.id;
    if (processedTweetIds.indexOf(tweetId) >= 0) {
      return;
    }
    processedTweetIds.push(tweetId);
    // console.log(rawTweet.full_text);
    const text = slug(rawTweet.full_text);
    const screen_name = rawTweet.user.screen_name;
    // console.log(text);
    const matches = text.match(regex);
    // const match = regex.exec(text);
    if (matches !== null) {
      // console.log(matches);
      const movies = matches.map(match => {
        let movie = match.replace("\n", ""); // break line removal
        movie = movie.replace(/^[1|2|3|4|5|6|7|8|9|10|11|12|13|14|15][ ]?/, ""); // figure removal
        // movie = movie.replace(/^([1-9]|[1][0-9])[ ]?/, ""); // figure removal
        movie = movie.replace(/[-][ ]?/, ""); // dash removal
        movie = movie.replace(/[\.][ ]?/, ""); // dot removal
        movie = movie.replace(/[\*][ ]?/, ""); // star removal
        movie = movie.replace(/[_][ ]?/, ""); // underscore removal
        movie = movie.replace(/\([\w ]+\)/, ""); // parenthsis removal
        movie = movie.trim();
        movie = movie.toLowerCase();
        movie = movie
          .replace(/^the /, "")
          .replace(/^la /, "")
          .replace(/^le /, "");
        addMovie(movie, screen_name);
      });
      // process.exit();
    }
  });
  const orderedMovies = orderMovies(movies);
  const topMovies = makeTop(orderedMovies, 20);
  console.log("movies", topMovies);
  const orderedTitles = orderedMovies.map(movie => ({ name: movie.name }));
  await fsE.writeFile(
    "./dump/orderedMovies.json",
    JSON.stringify(orderedMovies, null, 2),
    "utf8"
  );
  await fsE.writeFile(
    "./dump/orderedTitles.json",
    JSON.stringify(orderedTitles, null, 2),
    "utf8"
  );
})();
