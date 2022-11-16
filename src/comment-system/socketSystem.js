import io from "socket.io-client";

class socketSystem {
  constructor() {
    this.myUser = {
      role: null,
      socketMap: {},
      hubChannel: {}
    };
    this.initialized = false;
    this.serverDomain = "oyster-app-4a993.ondigitalocean.app";
    this.dataMap = [];
  }

  init() {
    window.APP.hubChannel.addEventListener("permissions_updated", () => {
      console.log("permissions updated farvel");
      this.loginChanged();
    });

    this.hubChannel = window.APP.hubChannel;

    //initialize
    this.initialized = true;
    this.myUser.socketMap = io("https://" + this.serverDomain + "/general", { transports: ["websocket"] });
    let generalClient = this.myUser.socketMap;

    //determine role
    if (this.hubChannel && this.hubChannel.canOrWillIfCreator("kick_users") && !AFRAME.utils.device.isMobileVR()) {
      this.myUser.role = "admin";
    } else {
      this.myUser.role = "guest";
    }

    //setup sockets
    generalClient.on("connect", () => {
      console.log("connected to socket server");
      let sceneURL = window.APP.hub.scene.url.substring(0, window.APP.hub.scene.url.lastIndexOf("/"));
      console.log("getting data for scene", sceneURL);
      generalClient.emit("getData", sceneURL);
    });

    generalClient.on("getDataResp", data => {
      console.log(data);
      data.forEach(e => {
        if (e.sceneURL !== window.APP.hub.scene.url.substring(0, window.APP.hub.scene.url.lastIndexOf("/"))) return;
        if (e.state === "approved") {
          this.dataMap.push(e);
        } else if (e.state === "unapproved" && this.myUser.role === "admin") {
          this.dataMap.push(e);
        }
      });
    });

    generalClient.on("reflector", data => {
      console.log(data);
      if (data.sceneURL !== window.APP.hub.scene.url.substring(0, window.APP.hub.scene.url.lastIndexOf("/"))) return;
      //remove the copy
      let copy = this.dataMap.filter(x => x._id === data._id);
      let index = this.dataMap.indexOf(copy[0]);
      if (index > -1) {
        this.dataMap.splice(index, 1);
      }
      if (data.deleted) return;
      //write the new data
      if (data.state === "approved") {
        this.dataMap.push(data);
      } else if (data.state === "unapproved" && this.myUser.role === "admin") {
        this.dataMap.push(data);
      }
    });
  }

  newComment(commentData) {
    //should only have objectID and body
    let displayName;
    //add date created
    commentData.dateCreated = Date.now();

    //add scene url
    commentData.sceneURL = window.APP.hub.scene.url.substring(0, window.APP.hub.scene.url.lastIndexOf("/"));

    //add state
    commentData.state = "unapproved";

    //add attr
    if (window.APP.entryManager.authChannel._signedIn) {
      displayName = JSON.parse(window.localStorage.___hubs_store).profile.displayName;
    } else {
      displayName = "anon";
    }
    commentData.attr = displayName;
    this.myUser.socketMap.emit("newComment", commentData);
  }

  adminEdit(commentData) {
    this.myUser.socketMap.emit("adminEdit", commentData);
  }

  adminDelete(commentData) {
    this.myUser.socketMap.emit("adminDelete", commentData);
  }

  regCheck() {
    this.dataMap = [];
    let sceneURL = window.APP.hub.scene.url.substring(0, window.APP.hub.scene.url.lastIndexOf("/"));
    this.myUser.socketMap.emit("getData", sceneURL);
  }

  sceneChanged() {
    this.dataMap = [];
    let sceneURL = window.APP.hub.scene.url.substring(0, window.APP.hub.scene.url.lastIndexOf("/"));
    this.myUser.socketMap.emit("getData", sceneURL);
  }

  loginChanged() {
    this.dataMap = [];
    if (this.hubChannel && this.hubChannel.canOrWillIfCreator("kick_users") && !AFRAME.utils.device.isMobileVR()) {
      this.myUser.role = "admin";
    } else {
      this.myUser.role = "guest";
    }
    let sceneURL = window.APP.hub.scene.url.substring(0, window.APP.hub.scene.url.lastIndexOf("/"));
    this.myUser.socketMap.emit("getData", sceneURL);
  }
}

export default socketSystem;
