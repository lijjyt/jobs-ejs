const express = require("express");
require("express-async-errors");
const flash = require("connect-flash")

const csrf = require("csurf");

const auth = require("./middleware/auth");
const secretWordRouter = require("./routes/secretWord");
const cookieParser = require("cookie-parser");
const notesRouter = require('./routes/notes')
const methodOverride = require("method-override");




const app = express();

app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true }));



require("dotenv").config(); // to load the .env file into the process.env object

app.use(cookieParser(process.env.SESSION_SECRET));

const session = require("express-session");
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

const MongoDBStore = require("connect-mongodb-session")(session);
const url = process.env.MONGO_URI;

const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: url,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

const sessionParms = {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: { secure: false, sameSite: "strict" },
  };

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParms.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionParms));

app.use(require("connect-flash")());

const passport = require("passport");
const passportInit = require("./passport/passportInit");

passportInit();
app.use(passport.initialize());
app.use(passport.session());

app.use(require("./middleware/storeLocals"));

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));


app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.urlencoded({ extended: false }));

let csrf_development_mode = true;

if (app.get("env") === "production") {
  csrf_development_mode = false;
  app.set("trust proxy", 1);
}



const csrfProtection = csrf({cookie: true});

app.use(csrfProtection);

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  });
  

app.get("/", (req, res) => {
  res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));

// secret word handling
//let secretWord = "syzygy";


app.use('/notes', auth, notesRouter)


app.use("/secretWord", auth, secretWordRouter);



app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send(err.message);
});

const port = process.env.PORT || 3000;


const start = async () => {
  try {
    await require("./db/connect")(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();