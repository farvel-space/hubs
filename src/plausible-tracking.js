import React, { Component } from "react";
import ReactDOM from "react-dom";
import { WrappedIntlProvider } from "./react-components/wrapped-intl-provider";
import Store from "./storage/store";
import { PlausibleTrackingPreferences } from "./react-components/misc/PlausibleTrackingPreferences";

const store = new Store();
window.APP = { store };

import registerTelemetry from "./telemetry";
import "./react-components/styles/global.scss";
import "./assets/stylesheets/plausible-tracking.scss";
import { ThemeProvider } from "./react-components/styles/theme";

registerTelemetry("/plausible-tracking", "Plausible Tracking Preferences");

class PlausibleTrackingPage extends Component {
  render() {
    return (
      <WrappedIntlProvider>
        <ThemeProvider store={store}>
          <PlausibleTrackingPreferences />
        </ThemeProvider>
      </WrappedIntlProvider>
    );
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  ReactDOM.render(<PlausibleTrackingPage />, document.getElementById("ui-root"));
});
