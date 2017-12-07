const _ = require("lodash");

const getDirectorFromCrew = ({ crew = [] }) => {
  let director = {};
  // console.log("crew", crew);
  crew.forEach(person => {
    // console.log("person", person);
    if (person.job === "Director") {
      director = person;
    }
  });
  // console.log("director", director);
  return director;
};

module.exports = movies => {
  const groups = {};
  movies.forEach(movie => {
    const { details, twitter, credits } = movie;
    const { count } = twitter;
    const { crew } = credits;

    const director = getDirectorFromCrew({ crew });
    if (director.hasOwnProperty("name") === false) {
      return;
    }
    const name = director.name;
    if (groups.hasOwnProperty(name) === false) {
      groups[name] = {
        poster: director.profile_path,
        name,
        votes: count,
        moviesCount: 1,
        movies: [details.original_title]
      };
    } else {
      groups[name].moviesCount++;
      groups[name].movies.push(details.original_title);
      groups[name].votes += count;
    }
  });
  const keys = Object.keys(groups);
  const fmtGroups = [];
  keys.forEach(key => {
    fmtGroups.push(groups[key]);
  });
  const sorted = _.sortBy(fmtGroups, [m => m.votes, m => m.moviesCount]);
  sorted.reverse();
  return sorted;
};
