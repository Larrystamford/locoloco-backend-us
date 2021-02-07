const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const commentSchema = new Schema(
  {
    commentTargetUserId: String,
    videoId: String, // which video it belongs to
    picture: String,
    userName: String,
    userId: String,
    message: String,
    likes: [String], // list of userIds that has liked the comment
    likesCount: Number,
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "SubComment",
      },
    ],
  },
  { timestamps: true }
);

// Create a Schema
const subCommentSchema = new Schema(
  {
    commentTargetUserId: String,
    videoId: String, // which video it belongs to
    commentId: String, // which comment it belongs to
    picture: String,
    userName: String,
    userId: String,
    message: String,
    likes: [String], // list of userIds that has liked the comment
    likesCount: Number,
  },
  { timestamps: true }
);

const SubComment = mongoose.model("SubComment", subCommentSchema);
const Comment = mongoose.model("Comment", commentSchema);

module.exports = { Comment, SubComment };
