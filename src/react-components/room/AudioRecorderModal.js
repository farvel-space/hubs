import React from "react";
import { useIntl, defineMessages, FormattedMessage } from "react-intl";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { CloseButton } from "../input/CloseButton";
import { Button } from "../input/Button";
import { TextInputField } from "../input/TextInputField";
import { Column } from "../layout/Column";
import { useAudioRecorder } from "./useAudioRecorder";

const audioRecordingMessages = defineMessages({
  submit: {
    id: "audio-recording-modal.recording.submit",
    defaultMessage: "Submit Recording"
  },
  description: {
    id: "audio-recording-modal.recording.description",
    defaultMessage: "Hier sollte eine kurze Erklärung stehen."
  },
  startrecording: {
    id: "audio-recording-modal.recording.start",
    defaultMessage: "Record"
  }
});

export function AudioRecorderModal({ onClose }) {
  const intl = useIntl();
  const [record, audioSrc] = useAudioRecorder();

  // const recordings = history.map((step, move) => {
  //   const desc = move ?
  //     'Go to move #' + move :
  //     'Go to game start';
  //   return (
  //     <li key={move}>
  //       <button onClick={() => this.jumpTo(move)}>{desc}</button>
  //     </li>
  //   );
  // });

  return (
    <Modal
      title={<FormattedMessage id="audio-recording-modal.title" defaultMessage="Submit Audio Recording" />}
      beforeTitle={<CloseButton onClick={onClose} />}
    >
      <Column padding center centerMd="both" grow>
        <p>{intl.formatMessage(audioRecordingMessages.description)}</p>

        {/* Adapted from AvatarSettingsContent.js */}
        <TextInputField
          label={<FormattedMessage id="audio-recording-modal.recording-name" defaultMessage="Name of recording" />}
          // pattern={displayNamePattern}
          spellCheck="false"
          required
          description={
            <FormattedMessage
              id="audio-recording-modal.recording-name-description"
              defaultMessage="This identifies your own message in this 3D spaces and enables you and other to find specific messages."
            />
          }
        // ref={displayNameInputRef}
        />

        <audio controls src={audioSrc}></audio>

        <Button as="a" preset="basic" onClick={record} rel="noopener noreferrer">
          {intl.formatMessage(audioRecordingMessages.startrecording)}
        </Button>
        <Button as="a" preset="green" href="#" rel="noopener noreferrer"
          onClick={() =>
            console.log(audioElRef)
          }
        >
          {intl.formatMessage(audioRecordingMessages.submit)}
        </Button>
        {/* <Button as="a" preset="cancel" href={destinationUrl} rel="noopener noreferrer">
          {intl.formatMessage(confirmationMessages[reason])}
        </Button> */}
      </Column>
    </Modal >
  );
}

AudioRecorderModal.propTypes = {
  // reason: PropTypes.string,
  // destinationUrl: PropTypes.string,
  onClose: PropTypes.func,
  onRecordBtn: PropTypes.func,
};
