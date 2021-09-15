const cors = require('cors');
const express = require("express");
const app = express();
app.use(cors());
app.options('*', cors());
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
//const Database = require("@replit/database")
const JSONdb = require('simple-json-db');
// const db = new Database()
const room_db = new JSONdb('room.json');

const img_db = new JSONdb('img_save.json');

room_db.JSON({});
img_db.JSON({});

app.set("view engine", "ejs");
// app.use(express.json()) 
app.use(express.json({limit: '50mb'}));
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/call/?user=client&id=${uuidv4()}`);
});

app.get("/call", (req, res) => {
  room_db.set(req.query.id, "online");
  res.render("room", { roomId: req.query.id, userType: req.query.user,agent: req.query.agentid });
});

app.get("/allrooms", (req, res) => {
  res.render("available", { avail_rooms: Object.keys(room_db.JSON()), agent: req.query.agentid  });
});


app.post("/claims", (req, res) => {
  // console.log(req.body);
  img_db.set(req.body.id, req.body);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(res.body));

});

app.get("/claim/:id", (req, res) => {
  
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(img_db.get(req.params.id)));
});

app.get("/claim/:id/delete", (req, res) => {
  
    img_db.delete(req.params.id);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({success:true}));
});


app.get("/purge", (req, res) => {
  rid=req.query.id
  if (rid==null){
  room_db.JSON({});
  }
  else{
    console.log(rid);
    room_db.delete(rid);
  }
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ inited: rid }));
});



io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("reply", message, userName);
    });
    socket.on("disconnected", () => {
      io.to(roomId).emit("disconnected");
    });
  });
});

server.listen(process.env.PORT || 8080);
