"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { WarEvent } from "@/lib/wars-types";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const COUNTRIES_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";

type Props = {
  events: WarEvent[];
  activeId: string | null;
  onSelect: (e: WarEvent) => void;
  width: number;
  height: number;
  /** 0..1 per event id — drives marker size (log-normalised casualty total) */
  casualtyScale: Record<string, number>;
};

export default function WarGlobe({
  events,
  activeId,
  onSelect,
  width,
  height,
  casualtyScale,
}: Props) {
  const globeRef = useRef<any>(null);
  const [countries, setCountries] = useState<any[]>([]);

  // Load low-res country polygons once
  useEffect(() => {
    let cancel = false;
    fetch(COUNTRIES_URL)
      .then((r) => r.json())
      .then((d) => {
        if (!cancel) setCountries(d.features || []);
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, []);

  // Marker 1 focus on mount / when events change
  useEffect(() => {
    if (!globeRef.current || events.length === 0) return;
    const first = [...events].sort((a, b) => a.order - b.order)[0];
    globeRef.current.pointOfView(
      { lat: first.lat, lng: first.lng, altitude: 1.4 },
      1200
    );
  }, [events]);

  // Camera limits
  useEffect(() => {
    if (!globeRef.current) return;
    const c = globeRef.current.controls?.();
    if (c) {
      c.enableZoom = true;
      c.zoomSpeed = 1.2;
      c.minDistance = 160;
      c.maxDistance = 900;
      c.enableDamping = true;
    }
  }, [width, countries]);

  // Fly to active event when it changes
  useEffect(() => {
    if (!activeId || !globeRef.current) return;
    const e = events.find((x) => x.id === activeId);
    if (!e) return;
    const current = globeRef.current.pointOfView();
    const alt =
      current && current.altitude && current.altitude < 1.2
        ? current.altitude
        : 1.2;
    globeRef.current.pointOfView(
      { lat: e.lat, lng: e.lng, altitude: alt },
      800
    );
  }, [activeId, events]);

  // Marker HTML is built imperatively for globe-integration performance.
  // Visual matches NumberedMarker via shared .war-marker-* classes in
  // lib/wars-noir-theme.css.
  const htmlElement = (d: any) => {
    const e: WarEvent = d._e;
    const el = document.createElement("div");
    el.style.transform = "translate(-50%, -50%)";
    el.style.pointerEvents = "auto";
    el.style.cursor = "pointer";
    el.addEventListener("click", () => onSelect(e));
    const active = activeId === e.id;
    const size = 32 + (casualtyScale[e.id] || 0) * 24; // 32..56
    el.innerHTML = `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${active ? `<div class="war-marker-pulse"></div>` : ""}
        <div class="war-marker-medallion" style="width:${size}px;height:${size}px;${
      active ? "border-color:var(--war-gold);" : ""
    }">
          <span class="war-marker-num">${e.order}</span>
        </div>
      </div>
    `;
    return el;
  };

  const markers = events.map((e) => ({
    lat: e.lat,
    lng: e.lng,
    alt: 0.01,
    _e: e,
  }));

  return (
    <Globe
      ref={globeRef}
      width={width}
      height={height}
      backgroundColor="#0a0a0a"
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      atmosphereColor="#c9a961"
      atmosphereAltitude={0.18}
      polygonsData={countries}
      polygonCapColor={() => "rgba(232,227,214,0.04)"}
      polygonSideColor={() => "rgba(0,0,0,0.4)"}
      polygonStrokeColor={() => "rgba(232,227,214,0.35)"}
      polygonAltitude={0.006}
      htmlElementsData={markers}
      htmlLat="lat"
      htmlLng="lng"
      htmlAltitude="alt"
      htmlElement={htmlElement}
      arcsData={[]}
    />
  );
}
