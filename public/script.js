const socket = io("/",{secure: false});

const video_container = document.getElementById("video_div");
const pip_container = document.getElementById("pip__div");
var cap_vid=null;
const user = USER_TYPE;
const room_id = ROOM_ID;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

var cam_constraint = {
    audio: true,
    video: true,
  }

let myVideoStream;

if(USER_TYPE!='agent'){
  cam_constraint['video']={facingMode:'environment'}
}

// get_constraint = navigator.mediaDevices.enumerateDevices()
//   .then ( function (devices) {
//       // console.log(devices)
//       const videoDevices = devices.filter(device => device.kind === 'videoinput')
//       console.log(videoDevices)
//       if(USER_TYPE!='agent' && videoDevices.length >1){
//         cam_constraint['video']={facingMode:'environment'}
//       }

//       console.log(cam_constraint);

//       return cam_constraint;

//   });

// await constr();
// get_constraint.then((constraint)=>{
  // console.log(constraint)
navigator.mediaDevices
  .getUserMedia(cam_constraint)
  .then()
  .catch( cam_constraint['video']=true)
  .then((stream) => {
    myVideoStream = stream;
    const myVideo = document.createElement("video");
    addVideoStream(myVideo, stream, false);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      cap_vid=video;
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream, true);
      });
      call.on("close", () => {
        fetch("../purge/?id=ROOM_ID");
        video.remove();
        
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
      console.log(userId+' joined');
    });
  });
  // });

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream, true);
  });
};

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id, user);
});
const addVideoStream = (video, stream, pip) => {
  
  if(USER_TYPE=="agent"){pip=!pip;}
  // video = pip? pipView : videoView
  video.srcObject = stream;
  if(pip){
    video.className ='pipView';
    // video.width= 100;//pip_container.offsetWidth;
    // video.height= 300;//pip_container.offsetHeight;
    pip_container.appendChild(video);
  }
  else{
    video.className = 'videoView';
    video_container.appendChild(video);
  }
  video.addEventListener("loadedmetadata", () => {
    video.play();
   
  });
};



const disc = document.querySelector("#disconnect");

const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

deg="0"
rmcount=0

if(USER_TYPE=="agent"){
document.querySelector("#arUp").addEventListener("click", (e) => {
  socket.emit("message", "270");
});
document.querySelector("#arDown").addEventListener("click", (e) => {
  socket.emit("message", "90");
});
document.querySelector("#arLeft").addEventListener("click", (e) => {
  socket.emit("message", "180");
});
document.querySelector("#arRight").addEventListener("click", (e) => {
  socket.emit("message", "0");
});




const ss=document.getElementById('screenshot');
ss.addEventListener("click", (e) => {
  if(cap_vid!=null){
  var canvas = document.createElement('canvas');
  canvas.width = cap_vid.videoWidth;
  canvas.height = cap_vid.videoHeight;
  canvas.getContext('2d').drawImage(cap_vid, 0, 0, cap_vid.videoWidth, cap_vid.videoHeight);
  var ss_image = JSON.stringify(canvas.toDataURL('image/png', 0.5).split(',')[1]);
  // var ss_image = canvas.toBlob('image/png', 0.5);
  localStorage.setItem('ss_image',ss_image);

  var url = "https://video-chat-v1.kavishdhamija.repl.co/claims";

  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);

  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        console.log(xhr.status);
        console.log(xhr.responseText);
        disc.click();
    }};

  var data = `{
    "id":"${AGENT_ID}",
    "user_id":"${ROOM_ID}",
    "img":${ss_image}
  }`;

  xhr.send(data);

  console.log(data);
  // var DifferentWindow=window.open("http://13.64.169.215:8082/user/claim");
  // DifferentWindow.localStorage.setItem('ss_image',ss_image);
  // window.close();
  }
});

}
else{

  // const ar_canvas=document.getElementById('ar_canvas')
  const ar_canvas=document.getElementById('canvas-container')
  socket.on("reply", (message, userName) => {
    // console.log(message);
  ar_canvas.hidden=false;
  rmcount+=1
  ar_canvas.style.transform = "rotate(-"+deg+"deg)"
  deg=message
  ar_canvas.style.transform = "rotate("+deg+"deg)"
  setTimeout(function(){
    rmcount-=1
    if(rmcount==0){
      ar_canvas.hidden=true
    }
    },15000)
  });
}

socket.on("disconnected", (userId)=>{
    // remove video or add your code here
    console.log('purging');
    // myVideo.remove();
    peer.disconnect();
    // Simulate a mouse click:
    // window.location.href = "../thanks.html";
    
  if(USER_TYPE=="agent"){
   window.location = "http://13.64.169.215:8082/user/claim/?agentid="+AGENT_ID;
   }
   else{
    window.location.href = "../thanks.html";
   }
});

disc.addEventListener("click", (e) => {
  console.log('ending');
  socket.emit("disconnected");
  peer.disconnect();
  fetch("../purge/?id="+ROOM_ID).then((res)=>{console.log(res)});
   
  // myVideo.remove();

  
  if(USER_TYPE=="agent"){
  
   window.location = "http://13.64.169.215:8082/user/claim/?agentid="+AGENT_ID;}
   else{
    window.location.href = "../thanks.html";
   }
});


