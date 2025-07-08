// src/app/dashboard/new-order/Map.tsx
'use client';

import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

type LatLng = { lat: number; lng: number };

interface MapComponentProps {
  center: LatLng;
  markerPosition: LatLng | null;
}

export function MapComponent({ center, markerPosition }: MapComponentProps) {
  return (
    <Map
      center={center}
      zoom={15}
      mapId={"YOUR_MAP_ID_HERE"} // User needs to replace this
      gestureHandling={'greedy'}
      disableDefaultUI={true}
    >
      {markerPosition && (
        <AdvancedMarker position={markerPosition}>
          <Pin background={'hsl(var(--primary))'} glyphColor={'hsl(var(--primary-foreground))'} borderColor={'hsl(var(--primary))'} />
        </AdvancedMarker>
      )}
    </Map>
  );
}
