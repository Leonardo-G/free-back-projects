require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const urls = [];

app.post('/api/shorturl', function(req, res) {
  const inputUrl = req.body.url;
  const parsedUrl = urlParser.parse(inputUrl);

  dns.lookup(parsedUrl.hostname, (err) => {
    if (err || !/^https?:\/\//.test(inputUrl)) {
      return res.json({ error: 'invalid url' });
    }

    const short_url = urls.length + 1;
    urls.push({ original_url: inputUrl, short_url });

    res.json({ original_url: inputUrl, short_url });
  });
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const short = parseInt(req.params.short_url);
  const found = urls.find(entry => entry.short_url === short);

  if (found) {
    res.redirect(found.original_url);
  } else {
    res.json({ error: 'No short URL found' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
