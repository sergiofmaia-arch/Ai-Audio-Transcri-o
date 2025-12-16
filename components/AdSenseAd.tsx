import React, { useEffect } from 'react';

const AdSenseAd: React.FC = () => {
  useEffect(() => {
    try {
      // The AdSense script should be loaded in index.html.
      // This push initializes the ad unit.
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="my-8 text-center" aria-hidden="true">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1717889809276815" // Your publisher ID
        // IMPORTANT: Replace this with your own ad slot ID from your AdSense account
        data-ad-slot="1234567890" 
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdSenseAd;