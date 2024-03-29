const fs = require("fs");

module.exports = {
  devServer: {
    https: {
      key: fs.readFileSync("./server.key"),
      cert: fs.readFileSync("./server.crt"),
    },
    port: 3000,
    host: "localhost",
  },
};


// - npm -g config set user root

// # install tiktok scrapper globally
// - npm i tiktok-scraper -g