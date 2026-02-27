const express = require('express');
const cors = require('cors');

require('dotenv').config();

const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth',authRoutes);

const PORT = process.env.PORT || 5000;

sequelize.sync()
  .then(() => {
    console.log('MySQL connected, tables ready')
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
  })
  .catch((err) => console.log('DB error:', err));
