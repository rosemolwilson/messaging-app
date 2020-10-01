require("dotenv").config()
var express = require("express")
var bodyParser = require("body-parser")
var app = express()

var http = require("http").Server(app)
var io = require("socket.io")(http)
var mongoose = require("mongoose")

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

user = process.env.user
password = process.env.password
var dbUrl =
  "mongodb+srv://" +
  user +
  ":" +
  password +
  "@cluster0.b7xsa.mongodb.net/messages?retryWrites=true&w=majority"

var Message = mongoose.model("Message", {
  name: String,
  message: String
})

app.get("/messages", (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages)
  })
})

app.post("/messages", (req, res) => {
  var message = new Message(req.body)

  message.save()
  .then(() => {
    console.log('Saved +')
    return Message.findOne({message:'badword'})
  })
  .then(censored => {
    if (censored){
      return Message.deleteOne({_id:censored.id})
    }
    io.emit("message", req.body)
    res.sendStatus(200)
  })
  .catch((err)=> {
    res.sendStatus(500)
    console.log("Error", err)
  })
})




io.on("connection", socket => {
  console.log("User connected.......")
})

mongoose.connect(
  dbUrl,
  { useNewUrlParser: true, useUnifiedTopology: true },
  err => {
    console.log("Mongodb connection", err)
  }
)

var server = http.listen(3000, () => {
  console.log("Server is listening on port", server.address().port)
})
