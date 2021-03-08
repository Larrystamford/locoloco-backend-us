// Packages
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const Pusher = require("pusher");
const cors = require("cors");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// Init mongoose
const connection_url = process.env.DB;

mongoose
  .connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((db) => {
    console.log("Database Connected Successfully");
  })
  .catch((err) => console.log(err));

const db = mongoose.connection;

db.once("open", () => {});

// Init localhost
const app = express();
// var corsOptions = {
//   origin: [
//     "http://localhost:3000",
//     "https://www.shoplocoloco.com",
//     "https://www.api.shoplocoloco.com",
//   ],
//   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };
app.use(cors());

// Middlewares
if (!process.env.NODE_ENV === "test") {
  app.use(morgan("dev"));
}
app.use(bodyParser.json());

// Routes
app.get("/", async (req, res) => {
  res.send({ v1: "usa version" });
});
app.use("/v1/users", require("./routes/users"));
app.use("/v1/video", require("./routes/video_and_item"));
app.use("/v1/feed", require("./routes/feed"));
app.use("/v1/upload", require("./routes/upload"));
app.use("/v1/email", require("./routes/email"));
app.use("/v1/payment", require("./routes/payment"));
app.use("/v1/admin", require("./routes/admin"));
app.use("/v1/comment", require("./routes/comment"));
app.use("/v1/review", require("./routes/review"));
app.use("/v1/notifications", require("./routes/notifications"));
app.use("/v1/utils", require("./routes/utils"));
app.use("/v1/error", require("./routes/error"));
app.get("/.well-known/apple-developer-merchantid-domain-association", function (
  req,
  res
) {
  res.sendfile(
    __dirname + "/.well-known/apple-developer-merchantid-domain-association"
  );
});

// Start the Server
const port = process.env.PORT || 5000;
app.listen(port);
console.log(`Server listening at ${port}`);
