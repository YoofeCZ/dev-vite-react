import Particles from "./Particles";

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-background">
        <Particles />
      </div>
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="title-main">Project Eclipse</span>
          <span className="title-sub">An epic adventure through space and time</span>
        </h1>
        <p className="hero-description">
          A story-driven action RPG set in a dystopian sci-fi universe where you explore mysterious planets,
          uncover ancient secrets, and battle powerful enemies to save humanity from extinction.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#status"><span>🚀</span> View Progress</a>
          <a className="btn btn-secondary" href="https://discord.gg/yourserver" target="_blank" rel="noreferrer">
            <span>💬</span> Join Discord
          </a>
        </div>
      </div>
    </section>
  );
}
