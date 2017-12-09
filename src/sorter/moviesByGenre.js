const _ = require("lodash");

module.exports = movies => {
  const groups = {};
  const total = {
    movies: 0,
    votes: 0
  };
  movies.forEach(movie => {
    const { details, twitter } = movie;
    if (details.hasOwnProperty("genres") === false) {
      return;
    }
    const genres = details.genres.map(g => g.name.toLowerCase());
    // console.log("sorter/moviesByGenre genres", details.genres);
    const { count } = twitter;
    genres.forEach(genre => {
      if (groups.hasOwnProperty(genre) === false) {
        groups[genre] = {
          genre,
          movies: 1,
          votes: count
        };
      } else {
        groups[genre].movies++;
        groups[genre].votes += count;
      }
      total.movies++;
      total.votes += count;
    });
  });
  const keys = Object.keys(groups);
  const fmtGroups = [];
  keys.forEach(key => {
    let { genre, movies, votes } = groups[key]; // key is "genre here"
    movies = parseInt(movies / total.movies * 10000, 10) / 100;
    votes = parseInt(votes / total.votes * 10000, 10) / 100;
    movies = `${movies} %`;
    votes = `${votes} %`;
    fmtGroups.push({ genre, movies });
  });
  const sorted = _.sortBy(fmtGroups, [
    m => parseInt(m.movies, 10),
    m => parseInt(m.votes, 10)
  ]);
  sorted.reverse();
  return sorted;
};
