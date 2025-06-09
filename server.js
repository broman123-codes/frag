const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup lock file
const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
const lockFilePath = path.join(tmpDir, 'app.lock');

if (fs.existsSync(lockFilePath)) {
  const pid = parseInt(fs.readFileSync(lockFilePath, 'utf8'), 10);
  try {
    process.kill(pid, 0);
    console.error(`Another instance is already running (PID: ${pid})`);
    process.exit(1);
  } catch (err) {
    console.log('Removing stale lock file.');
    fs.unlinkSync(lockFilePath);
  }
}

fs.writeFileSync(lockFilePath, process.pid.toString(), 'utf8');

process.on('exit', () => fs.existsSync(lockFilePath) && fs.unlinkSync(lockFilePath));
process.on('SIGINT', () => process.exit());
process.on('SIGTERM', () => process.exit());

// Serve static files from root, css/, and js/
app.use(express.static(__dirname));

// Optional: redirect unknown paths to index.html or a 404 page
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, () => {
  console.log(`Static site is running at http://localhost:${PORT}`);
});
