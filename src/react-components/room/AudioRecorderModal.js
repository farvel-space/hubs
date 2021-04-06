import React, { useCallback } from "react";
import { useIntl, defineMessages, FormattedMessage } from "react-intl";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { CloseButton } from "../input/CloseButton";
import { Button } from "../input/Button";
import { TextInputField } from "../input/TextInputField";
import { Column } from "../layout/Column";
import { useAudioRecorder } from "./useAudioRecorder";

import ducky from "../../assets/models/DuckyMesh.glb";

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

export function AudioRecorderModal({ scene, onClose }) {
  const onSubmit = useCallback(
    ({ file, url }) => {
      scene.emit("add_media", (file && file.length > 0 && file[0]) || url || ducky);
      onClose();
    },
    [scene, onClose]
  );

  const intl = useIntl();
  const [record, audioSrc] = useAudioRecorder();

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

        {/* TODO: Placeholder audio player */}
        <audio controls src={audioSrc}></audio>

        <Button as="a" preset="basic" onClick={record} rel="noopener noreferrer">
          {intl.formatMessage(audioRecordingMessages.startrecording)}
        </Button>
        <Button type="submit" preset="accept">
          {intl.formatMessage(audioRecordingMessages.submit)}
        </Button>
        {/* 
        <Button type="submit" preset="accept">
          <FormattedMessage id="object-url-modal.create-object-button" defaultMessage="Create Object" />
        </Button>
         */}
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
