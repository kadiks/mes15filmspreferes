const _ = require("lodash");

module.exports = movies => {
  const frenchMovies = movies.filter(movie => {
    const { details, twitter } = movie;
    if (details.hasOwnProperty("spoken_languages") === false) {
      return false;
    }
    if (details.hasOwnProperty("production_countries") === false) {
      return false;
    }
    const { spoken_languages, production_countries } = details;
    const { count } = twitter;
    const { iso_639_1 } = spoken_languages[0] || {};
    const spokenCountryCode = iso_639_1;
    const { iso_3166_1 } = production_countries[0] || {};
    const countryCode = iso_3166_1;

    return spokenCountryCode === "fr" && countryCode === "FR";
  });
  const sorted = _.sortBy(frenchMovies, [
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
