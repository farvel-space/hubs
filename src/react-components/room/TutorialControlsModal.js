import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { Button } from "../input/Button";
import styles from "./TutorialControlsModal.scss";
import { BackButton } from "../input/BackButton";
import { Column } from "../layout/Column";
import { FormattedMessage } from "react-intl";
import tutorialVideoMP4 from "../../assets/video/tutorial-controls.mp4";
import tutorialVideoWebM from "../../assets/video/tutorial-controls.webm";

export function TutorialControlsModal({ className, onBack, onContinue, ...rest }) {
  return (
    <Modal
      title={<FormattedMessage id="tutorial-controls-modal.title" defaultMessage="Tutorial" />}
      beforeTitle={<BackButton onClick={onBack} />}
      className={styles.tutorialControlsModal}
      {...rest}
    >
      <Column padding center className={styles.content}>
        <video playsInline controls autoPlay>
          <source src={tutorialVideoMP4} type="video/mp4" />
          <source src={tutorialVideoWebM} type="video/webm" />
        </video>
        <FormattedMessage
          id="tutorial-controls-modal.controls-overview-info"
          defaultMessage="Click onto the Controls button in the bottom bar for an overview of the controls, whenever you need to.{linebreak}"
          values={{ linebreak: <br /> }}
        />
        <Button preset="accept" onClick={onContinue}>
          <FormattedMessage id="tutorial-controls-modal.skip" defaultMessage="Skip" />
        </Button>
      </Column>
    </Modal>
  );
}

TutorialControlsModal.propTypes = {
  className: PropTypes.string,
  error: PropTypes.string,
  errorButtonLabel: PropTypes.string,
  onClickErrorButton: PropTypes.func,
  onBack: PropTypes.func
};
