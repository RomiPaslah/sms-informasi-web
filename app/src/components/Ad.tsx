import { useEffect } from 'react';
import { useSiteContent } from '@/context/SiteContentContext';
import type { AdSettings } from '@/types';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function Ad({ position }: { position: keyof AdSettings['adPositions'] }) {
  const { adSettings } = useSiteContent();

  useEffect(() => {
    if (adSettings.enabled && adSettings.adType === 'adsense' && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [adSettings]);

  if (!adSettings.enabled || !adSettings.adPositions[position as keyof typeof adSettings.adPositions]) {
    return null;
  }

  if (adSettings.adType === 'adsense' && adSettings.adsensePublisherId) {
    return (
      <div className="ad-container my-4">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={`ca-${adSettings.adsensePublisherId}`}
          data-ad-slot="1234567890" // Placeholder slot ID
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  if (adSettings.adType === 'custom' && adSettings.customAdHtml) {
    return (
      <div
        className="ad-container my-4"
        dangerouslySetInnerHTML={{ __html: adSettings.customAdHtml }}
      />
    );
  }

  return null;
}