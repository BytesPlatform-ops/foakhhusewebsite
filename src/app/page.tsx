import ChapterRail from "@/components/navigation/ChapterRail";
import VideoHero from "@/components/hero/VideoHero";
import ElevationBackdrop from "@/components/shared/ElevationBackdrop";
import ProjectGlance from "@/components/sections/ProjectGlance";
import DesignedAroundNature from "@/components/sections/DesignedAroundNature";
import SnakeRoute from "@/components/sections/SnakeRoute";
import ResidencesStory from "@/components/sections/ResidencesStory";
import FoakhLocationSection from "@/components/location/FoakhLocationSection";
import GallerySection from "@/components/gallery/GallerySection";
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
      <div className="bg-[#F5EDE3] lg:pl-[200px]">
        <VideoHero />
        <ElevationBackdrop>
          <ProjectGlance />
          <DesignedAroundNature />
          <SnakeRoute />
        </ElevationBackdrop>
        <ResidencesStory />
        <FoakhLocationSection />
        <GallerySection />
        <FinalCTA />
        <Footer />
      </div>
    </>
  );
}
