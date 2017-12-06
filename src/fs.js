const fs = require("fs-extra");
const TWEET_PATH = "./dump/tweets.json";
const RAW_TWEET_PATH = "./dump/raw_tweets.json";

const getContent = async ({ raw = false, newPath = null } = {}) => {
  // console.log(">> #getContent", raw);
  try {
    let path = raw ? RAW_TWEET_PATH : TWEET_PATH;
    path = newPath ? newPath : path;
    const content = await fs.readFile(path, "utf8");
    const json = JSON.parse(content);
    // console.log("<< #getContent", raw);
    return json;
  } catch (e) {
    return {};
    throw `#getContent e: ${e}`;
  }
};

const saveContent = async (json, { raw = false, newPath = null } = {}) => {
  // console.log(">> #saveContent", raw);
  try {
    // console.log("#saveContent json", json);
    // console.log("#saveContent #2");
    // console.log("#saveContent tweets", tweets);
    let path = raw ? RAW_TWEET_PATH : TWEET_PATH;
    path = newPath ? newPath : path;
    await fs.writeFile(path, JSON.stringify(json, null, 2), "utf8");
    // console.log("<< #saveContent", raw);
  } catch (e) {
    throw `#saveContent e: ${e}`;
  }
};

module.exports = {
  getContent,
  saveContent
};
