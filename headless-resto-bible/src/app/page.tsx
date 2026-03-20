
import LandingNav from '@/components/landing/LandingNav';
import HeroSection from '@/components/landing/HeroSection';
import DemoWalkthrough from '@/components/landing/DemoWalkthrough';
import FeaturesSection from '@/components/landing/FeaturesSection';
import FeatureGrid from '@/components/landing/FeatureGrid';
import ProcessSection from '@/components/landing/ProcessSection';
import PricingSection from '@/components/landing/PricingSection';
import LandingFooter from '@/components/landing/LandingFooter';
import MouseEffect from '@/components/landing/MouseEffect';

export default function Home() {
  return (
    <main className="bg-white">
      <MouseEffect />
      <LandingNav />
      <HeroSection />
      <DemoWalkthrough />
      <FeaturesSection />
      <FeatureGrid />
      <ProcessSection />
      <PricingSection />
      <LandingFooter />
    </main>
  );
}
