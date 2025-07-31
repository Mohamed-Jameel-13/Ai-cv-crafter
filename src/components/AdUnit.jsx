import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const AdUnit = ({
  adClient = "ca-pub-6898487400711375",
  adSlot = "6370388025",
  style = { display: "block" },
  format = "auto",
  fullWidthResponsive = "true",
  className = "",
}) => {
  const adRef = useRef(null);

  useEffect(() => {
    // Only add the script if it hasn't been added yet
    if (!window.adsbygoogle && !document.getElementById("adsbygoogle-js")) {
      const script = document.createElement("script");
      script.id = "adsbygoogle-js";
      script.async = true;
      script.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
        adClient;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
    }
    // Try to push adsbygoogle after script is loaded
    const pushAd = () => {
      try {
        if (window.adsbygoogle && adRef.current) {
          window.adsbygoogle.push({});
        }
      } catch (e) {
        // Ignore errors
      }
    };
    // Wait a bit for the script to load
    setTimeout(pushAd, 500);
  }, [adClient]);

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      data-ad-format={format}
      data-full-width-responsive={fullWidthResponsive}
      ref={adRef}
    />
  );
};

AdUnit.propTypes = {
  adClient: PropTypes.string,
  adSlot: PropTypes.string,
  style: PropTypes.object,
  format: PropTypes.string,
  fullWidthResponsive: PropTypes.string,
  className: PropTypes.string,
};

export default AdUnit; 