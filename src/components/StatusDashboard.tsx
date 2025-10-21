import UnityStatusCard from "./UnityStatusCard"
import GitHubFeed from "./GitHubFeed"

export default function StatusDashboard() {
  return (
    <section id="status" className="status-dashboard">
      <div className="container">
        <h2 className="section-title">Real-Time Development Status</h2>

        {/* Progress bar NAD kartami */}
        <div className="dashboard-progress">
          <h4>📊 Overall Progress</h4>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "42%" }}></div>
            <span className="progress-text">42%</span>
          </div>
        </div>

        {/* GRID pro karty */}
        <div className="dashboard-grid two-cols">
          <div className="dashboard-card">
            <UnityStatusCard compact />
          </div>

          <div className="dashboard-card">
            <GitHubFeed compact />
          </div>
        </div>
      </div>
    </section>
  )
}
