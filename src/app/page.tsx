import Hero from "@/components/hero/Hero";
import LivingScrollCards from "@/components/sections/LivingScrollCards";
import RenewablePreview from "@/components/technology/RenewablePreview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <RenewablePreview />
      <LivingScrollCards />
    </>
  );
}
