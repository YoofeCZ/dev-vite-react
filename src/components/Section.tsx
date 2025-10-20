export default function Section({
  title, subtitle, children
}: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="glass card">
      <h2>{title}</h2>
      {subtitle && <p className="small">{subtitle}</p>}
      <div style={{ marginTop: 12 }}>{children}</div>
    </section>
  )
}
