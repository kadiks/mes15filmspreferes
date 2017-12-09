require("dotenv").config();
const Twitter = require("twitter");
const fs = require("./src/fs");

const client = new Twitter({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const getCleanTweet = tweet => {
  // console.log(">> #getCleanTweet");
  const { full_text, id, id_str, created_at, user } = tweet;
  const { name, screen_name } = user;
  const newTweet = {
    full_text,
    id,
    id_str,
    created_at,
    user_id: user.id,
    name,
    screen_name
  };
  // console.log("<< #getCleanTweet");
  return newTweet;
};

const addToTweetList = async (tweets, { raw = false } = {}) => {
  // console.log(">> #addToTweetList", raw);
  try {
    const json = await fs.getContent({ raw });
    // console.log("#addToTweetList json", json);
    const updatedJson = [...json, ...tweets];
    // console.log("#addToTweetList updatedJson", updatedJson);
    await fs.saveContent(updatedJson, { raw });
    // console.log("<< #addToTweetList", raw);
  } catch (e) {
    throw `#addToTweetList e: ${e}`;
  }
};

const fetchTweets = async ({ id, fetchSelector } = {}) => {
  console.log(">> #fetchTweets");
  return new Promise((resolve, reject) => {
    const params = { q: "#mes15filmspreferes", tweet_mode: "extended" };
    const selectors = {
      oldest: "max_id",
      newest: "since_id"
    };
    if (id && fetchSelector) {
      params[selectors[fetchSelector]] = id;
    }
    console.log("#fetchTweets params", params);
    console.log("#fetchTweets id", id);
    console.log("#fetchTweets fetchSelector", fetchSelector);
    client.get("search/tweets", params, async (error, tweets, response) => {
      if (error !== null) {
        reject(error);
        return;
      }
      const { statuses } = tweets;
      const cleanTweets = statuses.map(tweet => getCleanTweet(tweet));

      if (statuses.length === 0) {
        console.log("No more tweets");
        return;
      }
      // const cleanTweets = statuses;
      await addToTweetList(statuses, { raw: true });
      await addToTweetList(cleanTweets);
    });
  });
};

const getOldestTweet = async () => {
  const tweets = await fs.getContent();
  if (tweets.length === 0) {
    return {};
  }
  let selectedTweet;
  tweets.forEach(tweet => {
    if (!selectedTweet) {
      selectedTweet = tweet;
    }
    if (
      new Date(tweet.created_at).getTime() <
      new Date(selectedTweet.created_at).getTime()
    ) {
      selectedTweet = tweet;
    }
  });
  return selectedTweet;
};

const getNewestTweet = async () => {
  const tweets = await fs.getContent();
  if (tweets.length === 0) {
    return {};
  }
  let selectedTweet;
  tweets.forEach(tweet => {
    if (!selectedTweet) {
      selectedTweet = tweet;
    }
    if (
      new Date(tweet.created_at).getTime() >
      new Date(selectedTweet.created_at).getTime()
    ) {
      selectedTweet = tweet;
    }
  });
  return selectedTweet;
};

(async () => {
  const fetchSelector = "oldest";
  const fn = {
    newest: getNewestTweet,
    oldest: getOldestTweet
  };
  const selectedTweet = await fn[fetchSelector]();
  // const { id } = selectedTweet;
  const id = selectedTweet.hasOwnProperty("id") ? selectedTweet.id : null;

  console.log(" selectedTweet", selectedTweet);
  console.log(" id", selectedTweet.id);
  console.log(" fetchSelector", fetchSelector);

  console.log(await fetchTweets({ id, fetchSelector }));
})();
