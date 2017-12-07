require("dotenv").config();
const fs = require("./src/fs");
const slug = require("diacritics").remove;
const _ = require("lodash");

const processedTweetIds = [];
const movies = [];
const honorableMentions = ["hard candy", "a history of violence"];
const blackListMovies = [
  "mes15filmspreferes",
  "kaamelott",
  "pas de classement)",
  "pas ds l'ordre)",
  "pas dans l'ordre)",
  "pas d'ordre)",
  "pas d'ordre particulier)",
  "..",
  ")",
  "voila mon top 3 des tops",
  "jouelacommebonello",
  "j'vais en faire 10 mdr)",
  "rockyramacrue",
  "trilogie cornetto",
  "tuches"
];
const reassignedMovies = {
  lalaland: "la la land",
  "la land": "la la land",
  "lala land": "la la land",
  "amelie poulain": "fabuleux destin d'amelie poulain",
  "001": "2001 l'odyssee de l'espace",
  "2001": "2001 l'odyssee de l'espace",
  "001 l'odyssee de l'espace": "2001 l'odyssee de l'espace",
  "001 a space odyssey": "2001 l'odyssee de l'espace",
  "a space odyssey": "2001 l'odyssee de l'espace",
  "l'odyssee de l'espace": "2001 l'odyssee de l'espace",
  "046": "2046",
  t2: "terminator 2",
  jaws: "dents de la mer",
  gattaca: "bienvenue a gattaca",
  "bienvenu a gattaca": "bienvenue a gattaca",
  "trueman show": "truman show",
  "eme sens": "sixieme sens",
  arrival: "premier contact",
  "un nid de coucou": "vol au dessus d'un nid de coucou",
  "vol audessus d'un nid de coucou": "vol au dessus d'un nid de coucou",
  "vice-versa": "vice versa",
  viceversa: "vice versa",
  "et. l'extraterrestre": "e.t.",
  "et.": "e.t.",
  et: "e.t.",
  "dead poets society": "cercle des poetes disparus",
  "dead poet society": "cercle des poetes disparus",
  "cercle des poetes disparu": "cercle des poetes disparus",
  "00 days of summer": "500 days of summer",
  "00) jours ensemble": "500 days of summer",
  "00) days of summer": "500 days of summer",
  "500 jours ensemble": "500 days of summer",
  "fury road": "mad max fury road",
  madmaxfuryroad: "mad max fury road",
  "mad max 2": "mad max fury road",
  "mad max ii": "mad max fury road",
  "madmax fury road": "mad max fury road",
  "2 hommes en colere": "12 hommes en colere",
  "12 angry men": "12 hommes en colere",
  "star wars i": "star wars 1",
  "star wars ii": "star wars 2",
  "star wars iii": "star wars 3",
  "star wars iv": "star wars 4",
  "star wars v": "star wars 5",
  "star wars vi": "star wars 6",
  "star wars vii": "star wars 7",
  "reveil de la force": "star wars 7",
  "l'empire contreattaque": "star wars 5",
  "l'empire contre attaque": "star wars 5",
  "l'empire contre-attaque": "star wars 5",
  "empire contreattaque": "star wars 5",
  "empire contre attaque": "star wars 5",
  "empire strikes back": "star wars 5",
  "retour du jedi": "star wars 6",
  "un nouvel espoir": "star wars 4",
  "a new hope": "star wars 4",
  "revanche des sith": "star wars 3",
  "avengers 2": "avengers l'ere d'ultron",
  "l'ere d'ultron": "avengers l'ere d'ultron",
  ultron: "avengers l'ere d'ultron",
  "eternal sunshine": "eternal sunshine of the spotless mind",
  "eternal sunshine.": "eternal sunshine of the spotless mind",
  "eternal sunshine of..": "eternal sunshine of the spotless mind",
  "eternal sunshine..": "eternal sunshine of the spotless mind",
  "eternal sunshine of the spotlessmind":
    "eternal sunshine of the spotless mind",
  "scott pilgrim": "scott pilgrim vs the world",
  miles: "8 miles",
  "rencontres du 3e type": "rencontres du troisieme type",
  "rencontres du 3eme type": "rencontres du troisieme type",
  "rencontre du 3e type": "rencontres du troisieme type",
  "rencontre du troisieme type": "rencontres du troisieme type",
  "rencontre du 3eme type": "rencontres du troisieme type",
  "schindler's list": "liste de schindler",
  "liste de shindler": "liste de schindler",
  "godfather 2": "parrain 2",
  "parrain ii": "parrain 2",
  "parrain 1": "parrain",
  godfather: "parrain",
  "spider man 2": "spiderman 2",
  "spider man": "spiderman",
  "spider-man": "spiderman",
  shinning: "shining",
  "narnia 1": "monde de narnia",
  "kill bill volume 1": "kill bill",
  "kill bill 1": "kill bill",
  "kill bill volume 2": "kill bill 2",
  "kill bill 1et2": "kill bill",
  "kill bill vol1 et 2": "kill bill",
  "kill bill vol 1 et 2": "kill bill",
  "1 grammes": "21 grammes",
  nemo: "monde de nemo",
  "finding nemo": "monde de nemo",
  femmes: "8 femmes",
  zootopie: "zootopia",
  "hp l'ecole des sorcier": "harry potter",
  "hp et le prisonnier d'azkaban": "harry potter 3",
  "saga harry potter": "harry potter",
  "harry potter 1": "harry potter",
  "harry potter et le prisonnier d'azkaban": "harry potter 3",
  chihiro: "voyage de chihiro",
  "x-men": "xmen",
  "silence of the lambs": "silence des agneaux",
  "hana bi": "hana-bi",
  hanabi: "hana-bi",
  "scary movie 1": "scary movie",
  wonderwoman: "wonder woman",
  "dark knigt": "dark knight",
  "dark night": "dark knight",
  "batman the dark knight": "dark knight",
  "indiana jones iii": "indiana jones 3",
  "indiana jones et le temple maudit": "indiana jones 2",
  "indy et le temple maudit": "indiana jones 2",
  "indiana jones et la derniere croisade": "indiana jones 3",
  "raiders of the lost ark": "aventuriers de l'arche perdue",
  "inglorious bastards": "inglorious basterds",
  "v for vendetta": "v pour vendetta",
  "seigneur des anneaux la trilogie": "seigneur des anneaux",
  "communaute de l'anneau": "seigneur des anneaux",
  "lotr trilogy": "seigneur des anneaux",
  lotr: "seigneur des anneaux",
  "lord of the rings": "seigneur des anneaux",
  "retour du roi": "seigneur des anneaux 3",
  "deux tours": "seigneur des anneaux 2",
  "lotr 3": "seigneur des anneaux 3",
  "trilogie lotr": "seigneur des anneaux",
  sda: "seigneur des anneaux",
  exorcist: "l'exorciste",
  "2 years a slave": "12 years a slave",
  mib: "men in black",
  birds: "oiseaux",
  "back to the future 2": "retour vers le futur 2",
  "retour vers le futur ii": "retour vers le futur 2",
  bttf: "retour vers le futur",
  "back to the future": "retour vers le futur",
  "5e element": "cinquieme element",
  "5eme element": "cinquieme element",
  it: "ca",
  "die hard 1": "piege de cristal",
  "die hard 2": "une journee en enfer",
  "die hard": "piege de cristal",
  intouchable: "intouchables",
  "perks of being a wallflower": "monde de charlie",
  se7en: "seven",
  "great gatsby": "gatsby le magnifique",
  "edward scissorhands": "edward aux mains d'argent",
  argent: "edward aux mains d'argent",
  "todo sobre mi madre": "tout sur ma mere",
  "groundhog day": "un jour sans fin",
  goodfellas: "affranchis",
  "brute et le truand": "bon la brute et le truand",
  "forest gump": "forrest gump",
  "deer hunter": "voyage au bout de l'enfer",
  "singin' in the rain": "chantons sous la pluie",
  "singin in the rain": "chantons sous la pluie",
  "usual suspect": "usual suspects",
  cie: "monstres et cie",
  mrnobody: "mr nobody",
  "ferris bueller": "folle journee de ferris bueller",
  "ferris bueller's day off": "folle journee de ferris bueller",
  "sept samourais": "7 samourais",
  "hateful eight": "8 salopards",
  "jurassik park": "jurassic park",
  oldboy: "old boy",
  "a clockwork orange": "orange mecanique",
  "l'etrange noel de mr jack": "l'etrange noel de m jack",
  "l'etrange noel de monsieur jack": "l'etrange noel de m jack",
  psycho: "psychose",
  "captain america civil war": "captain america 3",
  "captain america le soldat de l'hiver": "captain america 2",
  unbreakable: "incassable",
  "big lebowsky": "big lebowski",
  "mullholand drive": "mulholland drive",
  "green mile": "ligne verte",
  "barry lindon": "barry lyndon",
  "au revoir lahaut": "au revoir la haut",
  "josey wales horsla-loi": "josey wales",
  "dances with wolves": "danse avec les loups",
  "newyork 1997": "new-york 1997",
  "alice aux pays des merveilles": "alice au pays des merveilles",
  "slumdog millionnaire": "slumdog millionaire",
  "americain history x": "american history x",
  "night of the hunter": "nuit du chasseur",
  "royal tenenbaum": "famille tenenbaum",
  rhps: "rocky horror picture show",
  "billy eliott": "billy elliot",
  "lion king": "roi lion",
  "almost famous": "presque celebre",
  "wall-e": "walle",
  "mean girls": "lolita malgre moi",
  "0 nuances de grey": "50 nuances de grey",
  "catch me if you can": "arrete moi si tu peux",
  "once upon a time in the west": "il etait une fois dans l'ouest",
  "amour et amnesie": "50 first dates",
  "20 battements par minute": "120 battements par minute",
  "a bronx tale": "il etait une fois le bronx",
  "inglorious bastard": "inglorious basterds"
};

