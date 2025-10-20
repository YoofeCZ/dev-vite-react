import "./index.css"
import UnityStatusCard from "../components/UnityStatusCard"
import GitHubFeed from "../components/GitHubFeed"
import Timeline from "../components/Timeline"
import GameInfo from "../components/GameInfo"
import CommunityLinks from "../components/CommunityLinks"

export default function App() {
  return (
    <>
      <header className="nav">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, paddingBottom: 12 }}>
          <div style={{ fontWeight: 700 }}>Arcflare Games</div>
          <nav className="small" style={{ display: "flex", gap: 16 }}>
            <a className="link" href="/">Home</a>
            <a className="link" href="/forum">Forum</a>
            <a className="link" href="/store">Store</a>
            <a className="link" href="/admin">Admin</a>
          </nav>
        </div>
      </header>

      <main className="container" style={{ display: "grid", gap: 16, marginTop: 18, marginBottom: 40 }}>
        <section className="glass card">
          <h1>Vývoj hry – transparentně a v reálném čase</h1>
          <p className="muted">Sleduj, na čem právě dělám v Unity, poslední commity a postup vývoje.</p>
        </section>

        <div className="grid grid-2">
          <UnityStatusCard />
          <GitHubFeed />
        </div>

        <Timeline />
        <GameInfo />
        <CommunityLinks />
      </main>

      <footer className="container small" style={{ textAlign: "center", opacity: .6, paddingBottom: 24 }}>
        © {new Date().getFullYear()} Arcflare Games
      </footer>
    </>
  )
}
