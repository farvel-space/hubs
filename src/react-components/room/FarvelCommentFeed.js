import React from "react";
import { CommentDisplay } from "./CommentDisplay.js";

class FarvelCommentFeed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataMap: [],
      role: sockSys.myUser.role
    };
  }

  componentDidMount() {
    //set up reflector EL
    let dataMap = sockSys.dataMap;
    dataMap.sort((a, b) => {
      return b.dateCreated - a.dateCreated;
    });
    this.setState({ dataMap });

    document.addEventListener("received-reflector", () => {
      let dataMap = { ...this.state.dataMap };
      dataMap = sockSys.dataMap;
      dataMap.sort((a, b) => {
        return b.dateCreated - a.dateCreated;
      });
      this.setState({ dataMap });
    });
  }

  render() {
    return (
      <>
        {this.props.approved && (
          <div>
            {this.state.dataMap
              .filter(
                e =>
                  e.state === "approved" &&
                  (e.objectID === this.props.object.id || e.objectID === this.props.object.object3D.name)
              )
              .map(key => (
                <CommentDisplay key={key._id} comment={key} isAdmin={this.state.role} />
              ))}
          </div>
        )}
        {!this.props.approved && this.state.role === "admin" && (
          <div>
            {this.state.dataMap
              .filter(
                e =>
                  e.state === "unapproved" &&
                  (e.objectID === this.props.object.id || e.objectID === this.props.object.object3D.name)
              )
              .map(key => (
                <CommentDisplay key={key._id} comment={key} isAdmin={"unapprovedAdmin"} />
              ))}
          </div>
        )}
      </>
    );
  }
}

export default FarvelCommentFeed;
