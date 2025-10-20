import Section from "./Section"

const items = [
  { date: "2025-09-30", title: "AI dialog systém – prototyp", desc: "Základní uzly a repliky" },
  { date: "2025-10-10", title: "Combat tuning", desc: "Balanc zbraní a animace" },
  { date: "2025-10-20", title: "Landing page", desc: "První verze webu s live statusem" },
]

export default function Timeline() {
  return (
    <Section title="Progress timeline" subtitle="Milníky a vývoj hry">
      <div className="grid">
        {items.map((i, idx) => (
          <div key={idx} className="glass card" style={{ padding: 14 }}>
            <div className="small">{i.date}</div>
            <div style={{ fontWeight: 600 }}>{i.title}</div>
            <div className="small">{i.desc}</div>
          </div>
        ))}
      </div>
    </Section>
  )
}
