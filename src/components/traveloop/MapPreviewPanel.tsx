"use client";

import { useEffect, useRef, useState } from "react";
import { Map, MapPin } from "lucide-react";

import type { GeoPoint } from "@/features/traveloop";

import { cn } from "./utils";

export interface MapPreviewMarker {
  id: string;
  label: string;
  coordinates?: GeoPoint;
}

export interface MapPreviewPanelProps {
  mapboxToken?: string;
  center?: GeoPoint;
  markers?: MapPreviewMarker[];
  className?: string;
}

export function MapPreviewPanel({ mapboxToken, center, markers = [], className }: MapPreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapboxToken || !containerRef.current || !center) return;

    let cleanup: () => void = () => {};

    void import("mapbox-gl").then((mapbox) => {
      mapbox.default.accessToken = mapboxToken;
      const map = new mapbox.default.Map({
        container: containerRef.current as HTMLDivElement,
        style: "mapbox://styles/mapbox/light-v11",
        center: [center.lng, center.lat],
        zoom: markers.length > 1 ? 9 : 11,
        attributionControl: false
      });

      markers.forEach((marker) => {
        if (!marker.coordinates) return;
        new mapbox.default.Marker({ color: "#2563EB" })
          .setLngLat([marker.coordinates.lng, marker.coordinates.lat])
          .setPopup(new mapbox.default.Popup({ offset: 18 }).setText(marker.label))
          .addTo(map);
      });

      map.on("load", () => setMapReady(true));
      cleanup = () => map.remove();
    });

    return () => cleanup();
  }, [center, mapboxToken, markers]);

  const hasRenderableMap = Boolean(mapboxToken && center);

  return (
    <section className={cn("overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm", className)} aria-label="Trip map preview">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Map preview</h2>
          <p className="text-sm text-slate-500">{markers.length ? `${markers.length} saved places` : "No saved places yet"}</p>
        </div>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <Map aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
      <div className="relative h-80 bg-slate-100">
        {hasRenderableMap ? (
          <>
            <div ref={containerRef} className="h-full w-full" />
            {!isMapReady ? <div className="absolute inset-0 animate-pulse bg-slate-100" /> : null}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm">
              <MapPin aria-hidden="true" className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-slate-950">Map appears when places are ready</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Add coordinates and a Mapbox token to render the interactive route preview.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
