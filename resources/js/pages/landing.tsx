import AudienceSection from '@/components/landing/audience-section';
import FeaturesSection from '@/components/landing/features-section';
import HeroSection from '@/components/landing/hero-section';
import InstitutionalSection from '@/components/landing/institutional-section';
import PricingSection from '@/components/landing/pricing-section';
import ProblemSection from '@/components/landing/problem-section';
import SolutionSection from '@/components/landing/solution-section';
import WidgetsSection from '@/components/landing/widgets-section';
import LandingLayout from '@/layouts/landing-layout';

export default function Landing() {
    return (
        <LandingLayout>
            <HeroSection />
            <ProblemSection />
            <SolutionSection />
            <FeaturesSection />
            <WidgetsSection />
            <PricingSection />
            <AudienceSection />
            <InstitutionalSection />
        </LandingLayout>
    );
}
