export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo-icon">🌌</span>
            <span className="logo-text">Project Eclipse</span>
          </div>

          <div className="footer-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#status">Status</a>
            <a href="#devlog">DevLog</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="footer-social">
            <a href="#" target="_blank" rel="noreferrer">💬</a>
            <a href="#" target="_blank" rel="noreferrer">🐦</a>
            <a href="https://github.com/YoofeCZ/vite-react-dev-page" target="_blank" rel="noreferrer">🐙</a>
            <a href="#" target="_blank" rel="noreferrer">📺</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Project Eclipse. All rights reserved.</p>
          <p className="tech-stack">Built with Vite + React + Hono on Cloudflare</p>
        </div>
      </div>
    </footer>
  );
}
