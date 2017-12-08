const _ = require("lodash");

module.exports = movies => {
  const groups = {};
  const total = {
    movies: 0,
    votes: 0
  };
  movies.forEach(movie => {
    const { details, twitter } = movie;
    if (details.hasOwnProperty("production_countries") === false) {
      return;
    }
    const { production_countries } = details;
    const { count } = twitter;
    const { iso_3166_1, name } = production_countries[0] || {};
    const countryCode = iso_3166_1;
    if (groups.hasOwnProperty(countryCode) === false) {
      groups[countryCode] = {
        country: name,
        movies: 1,
        votes: count
      };
    } else {
      groups[countryCode].movies++;
      groups[countryCode].votes += count;
    }
    total.movies++;
    total.votes += count;
  });
  const keys = Object.keys(groups);
  const fmtGroups = [];
  keys.forEach(key => {
    let { country, movies, votes } = groups[key]; // key is "countryCode here"
    movies = parseInt(movies / total.movies * 10000, 10) / 100;
    votes = parseInt(votes / total.votes * 10000, 10) / 100;
    movies = `${movies} %`;
    votes = `${votes} %`;
    fmtGroups.push({ country, movies, votes });
  });
  const sorted = _.sortBy(fmtGroups, [
    m => parseInt(m.movies, 10),
    m => parseInt(m.votes, 10)
  ]);
  sorted.reverse();
  return sorted;
};
