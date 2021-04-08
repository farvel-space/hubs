import React, { useCallback } from "react";
import { useIntl, defineMessages, FormattedMessage } from "react-intl";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { CloseButton } from "../input/CloseButton";
import { Button } from "../input/Button";
// import { TextInputField } from "../input/TextInputField";
import { Column } from "../layout/Column";
import { useAudioRecorder } from "./useAudioRecorder";
import { AudioRecorderPlayer } from "./AudioRecorderPlayer";
import { useForm } from "react-hook-form";


const audioRecordingMessages = defineMessages({
  submit: {
    id: "audio-recording-modal.recording.submit",
    defaultMessage: "Submit Recording"
  },
  description: {
    id: "audio-recording-modal.recording.description",
    defaultMessage: "Record und upload a voice message for others to hear. After recording you will be able to hear your message before submitting and therefore uploading it. You can re-record your message, as much as you want."
  },
  startrecording: {
    id: "audio-recording-modal.recording.start",
    defaultMessage: "Record"
  },
  stoprecording: {
    id: "audio-recording-modal.recording.stop",
    defaultMessage: "Stop"
  }
});

export function AudioRecorderModal({ scene, onClose }) {
  const intl = useIntl();
  const [record, isRecording, audioSrc, audioFile] = useAudioRecorder();
  const { handleSubmit } = useForm();
  const onSubmit = useCallback(
    () => {
      console.log("#1", audioFile);
      scene.emit("add_media", (audioFile.size > 0 && audioFile));
      console.log("#2");
      onClose();
      console.log("#3");
    },
    [scene, onClose, audioFile]
  );

  // Mute yourself 
  // scene.emit("action_mute")



  // const recordingBtn = () => {
  //   if (isRecording || !isRecording && audioSrc == '') {
  //     return intl.formatMessage(isRecording ? audioRecordingMessages.stoprecording : audioRecordingMessages.startrecording);
  //   } else {
  //     return intl.formatMessage(isRecording ? audioRecordingMessages.stoprecording : audioRecordingMessages.startrecording);
  //   }
  // };

  return (
    <Modal
      title={<FormattedMessage id="audio-recording-modal.title" defaultMessage="Submit Voice Message" />}
      beforeTitle={<CloseButton onClick={onClose} />}
    >
      {/* <Column padding center centerMd="both" grow>d */}
      <Column as="form" padding center onSubmit={handleSubmit(onSubmit)}>
        <p>{intl.formatMessage(audioRecordingMessages.description)}</p>

        {/* Adapted from AvatarSettingsContent.js */}
        {/*  
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
        */}

        <AudioRecorderPlayer isRecording={isRecording} audioSrc={audioSrc}></AudioRecorderPlayer>
        <Button preset={isRecording ? 'red' : 'basic'} onClick={() => {scene.emit("action_mute"); record();}} rel="noopener noreferrer">
          {intl.formatMessage(isRecording ? audioRecordingMessages.stoprecording : audioRecordingMessages.startrecording)}
        </Button>
        <Button type="submit" preset="accept">
          {intl.formatMessage(audioRecordingMessages.submit)}
        </Button>
      </Column>
    </Modal >
  );
}

AudioRecorderModal.propTypes = {
  onClose: PropTypes.func,
  scene: PropTypes.object.isRequired,
};
