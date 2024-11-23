require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");


const app = express();
const PORT = process.env.PORT || 3001;
const mongoURI = process.env.MONGO_URI;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:3000', // allow frontend to access backend
  credentials: true, // allow cookies to be sent along with the request
}));

// MongoDB Client setup
const client = new MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let usersCollection;
let postsCollection;

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db("moodyApp");
    usersCollection = db.collection("users");
    postsCollection = db.collection("posts"); // Add posts collection
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

// Passport configuration
passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await usersCollection.findOne({ email });
      if (!user) return done(null, false, { message: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: "Incorrect password" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Welcome to the Moody App API!");
});

// Authentication routes
app.post("/api/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { firstName, lastName, email, password: hashedPassword };
    await usersCollection.insertOne(newUser);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err });
  }
});

app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Login successful", user });
    });
  })(req, res, next);
});

app.get("/api/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Error logging out" });
    res.status(200).json({ message: "Logout successful" });
  });
});

app.get("/api/check-auth", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ user: req.user });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// Profile Routes
app.get("/api/profile", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const user = await usersCollection.findOne({ _id: new ObjectId(req.user._id) });
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ message: "Error fetching profile", error: err });
    }
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.put("/api/profile", async (req, res) => {
  if (req.isAuthenticated()) {
    const { firstName, lastName, email } = req.body;
    try {
      await usersCollection.updateOne(
        { _id: new ObjectId(req.user._id) },
        { $set: { firstName, lastName, email } }
      );
      res.status(200).json({ message: "Profile updated successfully" });
    } catch (err) {
      res.status(500).json({ message: "Error updating profile", error: err });
    }
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// Posts Routes
app.post("/api/posts", async (req, res) => {
  if (req.isAuthenticated()) {
    const { title, content } = req.body;
    try {
      const newPost = { userId: req.user._id, title, content, date: new Date() };
      await postsCollection.insertOne(newPost);
      res.status(201).json({ message: "Post created successfully" });
    } catch (err) {
      res.status(500).json({ message: "Error creating post", error: err });
    }
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    const posts = await postsCollection.find({ userId: req.user ? new ObjectId(req.user._id) : null }).toArray();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching posts", error: err });
  }
});

// Connect to the database and start the server
connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
