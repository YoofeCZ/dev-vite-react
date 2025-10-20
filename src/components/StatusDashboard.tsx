import UnityStatusCard from "./UnityStatusCard"
import GitHubFeed from "./GitHubFeed"

export default function StatusDashboard() {
  return (
    <section id="status" className="status-dashboard">
      <div className="container">
        <h2 className="section-title">Real-Time Development Status</h2>

        <div className="dashboard-grid">
          {/* Current Task */}
          <div className="dashboard-card">
            <h4>🎯 Current Task</h4>
            <p className="current-task">Implementing Enemy AI Behavior System</p>
            <span className="timestamp">Last active: 2 hours ago</span>
          </div>

          {/* Progress bar */}
          <div className="dashboard-card">
            <h4>📊 Overall Progress</h4>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "42%" }}></div>
              <span className="progress-text">42%</span>
            </div>
          </div>

          {/* Karty */}
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
