import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { CloseButton } from "../input/CloseButton";
import styles from "./ControlsOverviewModal.scss";
import { Column } from "../layout/Column";
import { useIntl, defineMessages, FormattedMessage } from "react-intl";

// const controlsOverviewMessages = defineMessages({
//   submit: {
//     id: "audio-recording-modal.recording.submit",
//     defaultMessage: "Submit Recording"
//   },
//   description: {
//     id: "audio-recording-modal.recording.description",
//     defaultMessage:
//       "Record und upload a voice message for others to hear. The environment is muted and others are not be able to hear you, while you have this dialog opened. After recording you will be able to hear your message before submitting and therefore uploading it. You can re-record your message, as much as you want."
//   },
//   startrecording: {
//     id: "audio-recording-modal.recording.start",
//     defaultMessage: "Record"
//   },
//   stoprecording: {
//     id: "audio-recording-modal.recording.stop",
//     defaultMessage: "Stop"
//   }
// });

export function ControlsOverviewModal({ onClose }) {
//   const intl = useIntl();

  return (
    <Modal
      title={<FormattedMessage id="controls-overview-modal.title" defaultMessage="Controls Overview" />}
      beforeTitle={<CloseButton onClick={onClose} />}
      className={styles.controlsOverviewModal}
    >
      <Column padding center className={styles.content}>
        <iframe src="https://farvel.space/en/app-controls-overview/" className={styles.iframe} />
        {/* <FormattedMessage
          id="tutorial-controls-modal.controls-overview-info"
          defaultMessage="Click onto the Controls button in the bottom bar for an overview of the controls, whenever you need to.{linebreak}"
          values={{ linebreak: <br /> }}
        /> */}
      </Column>
    </Modal>
  );
}

ControlsOverviewModal.propTypes = {
  onClose: PropTypes.func
};