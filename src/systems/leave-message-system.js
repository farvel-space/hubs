import { addMedia } from "../utils/media-utils";
import { renderChatMessage } from "../react-components/chat-message";
import { ObjectContentOrigins } from "../object-types";

export class LeaveMessageSystem {
  constructor(scene) {
    this.scene = scene;
    this.isLeaveMessageManager = false;
  }

  setIsLeaveMessageManager = isLeaveMessageManager => {
    if (!this.scene.systems.permissions.canOrWillIfCreator("kick_users")) return;
    this.isLeaveMessageManager = isLeaveMessageManager;
  };

  handleLeaveMessage = async msgBody => {
    if (!this.scene.systems.permissions.canOrWillIfCreator("kick_users") || !this.isLeaveMessageManager) return;

    const msgScale = 1;
    const { name, message, objOffset, objRotation } = msgBody.data;
    let rndrMsg = message + "\n" + " - " + name;
    if (name == null) rndrMsg = message;

    // code snippet from src/react-components/chat-message.js:
    const [blob] = await renderChatMessage(rndrMsg, null, true);
    const msgFile = new File([blob], "leave-message.png", { type: "image/png" });

    // convert to degrees and round to 2 decimals
    const objRotDeg = {
      x: Math.round(objRotation._x * (180 / Math.PI) * 100) / 100,
      y: Math.round(objRotation._y * (180 / Math.PI) * 100) / 100,
      z: Math.round(objRotation._z * (180 / Math.PI) * 100) / 100
    };

    // code snippet from src/scene-entry-manager.js:
    const { entity } = addMedia(
      msgFile,
      "#interactable-media",
      ObjectContentOrigins.FILE,
      null,
      !(msgFile instanceof MediaStream),
      true,
      false
    );
    entity.setAttribute("media-loader", { playSoundEffect: true });
    entity.setAttribute("visible", true);
    entity.setAttribute("position", objOffset);
    entity.setAttribute("rotation", objRotDeg);
    entity.setAttribute("scale", { x: msgScale, y: msgScale });

    entity.addEventListener("media_resolved", ({ detail }) => {
      // if (!NAF.utils.isMine(entity) && !NAF.utils.takeOwnership(entity)) return;
      // setTimeout(() => {
      //   window.APP.pinningHelper.setPinned(entity, true);
      // }, 1000);

      NAF.utils.getNetworkedEntity(entity).then(networkedEl => {
        if (!NAF.utils.isMine(networkedEl) && !NAF.utils.takeOwnership(networkedEl)) return;
        window.APP.pinningHelper.setPinned(entity, true);
        console.log("LeaveMessageSystem: Pinned comment: " + rndrMsg);
      });
    });
  };
}
