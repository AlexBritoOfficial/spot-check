"use client";

import dynamic from "next/dynamic";

const LeafLet = dynamic(() => import("./leaflet"), { ssr: false });

export default LeafLet;
