import { useSiteContent } from '@/context/SiteContentContext';
import type { ContentAd } from '@/types';

interface AdDisplayProps {
  position: 'header' | 'sidebar' | 'betweenContent' | 'footer';
  className?: string;
}

export function Ad({ position, className = '' }: AdDisplayProps) {
  const { adSettings } = useSiteContent();

  if (!adSettings?.enabled) return null;

  const positionConfig = adSettings.positions?.[position];
  if (!positionConfig?.enabled) return null;

  // Filter ads that are enabled and assigned to this position
  const adsForPosition = adSettings.ads?.filter(
    (ad: ContentAd) => ad.enabled && ad.positions?.includes(position)
  ) || [];

  if (adsForPosition.length === 0) return null;

  return (
    <div
      className={`overflow-hidden rounded-lg ${className}`}
      style={{
        width: positionConfig.width || '100%',
        maxHeight: positionConfig.maxHeight || 'auto'
      }}
    >
      <div className="space-y-2">
        {adsForPosition.map((ad: ContentAd) => (
          <a
            key={ad.id}
            href={ad.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block group overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 hover:shadow-md transition-shadow"
            style={{
              width: ad.width || '100%',
              height: ad.height || 'auto'
            }}
          >
            {ad.image && (
              <div className="relative overflow-hidden h-40">
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            )}
            <div className="p-3">
              {ad.title && (
                <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">
                  {ad.title}
                </h3>
              )}
              {ad.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {ad.description}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

  return null;
}