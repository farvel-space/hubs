import io from "socket.io-client";

class socketSystem {
  constructor() {
    this.myUser = {
      role: null,
      socketMap: {}
    };
    this.serverDomain = "oyster-app-4a993.ondigitalocean.app";
  }

  init() {
    //determine role

    this.myUser.socketMap = io("https://" + this.serverDomain + "/general", { transports: ["websocket"] });

    //setup sockets
    generalClient.on("connect", () => {
      console.log("connected to socket server");

      socket.emit("getData", sceneURL);
    });

    socket.on("getDataResp", data => {
      console.log(data);
    });

    socket.on("reflector", data => {
      console.log(data);
    });
  }

  newComment(commentData) {
    this.myUser.socketMap.emit("newComment", commentData);
  }

  adminEdit(commentData) {
    this.myUser.socketMap.emit("adminEdit", commentData);
  }
}

export default socketSystem;
