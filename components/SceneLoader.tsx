"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./AtmosphereScene"), { ssr: false });

export default function SceneLoader({ intensity = 1 }: { intensity?: number }) {
  return <Scene intensity={intensity} />;
}
