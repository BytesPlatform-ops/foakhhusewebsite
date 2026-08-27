import type { Metadata } from "next";
import PenthouseWalkthrough from "@/components/tour/PenthouseWalkthrough";

export const metadata: Metadata = {
  title: "Penthouse Walkthrough — Foakh",
  description:
    "Walk through the Foakh duplex penthouse in real time: entrance, living room, " +
    "kitchen, bedrooms, bathrooms, the duplex stair, the upper floor, the roof " +
    "terrace and the pool.",
};

export default function PenthouseTourPage() {
  return <PenthouseWalkthrough />;
}
