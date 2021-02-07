const Feed = require("../models/feed");

async function addVideoToFeed(videoId, categories) {
  try {
    let latestFeedId = await Feed.findOne().sort({ field: "asc", id: -1 });
    if (!latestFeedId) {
      latestFeedId = 0;
    } else {
      latestFeedId = latestFeedId.id;
    }

    await Feed.updateOne(
      { id: latestFeedId, count: { $lt: 6 } },
      {
        $push: {
          videos: videoId,
          categories_list: categories,
        },
        $inc: { count: 1 },
        $setOnInsert: { id: latestFeedId + 1 },
      },
      { upsert: true }
    );
    return "success";
  } catch (err) {
    console.log(err.toString());
    return "adding video to feed collection failed" + err.toString();
  }
}

module.exports = {
  addVideoToFeed,
};
