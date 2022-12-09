import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { joinChildren } from "../misc/joinChildren";
import styles from "./ObjectMenu.scss";
import { IconButton } from "../input/IconButton";
import FarvelCommentFeed from "./FarvelCommentFeed.js";
import { ReactComponent as CloseIcon } from "../icons/Close.svg";
import { ReactComponent as ChevronBackIcon } from "../icons/ChevronBack.svg";
import { ReactComponent as ArrowBackIcon } from "../icons/ArrowBack.svg";
import { ReactComponent as ArrowForwardIcon } from "../icons/ArrowForward.svg";
import { ReactComponent as LightbulbIcon } from "../icons/Lightbulb.svg";
import { ReactComponent as LightbulbOutlineIcon } from "../icons/LightbulbOutline.svg";
import { ReactComponent as SendIcon } from "../icons/Send.svg";

export function ObjectMenuButton({ children, className, ...rest }) {
  return (
    <IconButton compactSm className={classNames(styles.objectMenuButton, className)} {...rest}>
      {children}
    </IconButton>
  );
}

ObjectMenuButton.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

export function ObjectMenu({
  children,
  title,
  onClose,
  onBack,
  onPrevObject,
  onNextObject,
  currentObjectIndex,
  objectCount,
  onToggleLights,
  lightsEnabled
}) {
  //farvel
  const newCommentSubmit = e => {
    e.preventDefault();
    //console.log("new comment submitted", e.target.elements[0].value);
    let comment;
    if (children.props.activeObject.el.id.length > 15) {
      //for items set at the spoke or blender level
      comment = {
        objectID: children.props.activeObject.el.object3D.name,
        body: e.target.elements[0].value
      };
    } else {
      //for items dragged and dropped
      comment = {
        objectID: children.props.activeObject.el.id,
        body: e.target.elements[0].value
      };
    }
    e.target.reset();
    sockSys.newComment(comment);
  };
  //farvel-end

  return (
    <>
      <IconButton className={styles.backButton} onClick={onBack}>
        <ChevronBackIcon width={24} height={24} />
      </IconButton>
      <IconButton className={styles.lightsButton} onClick={onToggleLights}>
        {lightsEnabled ? (
          <LightbulbOutlineIcon title="Turn Lights Off" width={24} height={24} />
        ) : (
          <LightbulbIcon title="Turn Lights On" width={24} height={24} />
        )}
      </IconButton>
      <div className={styles.objectMenuContainer}>
        <div className={styles.objectMenu}>
          <div className={styles.header}>
            <IconButton className={styles.closeButton} onClick={onClose}>
              <CloseIcon width={16} height={16} />
            </IconButton>
            <h5>{title}</h5>
            <IconButton className={styles.lightsHeaderButton} onClick={onToggleLights}>
              {lightsEnabled ? (
                <LightbulbOutlineIcon title="Turn Lights Off" width={16} height={16} />
              ) : (
                <LightbulbIcon title="Turn Lights On" width={16} height={16} />
              )}
            </IconButton>
          </div>
          <div className={styles.menu}>
            {joinChildren(children, () => (
              <div className={styles.separator} />
            ))}
          </div>
        </div>
        <div className={styles.pagination}>
          <IconButton onClick={onPrevObject}>
            <ArrowBackIcon width={24} height={24} />
          </IconButton>
          <p>
            {currentObjectIndex + 1}/{objectCount}
          </p>
          <IconButton onClick={onNextObject}>
            <ArrowForwardIcon width={24} height={24} />
          </IconButton>
        </div>
      </div>
      {/* farvel */}
      <div className={styles.objectMenuCommentContainer}>
        {sockSys.myUser.role === "admin" && (
          <div className={styles.objectMenuUnapprovedContainer}>
            <div className={styles.commentsHeader}>
              <h3>Unapproved Comments</h3>
              <hr className={styles.headingSpacer}></hr>
            </div>
            <div className={styles.commentsFeedCont}>
              <FarvelCommentFeed approved={false} object={children.props.activeObject.el} />
            </div>
          </div>
        )}
        <div className={styles.objectMenuApprovedContainer}>
          <div className={styles.commentsHeader}>
            {sockSys.myUser.role === "admin" && <h3>Approved Comments</h3>}
            {sockSys.myUser.role === "guest" && <h3>Comments</h3>}
            <hr className={styles.headingSpacer}></hr>
          </div>
          <div className={styles.commentsFeedCont}>
            <FarvelCommentFeed approved={true} object={children.props.activeObject.el} />
          </div>
          <div className={styles.newCommentContainer}>
            <form className={styles.newCommentForm} onSubmit={newCommentSubmit}>
              <input
                className={styles.commentFormText}
                placeholder="Write a new comment..."
                type="text"
                required
              ></input>
              <button className={styles.sendMessageBut} type="submit">
                <SendIcon className={styles.sendMessageIcon} />
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* farvel-end */}
    </>
  );
}

ObjectMenu.propTypes = {
  currentObjectIndex: PropTypes.number.isRequired,
  objectCount: PropTypes.number.isRequired,
  onPrevObject: PropTypes.func,
  onNextObject: PropTypes.func,
  children: PropTypes.node,
  title: PropTypes.node,
  onClose: PropTypes.func,
  onBack: PropTypes.func,
  onToggleLights: PropTypes.func,
  lightsEnabled: PropTypes.bool
};
