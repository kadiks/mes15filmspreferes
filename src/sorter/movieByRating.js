const _ = require("lodash");

module.exports = movies => {
  const sorted = _.sortBy(movies, [
    m => {
      return m.search.vote_average || 0;
    },
    m => {
      return m.search.popularity || 0;
    }
  ]);
  sorted.reverse();
  return sorted;
};
