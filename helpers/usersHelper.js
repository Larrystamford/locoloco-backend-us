const User = require("../models/user");

module.exports = {
  // generate user name for user using their email front + increment number
  generateUsername: async (email) => {
    var userEmail = email;
    var userName = userEmail.split("@")[0];
    var uniqueFound = false;
    var i = 1;
    var findingUserName = await User.find({ userName: userName });
    if (findingUserName.length == 0) {
      uniqueFound = true;
    }

    var originalUsername = userName;
    while (!uniqueFound) {
      userName = originalUsername + `${i}`;
      var findingUserName = await User.find({ userName: userName });
      if (findingUserName.length == 0) {
        uniqueFound = true;
      }
      i++;
    }

    return userName;
  },
};
