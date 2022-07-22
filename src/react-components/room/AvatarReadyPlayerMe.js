import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./AvatarReadyPlayerMe.scss";
import { FormattedMessage } from "react-intl";
import { BackButton } from "../input/BackButton";
import { FullscreenLayout } from "../layout/FullscreenLayout";
import { Column } from "../layout/Column";
import { proxiedUrlFor } from "../../utils/media-url-utils";

export function AvatarReadyPlayerMe({ onClose, closeMediaBrowser, goBackToMediaBrowser = true }) {
  const iframeURL = "https://farvel.readyplayer.me";

  const close = useCallback(() => {
      if (!goBackToMediaBrowser) {
        closeMediaBrowser();
      }
      onClose();
    },
    [onClose, closeMediaBrowser, goBackToMediaBrowser]
  );

  const onSuccess = useCallback(
    ({ url }) => {
      // maybe using the scene like that does not work?
      const store = window.APP.store;
      const scene = document.querySelector("a-scene");

      store.update({ profile: { ...store.state.profile, ...{ avatarId: url } } });
      scene.emit("avatar_updated");
      close();
    },
    [close]
  );

  useEffect(
    () => {
      function receiveMessage(event) {
        // Check if the received message is a string and a glb url
        // if not ignore it, and print details to the console
        if (typeof event.data === "string" && event.data.startsWith("https://") && event.data.endsWith(".glb")) {
          const url = proxiedUrlFor(event.data + "?v=" + new Date().getTime()); // add a timestamp to the url to prevent caching
          onSuccess({ url });
        } else {
          console.warn(`Received message from unknown source: ${event.data}`);
        }
      }
      window.addEventListener("message", receiveMessage, false);

      return () => {
        window.removeEventListener("message", receiveMessage, false);
      };
    },
    [onSuccess]
  );

  return (
    <FullscreenLayout
      headerLeft={<BackButton onClick={close} />}
      headerCenter={
        <>
          <h3>
            <FormattedMessage id="avatar.readyplayerme.dialog.title" defaultMessage="Create an avatar" />
          </h3>
        </>
      }
      //   headerRight={}
    >
      <Column grow padding center className={styles.content}>
        <iframe src={iframeURL} className={styles.iframe} allow="camera *; microphone *" />
      </Column>
    </FullscreenLayout>
  );
}

AvatarReadyPlayerMe.propTypes = {
  onClose: PropTypes.func,
  closeMediaBrowser: PropTypes.func,
  goBackToMediaBrowser: PropTypes.bool
};

AvatarReadyPlayerMe.defaultProps = {
  noResultsMessage: "No Results"
};
