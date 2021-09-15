const cors = require('cors');
const express = require("express");
const app = express();
app.use(cors());
app.options('*', cors());
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const Database = require("@replit/database")
const db = new Database()
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
  db.set("room_"+req.query.id, "online").then(()=>{
  res.render("room", { roomId: req.query.id, userType: req.query.user,agent: req.query.agentid });
  });
});

app.get("/allrooms", (req, res) => {
  all_ks=[]
  db.list("room_").then(keys => {
  res.render("available", { avail_rooms: keys, agent: req.query.agentid  });});
});


app.post("/claims", (req, res) => {
  // console.log(req.body);
  db.set(req.body.id, req.body)
  .then(()=>{
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(res.body));
  });  
});

app.get("/claim/:id", (req, res) => {
  db.get(req.params.id).then(value => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(value));
  });
});

app.get("/claim/:id/delete", (req, res) => {
  
    db.delete(req.params.id).then(() => {console.log('sucess '+rid)});
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({success:true}));
});


app.get("/purge", (req, res) => {
  rid=req.query.id
  if (rid==null){
  db.list("room_").then(keys => {keys.forEach(key => {db.delete(key);})});
  }
  else{
    console.log(rid);
    db.delete("room_"+rid).then(() => {console.log('sucess '+rid)});
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

server.listen(process.env.PORT || 3333);
