const _ = require("lodash");

module.exports = movies => {
  const groups = {};
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
  });
  const keys = Object.keys(groups);
  const fmtGroups = [];
  keys.forEach(key => {
    fmtGroups.push(groups[key]);
  });
  const sorted = _.sortBy(fmtGroups, [m => m.movies, m => m.votes]);
  sorted.reverse();
  return sorted;
};