// const regex = new RegExp(
//   "[1|2|3|4|5|6|7|8|9|10|11|12|13|14|15]?[-]?([\w'\. ])+\\n",
//   "gi"
// );
// const regex = new RegExp(
//   "[1|2|3|4|5|6|7|8|9|10|11|12|13|14|15]?[-]?([\\w'\\. -])+[\\(\\w \\)]*\\\n",
//   "gi"
// );
const regex = /[1|2|3|4|5|6|7|8|9|10|11|12|13|14|15]?[-|\.|*]?([\w'\. -])+[\(\w \)]*\n/gi;
// const regex = new RegExp("([\\w'\\. ])+", "gi");

const makeTop = (movies, max = 5) => {
  const top = [];
  movies.forEach((movie, index) => {
    // console.log("maxIndex", max, index);
    const newMovie = {
      name: movie.name,
      count: movie.count
    };
    if (index < max) {
      top.push(newMovie);
    }
  });
  return top;
};

const orderMovies = movies => {
  return _.orderBy(movies, ["count"], ["desc"]);
};

const addMovie = (movie, screen_name) => {
  if (
    movie.toLowerCase().includes("Mes15filmspreferes".toLowerCase()) === true
  ) {
    return;
  }
  if (blackListMovies.indexOf(movie) >= 0) {
    return;
  }
  if (movie.length === 0) {
    return;
  }
  if (reassignedMovies.hasOwnProperty(movie)) {
    movie = reassignedMovies[movie];
  }
  const moviesKey = movies.map(m => m.name);
  const movieIndex = moviesKey.indexOf(movie);
  if (movieIndex >= 0) {
    // if user already added the movie
    if (movies[movieIndex].users.indexOf(screen_name) >= 0) {
      return;
    }
    const el = movies[movieIndex];
    el.count = el.count + 1;
    el.users.push(screen_name);
  } else {
    movies.push({ name: movie, count: 1, users: [screen_name] });
  }
};

(async () => {
  const data = {
    total: 0,
    decoded: 0,
    movies: 0,
    participants: 0,
    users: []
  };
  const rawTweets = await fs.getContent({ raw: true });

  data.total = rawTweets.length;

  rawTweets.forEach(rawTweet => {
    if (rawTweet.hasOwnProperty("full_text") === false) {
      return;
    }
    if (rawTweet.hasOwnProperty("retweeted_status") === true) {
      return;
    }
    const tweetId = rawTweet.id;
    if (processedTweetIds.indexOf(tweetId) >= 0) {
      return;
    }
    processedTweetIds.push(tweetId);
    // console.log(rawTweet.full_text);
    let text = slug(rawTweet.full_text);
    text = text.replace(/’/g, "'"); // annoying french character
    text = text.replace(/&amp;/g, "et"); // annoying french character
    const screen_name = rawTweet.user.screen_name;
    // console.log(text);
    const matches = text.match(regex);
    // const match = regex.exec(text);
    if (matches !== null) {
      data.decoded += 1;
      if (data.users.indexOf(screen_name) === -1) {
        data.users.push(screen_name);
      }
      // console.log(matches);
      const movies = matches.map(match => {
        let movie = match.replace("\n", ""); // break line removal
        movie = movie.replace(/^[1|2|3|4|5|6|7|8|9|10|11|12|13|14|15][ ]?/, ""); // figure removal
        // movie = movie.replace(/^([1-9]|[1][0-9])[ ]?/, ""); // figure removal
        movie = movie.replace(/[-][ ]?/, ""); // dash removal
        movie = movie.replace(/[\.][ ]?/, ""); // dot removal
        movie = movie.replace(/[\*][ ]?/, ""); // star removal
        movie = movie.replace(/[_][ ]?/, ""); // underscore removal
        movie = movie.replace(/\([\w ]+\)/, ""); // parenthsis removal
        movie = movie.trim();
        movie = movie.toLowerCase();
        movie = movie
          .replace(/^the /, "")
          .replace(/^la /, "")
          .replace(/^les /, "")
          .replace(/^le /, "");
        addMovie(movie, screen_name);
      });
      // process.exit();
    }
  });
  data.participants = data.users.length;
  const rawOrderedMovies = orderMovies(movies);
  const orderedMovies = rawOrderedMovies.filter(m => m.count > 1);
  data.movies = orderedMovies.length;
  const topMovies = makeTop(orderedMovies, 20);
  console.log("movies", topMovies);
  const orderedTitles = orderedMovies.map(movie => ({ name: movie.name }));
  await fs.saveContent(orderedMovies, { newPath: "./dump/orderedMovies.json" });
  await fs.saveContent(rawOrderedMovies, {
    newPath: "./dump/rawOrderedMovies.json"
  });
  await fs.saveContent(orderedTitles, { newPath: "./dump/orderedTitles.json" });
  await fs.saveContent(topMovies, { newPath: "./dump/topMovies.json" });
  await fs.saveContent(data, { newPath: "./dump/data.json" });

  // await fsE.writeFile(
  //   "./dump/orderedMovies.json",
  //   JSON.stringify(orderedMovies, null, 2),
  //   "utf8"
  // );
  // await fsE.writeFile(
  //   "./dump/orderedTitles.json",
  //   JSON.stringify(orderedTitles, null, 2),
  //   "utf8"
  // );
})();
