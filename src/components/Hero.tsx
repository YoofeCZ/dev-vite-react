import Particles from "./Particles";

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-background">
        <Particles />
      </div>
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="title-main">Obscurus - Boomer Shooter</span>
          <span className="title-sub">The city of secrets awakens</span>
        </h1>
        <p className="hero-description">
  Beneath the cobblestones of 16th-century Prague, alchemists hunt immortality,
  monsters stalk the streets, and your only salvation is how fast you can pull the trigger.
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
