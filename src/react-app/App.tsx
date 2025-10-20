import "./index.css";
import "./site.css";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeaturesGrid from "../components/FeaturesGrid";
import StatusDashboard from "../components/StatusDashboard";
import Devlog from "../components/Devlog";
import CommunityLinks from "../components/CommunityLinks"; // můžeš klidně vynechat
import SiteFooter from "../components/SiteFooter";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturesGrid />
        <StatusDashboard />
        <Devlog />
        {/* volitelné: tvoje existující sekce */
          /* <Timeline />  // pokud chceš timeline dle staré komponenty */}
        <section id="contact" className="contact">
          <div className="container">
            <h2 className="section-title">Get In Touch</h2>
            {/* jednoduché CTA nebo form — později napojíme */}
            <CommunityLinks />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
