const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

let users = [];
let exercises = [];

const generateId = () => Math.random().toString(36).substring(2, 10);

app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const _id = generateId();
  const newUser = { username, _id };
  users.push(newUser);
  res.json(newUser);
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.json({ error: 'User not found' });

  const { description, duration, date } = req.body;
  const exerciseDate = date ? new Date(date) : new Date();
  const exercise = {
    _id: user._id,
    username: user.username,
    description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString()
  };

  exercises.push({
    userId: user._id,
    description,
    duration: parseInt(duration),
    date: exerciseDate
  });

  res.json(exercise);
});

app.get('/api/users/:_id/logs', (req, res) => {
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.json({ error: 'User not found' });

  let log = exercises.filter(e => e.userId === user._id);

  const { from, to, limit } = req.query;

  if (from) {
    const fromDate = new Date(from);
    log = log.filter(e => e.date >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    log = log.filter(e => e.date <= toDate);
  }

  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    _id: user._id,
    count: log.length,
    log: log.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString()
    }))
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
