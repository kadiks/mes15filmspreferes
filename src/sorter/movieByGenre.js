const _ = require("lodash");

const filterMovieByGenre = ({ movies, genre }) => {
  const genreMovies = movies.filter(movie => {
    const { twitter, details } = movie;
    const detailsGenre = details.genres || [];
    const genres = detailsGenre.map(g => g.name.toLowerCase());
    return genres.includes(genre);
  });
  return genreMovies;
};

module.exports = {
  action: movies => filterMovieByGenre({ movies, genre: "action" }),
  adventure: movies => filterMovieByGenre({ movies, genre: "adventure" }),
  animation: movies => filterMovieByGenre({ movies, genre: "animation" }),
  comedy: movies => filterMovieByGenre({ movies, genre: "comedy" }),
  crime: movies => filterMovieByGenre({ movies, genre: "crime" }),
  documentary: movies => filterMovieByGenre({ movies, genre: "documentary" }),
  drama: movies => filterMovieByGenre({ movies, genre: "drama" }),
  family: movies => filterMovieByGenre({ movies, genre: "family" }),
  fantasy: movies => filterMovieByGenre({ movies, genre: "fantasy" }),
  history: movies => filterMovieByGenre({ movies, genre: "history" }),
  horror: movies => filterMovieByGenre({ movies, genre: "horror" }),
  music: movies => filterMovieByGenre({ movies, genre: "music" }),
  mystery: movies => filterMovieByGenre({ movies, genre: "mystery" }),
  romance: movies => filterMovieByGenre({ movies, genre: "romance" }),
  "science fiction": movies =>
    filterMovieByGenre({ movies, genre: "science fiction" }),
  "tv movie": movies => filterMovieByGenre({ movies, genre: "tv movie" }),
  thriller: movies => filterMovieByGenre({ movies, genre: "thriller" }),
  war: movies => filterMovieByGenre({ movies, genre: "war" }),
  western: movies => filterMovieByGenre({ movies, genre: "western" })
};
