import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./AvatarReadyPlayerMe.scss";
import { ReactComponent as CloseIcon } from "../icons/Close.svg";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";
import { TextInputField } from "../input/TextInputField";
import { IconButton } from "../input/IconButton";
import { FullscreenLayout } from "../layout/FullscreenLayout";
import { Button } from "../input/Button";
import { Column } from "../layout/Column";
import { MediaGrid } from "./MediaGrid";

export function AvatarReadyPlayerMe({ onClose, browserRef }) {
  //   const intl = useIntl();

  const receiveMessage = event => {
    // Check if the received message is a string and a glb url
    // if not ignore it, and print details to the console
    if (typeof event.data === "string" && event.data.startsWith("https://") && event.data.endsWith(".glb")) {
      const url = event.data;

      console.log(`Avatar URL: ${url}`);

      // Load avatar to server an set it as users avatar. Then close the modal.

      //document.getElementById("avatarUrl").innerHTML = `Avatar URL: ${url}`;
      //document.getElementById("iframe").hidden = true;
    } else {
      console.log(`Received message from unknown source: ${event.data}`);
    }
  };
  window.addEventListener("message", receiveMessage, false);

  return (
    <FullscreenLayout
      headerLeft={
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      }
      headerCenter={
        <>
          {/* <StarIcon className={styles.favoriteIcon} /> */}
          <h3>
            <FormattedMessage id="avatar.readyplayerme.dialog.title" defaultMessage="Create an avatar" />
          </h3>
        </>
      }
      //   headerRight={}
    >
      {/* <Column padding center className={styles.content}> */}
      <Column grow padding center ref={browserRef} className={styles.content}>
        <iframe src="https://demo.readyplayer.me/" className={styles.iframe} allow="camera *; microphone *" />
      </Column>
    </FullscreenLayout>
  );
}

AvatarReadyPlayerMe.propTypes = {
  onClose: PropTypes.func,
  browserRef: PropTypes.any
};

AvatarReadyPlayerMe.defaultProps = {
  noResultsMessage: "No Results"
};
