require("dotenv").config();
const fs = require("./src/fs");
const fsE = require("fs-extra");
const slug = require("diacritics").remove;
const _ = require("lodash");

const processedTweetIds = [];
const movies = [];
const honorableMentions = ["hard candy", "a history of violence"];
const blackListMovies = [
  "mes 15 films preferes absolument pas dans l'ordre",
  "y a pas d'ordre hein)",
  "mes15filmspreferes",
  "kaamelott",
  "pas de classement)",
  "pas ds l'ordre)",
  "pas dans l'ordre)",
  "pas d'ordre)",
  "pas d'ordre particulier)",
  "..",
  ")",
  "voila mon top 3 des tops",
  "jouelacommebonello",
  "j'vais en faire 10 mdr)",
  "rockyramacrue",
  "trilogie cornetto",
  "rockyramacrue en attendant la liste avec les 200 autres",
  "pfff c'etait facile",
  "pas dans l'ordre",
  "liste nonexhaustive)",
  "filmo de miazaki"
];
const reassignedMovies = require("./dump/reassignedMovies.json");

// const regex = new RegExp(
//   "[1|2|3|4|5|6|7|8|9|10|11|12|13|14|15]?[-]?([\w'\. ])+\\n",
//   "gi"
// );
// const regex = new RegExp(
//   "[1|2|3|4|5|6|7|8|9|10|11|12|13|14|15]?[-]?([\\w'\\. -])+[\\(\\w \\)]*\\\n",
//   "gi"
// );
const regex = /[1|2|3|4|5|6|7|8|9|10|11|12|13|14|15]?[-|\.|*]?([\w'\. ,-])+[\(\w \)]*\n/gi;
// const regex = new RegExp("([\\w'\\. ])+", "gi");

const makeTop = (movies, max = 5) => {
  const top = [];
  movies.forEach((movie, index) => {
    // console.log("maxIndex", max, index);
    const newMovie = {
      name: movie.name,
      count: movie.count
    };
    if (index < max) {
      top.push(newMovie);
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
    // if user already added the movie
    if (movies[movieIndex].users.indexOf(screen_name) >= 0) {
      return;
    }
    const el = movies[movieIndex];
    el.count = el.count + 1;
    el.users.push(screen_name);
  } else {
    movies.push({ name: movie, count: 1, users: [screen_name] });
  }
};

(async () => {
  const data = {
    total: 0,
    decoded: 0,
    movies: 0,
    participants: 0,
    users: []
  };
  const rawTweets = await fs.getContent({ raw: true });

  data.total = rawTweets.length;

  rawTweets.forEach(rawTweet => {
    if (rawTweet.hasOwnProperty("full_text") === false) {
      return;
    }
    if (rawTweet.hasOwnProperty("retweeted_status") === true) {
      return;
    }
    const tweetId = rawTweet.id;
    if (processedTweetIds.indexOf(tweetId) >= 0) {
      return;
    }
    processedTweetIds.push(tweetId);
    let text = slug(rawTweet.full_text);
    text = text.replace(/’/g, "'"); // annoying french character
    text = text.replace(/&amp;/g, "et"); // annoying character
    text = text.replace(/\n\n/g, "\n"); // remove double newline character
    const screen_name = rawTweet.user.screen_name;
    // if (screen_name === "Ladislife") {
    //   console.log(rawTweet.full_text);
    //   console.log("---");
    //   console.log(text);
    // }
    const matches = text.match(regex);
    // const match = regex.exec(text);
    if (matches !== null) {
      data.decoded += 1;
      if (data.users.indexOf(screen_name) === -1) {
        data.users.push(screen_name);
      }
      // if (screen_name === "Ladislife") {
      //   console.log(matches);
      // }
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
        movie = movie.replace(/,/g, ""); // comma removal
        movie = movie.trim();
        movie = movie.toLowerCase();
        movie = movie
          .replace(/^the /, "")
          .replace(/^la /, "")
          .replace(/^les /, "")
          .replace(/^le /, "");

        // if (screen_name === "Ladislife") {
        //   console.log(movie);
        // }
        addMovie(movie, screen_name);
      });
      // process.exit();
    }
  });
  data.participants = data.users.length;
  const rawOrderedMovies = orderMovies(movies);
  const orderedMovies = rawOrderedMovies.filter(m => m.count > 1);
  data.movies = orderedMovies.length;
  const topMovies = makeTop(orderedMovies, 20);
  console.log("movies", topMovies);
  const orderedTitles = orderedMovies.map(movie => ({ name: movie.name }));
  await fs.saveContent(rawOrderedMovies, {
    newPath: "./dump/orderedMovies.json"
  });
  await fs.saveContent(rawOrderedMovies, {
    newPath: "./dump/rawOrderedMovies.json"
  });
  await fs.saveContent(orderedTitles, { newPath: "./dump/orderedTitles.json" });
  await fs.saveContent(topMovies, { newPath: "./dump/topMovies.json" });
  await fs.saveContent(data, { newPath: "./dump/data.json" });

  // await fsE.writeFile(
  //   "./dump/orderedMovies.json",
  //   JSON.stringify(orderedMovies, null, 2),
  //   "utf8"
  // );
  // await fsE.writeFile(
  //   "./dump/orderedTitles.json",
  //   JSON.stringify(orderedTitles, null, 2),
  //   "utf8"
  // );
})();
