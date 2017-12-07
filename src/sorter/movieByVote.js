const _ = require("lodash");

module.exports = movies => {
  const sorted = _.sortBy(movies, [
    m => {
      return m.twitter.count || 0;
    },
    m => {
      return m.search.popularity || 0;
    }
  ]);
  sorted.reverse();
  return sorted;
};
