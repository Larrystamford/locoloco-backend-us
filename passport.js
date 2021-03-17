const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const LocalStrategy = require("passport-local").Strategy;
const GoogleTokenStrategy = require("passport-google-token").Strategy;
const User = require("./models/user");
const Notification = require("./models/notification");
const usersHelper = require("./helpers/usersHelper");
const sendEmailService = require("./service/email");

// passport.authenticate('jwt', { session: false }) JSON WEB TOKEN STRATEGY
// returns the user if the user exist
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader("authorization"),
      secretOrKey: "authentication",
    },
    async (payload, done) => {
      try {
        // Find the user specified in token
        const user = await User.findById(payload.sub);
        // If user doesn't exist, return 'error' or null

        if (!user) {
          return done(null, false);
        }
        // Otherwise, return the user
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

// LOCAL STRATEGY (Store token in LocalStorage)
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        // Find the user given the email
        const user = await User.findOne({ "local.email": email });

        // If not, handle it
        if (!user) {
          return done(null, false);
        }
        // Check if the password is correct
        const isMatch = await user.isValidPassword(password);

        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        console.log("local strategy error");
        done(error, false);
      }
    }
  )
);

// Google OAuth Strategy
passport.use(
  "googleToken",
  new GoogleTokenStrategy(
    {
      clientID: process.env.GOOGLE_AUTH_ID,
      clientSecret: process.env.GOOGLE_AUTH_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check whether this current user exists in our Database
        const existingUser = await User.findOne({ "google.id": profile.id });
        if (existingUser) {
          console.log("User already exist in our DB");
          // if (existingUser.authStatus == "AUTH_SIGN_UP") {
          //   existingUser.picture = profile._json.picture;
          //   existingUser.authStatus = "AUTH_SIGN_IN";
          //   await existingUser.save();
          // }

          // existingUser.picture = profile._json.picture;
          existingUser.authStatus = "AUTH_SIGN_IN";
          await existingUser.save();

          return done(null, existingUser);
        } else {
          console.log(
            "User doesn't exist - We are creating a new one with Google Account"
          );

          const randomSelectProfilePic = Math.floor(Math.random() * 8);
          const locoProfilePic = [
            "https://media2locoloco-us.s3.amazonaws.com/profile_pic_loco_1.png",
            "https://media2locoloco-us.s3.amazonaws.com/profile_pic_loco_2.png",
            "https://media2locoloco-us.s3.amazonaws.com/profile_pic_loco_3.png",
            "https://media2locoloco-us.s3.amazonaws.com/profile_pic_loco_4.png",
            "https://media2locoloco-us.s3.amazonaws.com/profile_pic_loco_5.png",
            "https://media2locoloco-us.s3.amazonaws.com/profile_pic_loco_6.png",
            "https://media2locoloco-us.s3.amazonaws.com/profile_pic_loco_7.png",
            "https://media2locoloco-us.s3.amazonaws.com/profile_pic_loco_8.png",
          ];

          const welcomeNotification = new Notification({
            userPicture:
              "https://media2locoloco.s3-ap-southeast-1.amazonaws.com/just_loco_loco.jpg",
            userName: "shoplocoloco",
            message: "Welcome to the Loco Family! Start watching now!",
            notificationType: "broadcast",
            redirectLink: "/",
          });
          await welcomeNotification.save();

          const newUser = new User({
            method: "google",
            google: {
              id: profile.id,
              email: profile.emails[0].value,
            },

            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            picture: locoProfilePic[randomSelectProfilePic],
            email: profile.emails[0].value,
            authStatus: "AUTH_SIGN_UP",
            likedVideos: [],
            profileBio: "welcome to shoplocoloco.com 🎉",
          });
          newUser.notifications = [welcomeNotification];
          newUser.userName = await usersHelper.generateUsername(newUser.email);

          await newUser.save();

          sendEmailService.sendEmailSignUp(
            newUser.email,
            "Welcome to the Loco Family! 🎉",
            "Message sent from www.shoplocoloco.com"
          );

          done(null, newUser);
        }
      } catch (error) {
        done(error, false, error.message);
      }
    }
  )
);

// Facebook OAuth Strategy

// passport.use(
//   "facebookToken",
//   new FacebookTokenStrategy(
//     {
//       clientID: "757282805017535",
//       clientSecret: "f8d2f9e4c85bffbde724e081841f3fb0",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const existingUser = await User.findOne({ "facebook.id": profile.id });
//         if (existingUser) {
//           console.log("User already exist in our DB");
//           return done(null, existingUser);
//         }
//         console.log(
//           "User doesn't exist - We are creating a new one with Facebook Account"
//         );
//         const newUser = User({
//           method: "facebook",
//           facebook: {
//             id: profile.id,
//             email: profile.emails[0].value,
//           },
//         });

//         await newUser.save();
//         done(null, newUser);
//       } catch (error) {
//         done(error, false, error.message);
//       }
//     }
//   )
// );
