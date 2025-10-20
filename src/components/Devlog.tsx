import { useMemo, useState } from "react";

const posts = [
  { title: "Enemy AI: Making Smarter Opponents", date: "March 15, 2024", category: "technical", excerpt: "Deep dive into the behavior tree system powering our enemy AI.", thumbnail: "🤖" },
  { title: "Art Update: Planet Biome Concepts", date: "March 8, 2024", category: "art", excerpt: "Concept art for procedurally generated planets.", thumbnail: "🎨" },
  { title: "Monthly Progress Update - March 2024", date: "March 1, 2024", category: "updates", excerpt: "Combat feels great, UI refresh, AI taking shape.", thumbnail: "📊" },
  { title: "Combat System Deep Dive", date: "February 22, 2024", category: "technical", excerpt: "Designing responsive and strategic combat.", thumbnail: "⚔️" },
  { title: "Devlog #2: Building the First Planet", date: "February 15, 2024", category: "updates", excerpt: "From barren rocks to lush landscapes.", thumbnail: "🌍" },
  { title: "Why We Chose Unity for This Project", date: "February 1, 2024", category: "technical", excerpt: "Tech stack decisions and Unity tips.", thumbnail: "💡" },
];

export default function Devlog() {
  const [filter, setFilter] = useState<"all" | "updates" | "technical" | "art">("all");

  const filtered = useMemo(() => (
    filter === "all" ? posts : posts.filter(p => p.category === filter)
  ), [filter]);

  return (
    <section id="devlog" className="devlog">
      <div className="container">
        <h2 className="section-title">Development Blog</h2>

        <div className="devlog-filters">
          {["all","updates","technical","art"].map((k) => (
            <button
              key={k}
              className={`filter-btn ${filter === k ? "active" : ""}`}
              onClick={() => setFilter(k as any)}
              data-filter={k}
            >
              {k[0].toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>

        <div className="devlog-grid" id="devlog-grid">
          {filtered.map((p, i) => (
            <div className="devlog-card" key={i} data-category={p.category}>
              <div className="devlog-thumbnail">{p.thumbnail}</div>
              <div className="devlog-content">
                <div className="devlog-meta">
                  <span className="devlog-date">{p.date}</span>
                  <span className="devlog-category">{p.category[0].toUpperCase()+p.category.slice(1)}</span>
                </div>
                <h4 className="devlog-title">{p.title}</h4>
                <p className="devlog-excerpt">{p.excerpt}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
