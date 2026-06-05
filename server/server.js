require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const setupSocket = require('./src/config/socket');

const server = http.createServer(app);
const io = setupSocket(server);

app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`LIBU Connect server running on port ${PORT}`);
});
