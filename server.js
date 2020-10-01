require("dotenv").config()
let express = require("express")
let bodyParser = require("body-parser")
let app = express()

let http = require("http").Server(app)
let io = require("socket.io")(http)
let mongoose = require("mongoose")

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

user = process.env.user
password = process.env.password
let dbUrl =
  "mongodb+srv://" +
  user +
  ":" +
  password +
  "@cluster0.b7xsa.mongodb.net/messages?retryWrites=true&w=majority"

let Message = mongoose.model("Message", {
  name: String,
  message: String
})

app.get("/messages", (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages)
  })
})

app.post("/messages", async (req, res) => {

  try {
    let message = new Message(req.body)
    await message.save()

    let censored = await Message.findOne({message:'badword'})
    if (censored){
      console.log("Censored: ", censored)
      await Message.deleteOne({_id:censored._id})
      }
    else
      io.emit("message", req.body)
  
    res.sendStatus(200)
    
  } catch (error) {
    res.sendStatus(500)
    console.log("Error", error)
  } finally {
    console.log('Message post called')
  }
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

let server = http.listen(3000, () => {
  console.log("Server is listening on port", server.address().port)
})
