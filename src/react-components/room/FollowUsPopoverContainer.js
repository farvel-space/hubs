import React, { useEffect, useState } from "react";
import { ReactComponent as FacebookIcon } from "../icons/SocialiconsFacebook.svg";
import { ReactComponent as TwitterIcon } from "../icons/SocialiconsTwitter.svg";
import { ReactComponent as InstagramIcon } from "../icons/SocialiconsInstagram.svg";
import { ReactComponent as LinkedinIcon } from "../icons/SocialiconsLinkedin.svg";
import { ReactComponent as YoutubeIcon } from "../icons/SocialiconsYoutube.svg";
import { ReactComponent as HomeIcon } from "../icons/Home.svg";
import { ReactComponent as InviteIcon } from "../icons/Invite.svg";

import { FollowUsPopoverButton } from "./FollowUsPopover";
import { FormattedMessage } from "react-intl";

export function FollowUsPopoverContainer() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    function updateItems() {
      const nextItems = [
        {
          id: "instagram",
          icon: InstagramIcon,
          color: "accent2",
          label: <FormattedMessage id="followus-popover.item-type.instagram" defaultMessage="Instagram" />,
          onSelect: () => {
            window.open("https://www.instagram.com/abschiedsraum.farvel", "_blank");
          }
        },
        {
          id: "facebook",
          icon: FacebookIcon,
          color: "accent2",
          label: <FormattedMessage id="followus-popover.item-type.facebook" defaultMessage="Facebook" />,
          onSelect: () => {
            window.open("https://www.facebook.com/abschiedsraum.farvel", "_blank");
          }
        },
        {
          id: "linkedin",
          icon: LinkedinIcon,
          color: "accent2",
          label: <FormattedMessage id="followus-popover.item-type.linkedin" defaultMessage="LinkedIn" />,
          onSelect: () => {
            window.open("https://www.linkedin.com/company/farvel-space", "_blank");
          }
        },
        {
          id: "twitter",
          icon: TwitterIcon,
          color: "accent2",
          label: <FormattedMessage id="followus-popover.item-type.twitter" defaultMessage="Twitter" />,
          onSelect: () => {
            window.open("hhttps://twitter.com/farvel_space", "_blank");
          }
        },
        {
          id: "youtube",
          icon: YoutubeIcon,
          color: "accent2",
          label: <FormattedMessage id="followus-popover.item-type.youtube" defaultMessage="YouTube" />,
          onSelect: () => {
            window.open("https://farvel.space", "_blank");
          }
        },
        {
          id: "website",
          icon: HomeIcon,
          color: "accent2",
          label: <FormattedMessage id="followus-popover.item-type.website" defaultMessage="Website" />,
          onSelect: () => {
            window.open("https://farvel.space", "_blank");
          }
        },
        {
          id: "newsletter",
          icon: InviteIcon,
          color: "accent2",
          label: <FormattedMessage id="followus-popover.item-type.newsletter" defaultMessage="Newsletter" />,
          onSelect: () => {
            window.open("https://farvel.space/#newsletter", "_blank");
          }
        }
      ];

      setItems(nextItems);
    }

    updateItems();

    return () => {};
  }, []);

  return <FollowUsPopoverButton items={items} />;
}

FollowUsPopoverContainer.propTypes = {};
