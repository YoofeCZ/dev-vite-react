import Section from "./Section"

export default function GameInfo() {
  return (
    <Section title="O hře" subtitle="Features • Screenshots • Tech stack">
      <div className="grid grid-3">
        <div className="glass card">
          <h3>Features</h3>
          <ul className="list">
            <li>AI banditi, questy, crafting</li>
            <li>Modular building, raidy, vozidla</li>
            <li>Počasí, světlo/tma, sanity efekt</li>
          </ul>
        </div>
        <div className="glass card">
          <h3>Screenshots</h3>
          <div className="grid grid-3">
            <div style={{ aspectRatio: "16/9" }} className="glass"></div>
            <div style={{ aspectRatio: "16/9" }} className="glass"></div>
            <div style={{ aspectRatio: "16/9" }} className="glass"></div>
          </div>
        </div>
        <div className="glass card">
          <h3>Tech Stack</h3>
          <ul className="list">
            <li>Frontend: Vite + React</li>
            <li>Backend: Hono @ Cloudflare Workers</li>
            <li>Storage: KV (status), D1 (forum/store), R2 (media)</li>
          </ul>
        </div>
      </div>
    </Section>
  )
}
