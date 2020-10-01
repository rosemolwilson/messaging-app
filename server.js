require('dotenv').config();
var express = require("express");
var bodyParser = require("body-parser");
var app = express();

var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

user=process.env.user
password=process.env.password
var dbUrl = 'mongodb+srv://'+user+':'+password+'@cluster0.b7xsa.mongodb.net/<dbname>?retryWrites=true&w=majority'

var messages = [
  {
    name: "Lilly",
    message: "Hi"
  },
  {
    name: "Rose",
    message: "Hello"
  }
];

app.get("/messages", (req, res) => {
  res.send(messages);
});

app.post("/messages", (req, res) => {
  messages.push(req.body);
  io.emit('message', req.body)
  res.sendStatus(200);
})

io.on('connection', (socket) => {
    console.log("User connected.......")
})

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err) =>{
  console.log('Mongodb connection', err)
})

var server = http.listen(3000, () => {
  console.log("Server is listening on port", server.address().port);
});