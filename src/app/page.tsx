import ChapterRail from "@/components/navigation/ChapterRail";
import Hero from "@/components/hero/Hero";
import ProjectGlance from "@/components/sections/ProjectGlance";
import DesignedAroundNature from "@/components/sections/DesignedAroundNature";
import SnakeRoute from "@/components/sections/SnakeRoute";
import WindCatcher from "@/components/sections/WindCatcher";
import WindPower from "@/components/sections/WindPower";
import SolarGrazing from "@/components/sections/SolarGrazing";
import SolarHarmony from "@/components/sections/SolarHarmony";
import WaterPlanning from "@/components/sections/WaterPlanning";
import ResidencesStory from "@/components/sections/ResidencesStory";
import TwoBlocks from "@/components/sections/TwoBlocks";
import Amenities from "@/components/sections/Amenities";
import Timeline from "@/components/sections/Timeline";
import LocationRoad from "@/components/sections/LocationRoad";
import FannedGallery from "@/components/sections/FannedGallery";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";

/**
 * Homepage — the complete chapter sequence from docs/VISUAL-PLAN.md.
 * Every section sets --blend-from to the previous section's base tone so
 * ambient colour transitions overlap instead of hard-cutting.
 */
export default function HomePage() {
  return (
    <>
      <ChapterRail />
      <div className="lg:pl-44">
        <Hero />
        <ProjectGlance />
        <DesignedAroundNature />
        <SnakeRoute />
        <WindCatcher />
        <WindPower />
        <SolarGrazing />
        <SolarHarmony />
        <WaterPlanning />
        <ResidencesStory />
        <TwoBlocks />
        <Amenities />
        <Timeline />
        <LocationRoad />
        <FannedGallery />
        <FinalCTA />
        <Footer />
      </div>
    </>
  );
}
