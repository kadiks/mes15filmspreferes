# #Mes15FilmsPréférés

Side project pour analyser la liste des tweets à partir du hashtag
[#Mes15FilmsPréférés](https://twitter.com/hashtag/mes15filmspreferes?f=tweets&vertical=default&src=hash)
(qui n'a même pas "trendé" :-/)

## Installation

### Prérequis

* Installer [Node.JS](https://nodejs.org/en/) 7+
* Créer un compte [Twitter](https://twitter.com/)
* Créer un compte [TMDb](https://www.themoviedb.org/?language=en)

#### Twitter

Il faudra créer une application qui contiendra les clés API nécessaires

#### TMDb

Il faudra créer une application qui contiendra la clé API nécessaire

### Démarrage

1. Créer un fichier `.env` à la racine, celui ci contiendra les variables
   suivantes :

```
TWITTER_API_KEY=xxx
TWITTER_API_SECRET=xxx
TWITTER_ACCESS_TOKEN=xxx
TWITTER_ACCESS_TOKEN_SECRET=xxx
TMDB_API_KEY=xxx
```

1. Remplacez les `xxx` par ce que vous donne Twitter et TMDb

1. Tapez dans l'invite de commande : `npm install` pour installer tous les
   packages nécessaires

1. Lancez la commande : `node index` jusqu'à voir la mention (`No more tweets`)

1. Lancez ensuite la commande : `node extract_movies` qui va ordonner les
   résultats dans un JSON

1. Lancez la commande 15 fois : `node fetchDetails` jusqu'à avoir les 15
   premiers titres (ou plus pour avoir la totalité)

1. Lancez la commande : `node report` qui vous donnera le format de reporting
   que j'ai utilisé pour le blog.
