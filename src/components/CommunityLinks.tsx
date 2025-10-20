import Section from "./Section"

export default function CommunityLinks() {
  return (
    <Section title="Komunita" subtitle="Discord • X • Newsletter">
      <div className="grid">
        <a className="glass card" href="https://discord.gg/yourserver" target="_blank">Discord</a>
        <a className="glass card" href="https://twitter.com/yourhandle" target="_blank">X (Twitter)</a>
        <a className="glass card" href="/newsletter">Newsletter</a>
      </div>
    </Section>
  )
}
