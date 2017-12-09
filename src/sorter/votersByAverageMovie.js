const _ = require("lodash");

const MIN_MOVIES_FOR_AVERAGE = 5;

const getPosterByUsername = user => {
  return `https://twitter.com/${user}/profile_image?size=bigger`;
};

const getUsersByMovies = ({ movies }) => {
  const usersByMovies = {};
  movies.forEach(movie => {
    const { twitter } = movie;
    const { name, count, users } = twitter;
    users.forEach(user => {
      if (usersByMovies.hasOwnProperty(user) === false) {
        usersByMovies[user] = [name];
      } else {
        usersByMovies[user].push(name);
      }
    });
  });
  return usersByMovies;
};

const getMoviesByRating = ({ movies }) => {
  const moviesByRating = {};
  movies.forEach(movie => {
    const { twitter, details } = movie;
    const { vote_average } = details;
    const { name } = twitter;
    if (vote_average) {
      moviesByRating[name] = vote_average;
    }
  });
  return moviesByRating;
};

const getVotersByAverageMovie = ({ movies, sort = "desc" } = {}) => {
  const usersByMovies = getUsersByMovies({ movies });
  const moviesByRating = getMoviesByRating({ movies });

  const users = {};
  const keysUsersByMovies = Object.keys(usersByMovies);
  keysUsersByMovies.forEach(keyUsersByMovies => {
    const user = keyUsersByMovies;
    const userMovies = usersByMovies[user];
    let totalAverageMovies = 0;
    let moviesCount = 0;
    const selectedMovies = [];
    userMovies.forEach(movie => {
      // if (user === "DKrszk") {
      //   console.log(
      //     "sorter/votersByAverageMovie moviesByRating[movie]",
      //     movie,
      //     moviesByRating[movie]
      //   );
      // }
      if (moviesByRating.hasOwnProperty(movie)) {
        // if (user === "MarionPo6") {
        //   console.log("sorter/votersByAverageMovie movie", movie);
        //   console.log(
        //     "sorter/votersByAverageMovie moviesByRating[movie]",
        //     moviesByRating[movie]
        //   );
        // }
        selectedMovies.push(movie);
        totalAverageMovies += moviesByRating[movie];
        moviesCount++;
      }
    });
    const average = parseInt(totalAverageMovies / moviesCount * 10, 10) / 10;
    if (selectedMovies.length >= MIN_MOVIES_FOR_AVERAGE) {
      // if (user === "MarionPo6") {
      //   console.log(
      //     "sorter/votersByAverageMovie selectedMovies",
      //     selectedMovies
      //   );
      // }
      users[user] = {
        user,
        image: getPosterByUsername(user),
        average,
        movies: selectedMovies
      };
    }
    // if (user === "Ladislife") {
    //   console.log("sorter/votersByAverageMovie users[user]", users[user]);
    //   // console.log("sorter/votersByAverageMovie users[user]", selectedMovies);
    // }
    // console.log(userMovies, keyUsersByMovies);
    // process.exit();
  });

  const groups = users;

  const keys = Object.keys(groups);
  const fmtGroups = [];
  keys.forEach(key => {
    fmtGroups.push(groups[key]);
  });
  const sorted = _.sortBy(fmtGroups, [m => Number(m.average)]);
  if (sort === "desc") {
    sorted.reverse();
  }
  return sorted;
};

module.exports = {
  desc: movies => getVotersByAverageMovie({ movies, sort: "desc" }),
  asc: movies => getVotersByAverageMovie({ movies, sort: "asc" })
};
