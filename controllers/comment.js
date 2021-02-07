const { Comment, SubComment } = require("../models/comment");
const User = require("../models/user");
const Video = require("../models/video");
const Notification = require("../models/notification");

let CommentController = {
  // for initial feed
  listVideoComments: async (req, res, next) => {
    try {
      const { videoId } = req.params;

      const {
        query: { skip, pageSize },
      } = req;

      const listOfVideoComments = await Video.find({ _id: videoId }).populate({
        path: "comments",
        populate: { path: "replies" },
      });

      res.status(200).send(listOfVideoComments);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  createComment: async (req, res, next) => {
    try {
      const { videoId } = req.params;
      let { newComment, coverImageUrl, commentUserId } = req.body;
      let commenterId = newComment.userId;

      newComment = new Comment({
        commentTargetUserId: commentUserId,
        videoId: videoId,
        ...newComment,
      });

      await Video.findByIdAndUpdate(
        { _id: videoId },
        { $push: { comments: newComment } }
      );
      await newComment.save();

      // save comment to commenter
      await User.findByIdAndUpdate(
        { _id: commenterId },
        { $push: { comments: newComment } }
      );

      // notify the video owner that someone commented
      console.log(commentUserId, commenterId, "hello");
      if (commentUserId && commentUserId != commenterId) {
        let newNotification = {
          userPicture: newComment.picture,
          userName: newComment.userName,
          userId: newComment.userId,
          message: newComment.message,
          videoCoverImage: coverImageUrl,
          videoId: videoId,
          notificationType: "comment",
        };
        newNotification = new Notification(newNotification);
        await User.findByIdAndUpdate(
          { _id: commentUserId },
          { $push: { notifications: newNotification } }
        );
        await newNotification.save();
      }

      res.status(201).send(newComment);
    } catch (err) {
      console.log("1", err);
      res.status(500).send(err);
    }
  },
  createSubComment: async (req, res, next) => {
    try {
      // commentId of the original comment that this sub comment is replying to
      const { commentId } = req.params;
      let { newComment, coverImageUrl, commentUserId, videoId } = req.body;
      let commenterId = newComment.userId;

      newSubComment = new SubComment({
        commentTargetUserId: commentUserId,
        videoId: videoId,
        commentId: commentId,
        ...newComment,
      });
      await Comment.findByIdAndUpdate(
        { _id: commentId },
        { $push: { replies: newSubComment } }
      );
      await newSubComment.save();

      // save subcomment to commenter
      await User.findByIdAndUpdate(
        { _id: commenterId },
        { $push: { subComments: newSubComment } }
      );

      // notify the commenter that someone replied
      if (commentUserId && commentUserId != commenterId) {
        let newNotification = {
          userPicture: newComment.picture,
          userName: newComment.userName,
          userId: newComment.userId,
          message: newComment.message,
          videoCoverImage: coverImageUrl,
          videoId: videoId,
          notificationType: "comment_reply",
        };
        newNotification = new Notification(newNotification);
        await User.findByIdAndUpdate(
          { _id: commentUserId },
          { $push: { notifications: newNotification } }
        );
        await newNotification.save();
      }

      const updatedComment = await Comment.findById(commentId);
      res.status(201).send(updatedComment);
    } catch (err) {
      console.log("1", err);
      res.status(500).send(err);
    }
  },
};

module.exports = CommentController;
