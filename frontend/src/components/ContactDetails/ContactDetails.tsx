import "./ContactDetails.css";
import LinkICon from "../../assets/icons/external-link.svg?react";

interface ContactConfig {
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  label: string;
  item: string;
  isLink?: boolean;
}
interface IProps {
  contacts: ContactConfig[];
}

const openLink = (link: string) => {
  if (!link) return;

  const formattedLink = link.startsWith("http") ? link : `https://${link}`;

  window.open(formattedLink, "_blank", "noopener,noreferrer");
};

const ContactDetails = (props: IProps) => {
  return (
    <div className="contact-details">
      <div className="contact-details-header">CONTACT DETAILS</div>
      <div className="contact-details-content-container">
        {props.contacts.map((prop, index) => {
          const Icon = prop.icon;
          return (
            <div className="contact-details-content" key={index}>
              <div className="contact-details-icon-container">
                {<Icon className="contact-details-icon" />}
              </div>
              <div className="contact-details-info">
                <div className="contact-details-label">{prop.label}</div>
                <div className="contact-details-item">
                  {prop.isLink && prop.item ? (
                    <div
                      className="contact-details-item-link"
                      onClick={() => prop.item && openLink(prop.item)}
                      title={prop.item}
                    >
                      {prop.item}
                    </div>
                  ) : prop.item ? (
                    prop.item
                  ) : (
                    <p className="contact-details-empty">Not provided</p>
                  )}
                </div>
              </div>
              {prop.isLink && prop.item && (
                <LinkICon
                  className="contact-details-link-icon"
                  onClick={() => openLink(prop.item)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContactDetails;
