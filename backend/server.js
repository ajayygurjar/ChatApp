const express = require("express");
const cors = require("cors");
const http = require("http");

require("dotenv").config();

const sequelize = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const groupRoutes = require("./routes/groupRoutes");
const initSocket = require("./socket-io/index");
const { startArchiveJob } = require("./jobs/archiveMessages");

require("./models/index");

const app = express();
const server = http.createServer(app);

initSocket(server, app);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/groups", groupRoutes);

const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("MySQL connected, tables ready");
    startArchiveJob();
    server.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`),
    );
  })
  .catch((err) => console.log("DB error:", err));
