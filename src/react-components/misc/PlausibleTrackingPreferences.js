import React, { useCallback, useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { Button } from "../input/Button";
import { Column } from "../layout/Column";

export function PlausibleTrackingPreferences() {
  const [isIgnored, setIsIgnored] = useState(false);

  const onToggleBtnClicked = useCallback(
    () => {
      const newVal = !isIgnored;
      setIsIgnored(newVal);
      console.log("isIgnored", newVal);
      newVal ? (window.localStorage.plausible_ignore = "true") : delete window.localStorage.plausible_ignore;
      console.log("window.localStorage.plausible_ignore", window.localStorage.plausible_ignore);
    },
    [setIsIgnored, isIgnored]
  );

  useEffect(
    () => {
      setIsIgnored(window.localStorage.plausible_ignore == "true");
      return () => {};
    },
    [setIsIgnored]
  );

  return (
    <div>
      <Column gap="xl">
        <p>
          <FormattedMessage
            id="plausible-tracking-preferences.info"
            defaultMessage="Click the button below to toggle your exclusion in Plausible for {appUrl}.&nbsp;"
            values={{
              appUrl: window.location.origin
            }}
          />
          {isIgnored ? (
            <FormattedMessage
              id="plausible-tracking-preferences.info.notTracked"
              defaultMessage="Your visits are  <b>not tracked</b>."
              values={{
                // eslint-disable-next-line react/display-name
                b: chunks => <b>{chunks}</b>
              }}
            />
          ) : (
            <FormattedMessage
              id="plausible-tracking-preferences.info.tracked"
              defaultMessage="Your visits are  <b>tracked</b>."
              values={{
                // eslint-disable-next-line react/display-name
                b: chunks => <b>{chunks}</b>
              }}
            />
          )}
        </p>
        <Button as="a" preset="accent4" onClick={onToggleBtnClicked} className="plausible-toggle-btn">
          {isIgnored ? (
            <FormattedMessage
              id="plausible-tracking-preferences.button.include"
              defaultMessage="Stop excluding my visits"
            />
          ) : (
            <FormattedMessage id="plausible-tracking-preferences.button.exclude" defaultMessage="Exclude my visits" />
          )}
        </Button>
      </Column>
    </div>
  );
}

PlausibleTrackingPreferences.propTypes = {};
