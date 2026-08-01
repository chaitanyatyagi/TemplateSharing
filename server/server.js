const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const authRouter = require("./routes/authRouter.js");
const adminRouter = require("./routes/adminRouter.js");
const templateRouter = require("./routes/templateRouter.js");
const orderRouter = require("./routes/orderRouter.js");
const blogRouter = require("./routes/blogRouter.js");
const contactRouter = require("./routes/contactRouter.js");

dotenv.config({ path: "./.env" });
const NODE_ENV = process.env.NODE_ENV || "development";

// Load environment variables based on the environment
dotenv.config({
  path: NODE_ENV === "production" ? "./.env.production" : "./.env.development",
});

const PORT = 6300;
const DB = process.env.DATABASE;

// CORS configuration
const corsOptions = {
  origin:
    NODE_ENV === "production"
      ? process.env.CLIENT_URL
      : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  exposedHeaders: [],
  maxAge: 3600,
};

app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// Database connection options
const mongooseOptions = {
  autoIndex: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  minPoolSize: 3,
};

mongoose.set("strictQuery", true);

mongoose.connect(DB, mongooseOptions).then(() => {
  console.log("Database Connected !");
}).catch((error) => {
  console.error("Database connection failed:", error.message);
});

mongoose.connection.on("error", (error) => {
  console.log(error);
});

// Serve static files in production
// if (NODE_ENV === "production") {
//     const buildPath = path.join(__dirname, "../client/build");
//     app.use(express.static(buildPath));

//     app.get("*", (req, res) => {
//         res.sendFile(path.join(buildPath, "index.html"));
//     });
// } else {
//     app.get("/", (req, res) => {
//         res.send("Development Server Running");
//     });
// }

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/template", templateRouter);
app.use("/api/order", orderRouter);
app.use("/api/blog", blogRouter);
app.use("/api/contact", contactRouter);
app.all("/*path", (req, res) => {
  res.status(404).json({
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Bind to loopback only: the API is reached through the nginx reverse proxy in
// production (and via localhost in dev), so it must not be exposed on the public
// interface. Mirrors how the other services on the host bind.
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server is running on ${PORT} port in ${NODE_ENV} mode`);
});
