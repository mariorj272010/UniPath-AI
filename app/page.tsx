import { Atmosphere } from "@/components/site/atmosphere";
import { SiteNav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import { Manifesto } from "@/components/site/manifesto";
import { Capabilities } from "@/components/site/capabilities";
import { Showcase } from "@/components/site/showcase";
import { HoloChart } from "@/components/site/holo-chart";
import { CallToAction } from "@/components/site/cta";
import { SiteFooter } from "@/components/site/footer";

export default function Home() {
  return (
    <div className="grain relative">
      <Atmosphere />
      <SiteNav />
      <main className="relative">
        <Hero />
        <Manifesto />
        <Capabilities />
        <Showcase />
        <HoloChart />
        <CallToAction />
      </main>
      <SiteFooter />
    </div>
  );
}
