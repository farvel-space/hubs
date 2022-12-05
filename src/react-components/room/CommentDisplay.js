import React from "react";
import PropTypes from "prop-types";
import styles from "./CommentDisplay.scss";
import socketSystem from "../../comment-system/socketSystem";
import { ReactComponent as DeleteButton } from "../icons/DeleteBut.svg";
import { ReactComponent as ApproveButton } from "../icons/ApproveBut.svg";
import { ReactComponent as DisapproveButton } from "../icons/DisapproveBut.svg";

export function CommentDisplay({ comment, isAdmin }) {
  console.log("comment display", comment);

  const date = new Date(comment.dateCreated);
  console.log(date);
  const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  const unApprove = () => {
    //console.log("unapproved", comment);
    comment.state = "unapproved";
    sockSys.adminEdit(comment);
  };

  const approve = () => {
    //console.log("approved", comment);
    comment.state = "approved";
    sockSys.adminEdit(comment);
  };

  const onDelete = () => {
    //console.log("deleted", comment);
    let answer = window.confirm("Delete this comment?");
    if (answer) {
      sockSys.adminDelete(comment);
    }
  };

  return (
    <div className={styles.commentDisplay}>
      <h5 className={styles.commentText}>"{comment.body}"</h5>
      <h5 className={styles.commentAttrText}>
        by {comment.attr} on {dateStr}
      </h5>
      {isAdmin === "admin" && (
        <div className={styles.buttonCont}>
          <button className={styles.adminButton} onClick={unApprove}>
            <DisapproveButton className="buttonIcon" />
          </button>
          <h5 className={styles.buttonLabel}>Disapprove</h5>
        </div>
      )}
      {isAdmin === "unapprovedAdmin" && (
        <div className={styles.buttonCont}>
          <button className={styles.adminButton} onClick={approve}>
            <ApproveButton className="buttonIcon" />
          </button>
          <h5 className={styles.buttonLabel}>Approve</h5>
          <button className={styles.adminButton} onClick={onDelete}>
            <DeleteButton className="buttonIcon" />
          </button>
          <h5 className={styles.buttonLabel}>Delete</h5>
        </div>
      )}
    </div>
  );
}

CommentDisplay.propTypes = {
  comment: PropTypes.object.isRequired,
  isAdmin: PropTypes.string
};
