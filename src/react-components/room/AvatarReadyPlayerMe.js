import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./AvatarReadyPlayerMe.scss";
import { FormattedMessage } from "react-intl";
import { BackButton } from "../input/BackButton";
import { CloseButton } from "../input/CloseButton";
import { Button } from "../input/Button";
import { FullscreenLayout } from "../layout/FullscreenLayout";
import { Column } from "../layout/Column";
import { proxiedUrlFor } from "../../utils/media-url-utils";

export function AvatarReadyPlayerMe({ onClose, closeMediaBrowser, isIndependentDialog = true }) {
  const iframeURL = "https://farvel.readyplayer.me";

  const closeBack = useCallback(
    (evt, isSuccess = false) => {
      console.log("closeBack");
      console.log("isIndependentDialog", isIndependentDialog);
      console.log("isSuccess", isSuccess);
      if (!isIndependentDialog && isSuccess) {
        console.log("closeMediaBrowser");
        closeMediaBrowser();
      }
      onClose();
    },
    [onClose, closeMediaBrowser, isIndependentDialog]
  );

  const onSuccess = useCallback(
    ({ url }) => {
      // maybe using the scene like that does not work?
      const store = window.APP.store;
      const scene = document.querySelector("a-scene");

      store.update({ profile: { ...store.state.profile, ...{ avatarId: url } } });
      scene.emit("avatar_updated");
      closeBack(null, true);
    },
    [closeBack]
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
      headerLeft={isIndependentDialog ? <CloseButton onClick={closeBack} /> : <BackButton onClick={closeBack} />}
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
        <p>
          <FormattedMessage
            id="avatar.readyplayerme.dialog.notice.infoTerms"
            defaultMessage="We will now redirect you to ReadyPlayerMe for the creation of your avatar. Here you can find RPM's <a1>privacy policy</a1> and <a2>terms of use</a2>. After creating the avatar, the avatar data will be delivered back to farvel."
            values={{
              // eslint-disable-next-line react/display-name
              a1: chunks => (
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  className={styles.link}
                  href="https://readyplayer.me/privacy"
                >
                  {chunks}
                </a>
              ),
              // eslint-disable-next-line react/display-name
              a2: chunks => (
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  className={styles.link}
                  href="https://readyplayer.me/terms"
                >
                  {chunks}
                </a>
              )
            }}
          />
        </p>
        <p>
          <FormattedMessage
            id="avatar.readyplayerme.dialog.notice.infoAccept"
            defaultMessage="If you click the &quot;Yes, agree&quot; button, then you agree to it."
          />
        </p>
        <Button as="a" preset="primary" href="">
          <FormattedMessage id="avatar.readyplayerme.dialog.notice.acceptBtn" defaultMessage="Yes, agree." />
        </Button>
      </Column>
      {/* <Column grow padding center className={styles.content}>
        <iframe src={iframeURL} className={styles.iframe} allow="camera *; microphone *" />
      </Column> */}
    </FullscreenLayout>
  );
}

AvatarReadyPlayerMe.propTypes = {
  onClose: PropTypes.func,
  closeMediaBrowser: PropTypes.func,
  isIndependentDialog: PropTypes.bool
};

AvatarReadyPlayerMe.defaultProps = {
  noResultsMessage: "No Results"
};
