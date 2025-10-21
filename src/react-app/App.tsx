import "./index.css";
import "./site.css";

import { Routes, Route } from "react-router-dom";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeaturesGrid from "../components/FeaturesGrid";
import StatusDashboard from "../components/StatusDashboard";
import Devlog from "../components/Devlog";
import CommunityLinks from "../components/CommunityLinks";
import SiteFooter from "../components/SiteFooter";

// 👇 nové importy tvých samostatných stránek
import BlogListPage from "../pages/BlogListPage";
import BlogPostPage from "../pages/BlogPostPage";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </main>
      <SiteFooter />
    </>
  );
}

// ===== tvoje původní homepage beze změn =====
function HomePage() {
  return (
    <>
      <Hero />
      <FeaturesGrid />
      <StatusDashboard />
      <Devlog />
      <section id="contact" className="contact">
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <CommunityLinks />
        </div>
      </section>
    </>
  );
}
