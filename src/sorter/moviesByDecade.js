const _ = require("lodash");

module.exports = movies => {
  const groups = {};
  const total = {
    movies: 0,
    votes: 0
  };
  movies.forEach(movie => {
    const { details, twitter } = movie;
    if (details.hasOwnProperty("release_date") === false) {
      return;
    }
    const release_date = details.release_date || "x-x-x";
    const release_year = parseInt(release_date.split("-")[0], 10);
    if (isNaN(release_year) === true) {
      return;
    }
    const decade_calc = parseInt(release_year / 10, 10);
    const release_decade = decade_calc * 10;
    const next_decade = (decade_calc + 1) * 10;
    const decade = `${release_decade}-${next_decade}`;
    const { count } = twitter;
    if (release_decade === 1890) {
      // console.log("sorter/moviesByDecade movie", release_decade, details.title);
      return;
    }
    if (groups.hasOwnProperty(decade) === false) {
      groups[decade] = {
        decade,
        movies: 1,
        votes: count
      };
    } else {
      groups[decade].movies++;
      groups[decade].votes += count;
    }
    total.movies++;
    total.votes += count;
  });
  const keys = Object.keys(groups);
  const fmtGroups = [];
  keys.forEach(key => {
    let { decade, movies, votes } = groups[key]; // key is "countryCode here"
    movies = parseInt(movies / total.movies * 10000, 10) / 100;
    votes = parseInt(votes / total.votes * 10000, 10) / 100;
    movies = `${movies} %`;
    votes = `${votes} %`;
    fmtGroups.push({ decade, movies });
  });
  const sorted = _.sortBy(fmtGroups, [
    m => parseInt(m.movies, 10),
    m => parseInt(m.votes, 10)
  ]);
  sorted.reverse();
  return sorted;
};
