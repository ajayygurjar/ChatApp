const express = require("express");
const cors = require("cors");

require("dotenv").config();

const sequelize = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require('./routes/userRoutes')    

require("./models/User");
require("./models/Message");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use('/api/users', userRoutes)          

const PORT = process.env.PORT || 5000;

sequelize
  .sync()
  .then(() => {
    console.log("MySQL connected, tables ready");
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`),
    );
  })
  .catch((err) => console.log("DB error:", err));
