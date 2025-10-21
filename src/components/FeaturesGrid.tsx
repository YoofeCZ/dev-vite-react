const features = [
  { title: "Boomer Shooter Combat System", description: "Fluid melee and ranged combat with combo system", status: "completed" },
  { title: "Character Progression", description: "Deep skill tree and equipment customization", status: "in-progress" },
  { title: "Story Campaign", description: "15+ hours of main story content", status: "in-progress" },
  { title: "Boss Battles", description: "Epic encounters with unique mechanics", status: "planned" },
  { title: "Side Quests", description: "Dozens of optional missions and secrets", status: "planned" },
  { title: "Original Soundtrack", description: "Dynamic music that responds to gameplay", status: "in-progress" }
];

function statusClass(s: string) {
  if (s === "completed") return "status-completed";
  if (s === "in-progress") return "status-in-progress";
  return "status-planned";
}

export default function FeaturesGrid() {
  return (
    <section id="about" className="about">
      <div className="container">
        <h2 className="section-title">About the Game</h2>

        <div className="about-grid">
          <div className="about-card">
            <h3>🎮 Game Concept</h3>
            <p>Obscurus combines intense combat, exploration, and storytelling in a 16th-century alchemical Prague.</p>
          </div>
          <div className="about-card">
            <h3>🛠️ Development Journey</h3>
            <p>Started in June 2025 — From prototypes to complex systems, every element is carefully designed.</p>
          </div>
        </div>

        <div className="features-grid">
          <p><h3>Key Features</h3></p>
          <div className="features">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-title">
                  <h4>{f.title}</h4>
                  <span className={`feature-status ${statusClass(f.status)}`}>
                    {f.status === "completed" ? "Completed" : f.status === "in-progress" ? "In Progress" : "Planned"}
                  </span>
                </div>
                <p>{f.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
