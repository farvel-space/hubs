import React from "react";
import PropTypes from "prop-types";
import { RitualControlSidebar } from "./RitualControlSidebar";

export function RitualControlSidebarContainer({ onClose, scene }) {
  return <RitualControlSidebar onClose={onClose} scene={scene} />;
}

RitualControlSidebarContainer.propTypes = {
  onClose: PropTypes.func.isRequired,
  scene: PropTypes.object.isRequired
};
