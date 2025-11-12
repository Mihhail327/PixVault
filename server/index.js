const express = require('express');
const app = express();
const routes = require('./routes/app');
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PixVault backend running on port ${PORT}`);
});