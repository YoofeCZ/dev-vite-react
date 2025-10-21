import { useEffect, useState } from "react";

type UnityStatus = {
  online: boolean;
  mode: "working" | "break" | "offline";
  activity?: string;
  scene?: string;
  lastUpdate: number;
};

export default function Navbar() {
  const [status, setStatus] = useState<UnityStatus | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/unity-status", { headers: { accept: "application/json" } });
        const s = await res.json() as UnityStatus;
        if (alive) setStatus(s);
      } catch {
        if (alive) setStatus({ online: false, mode: "offline", lastUpdate: 0 });
      }
    };
    load();
    const id = setInterval(load, 10000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const active = status?.mode === "working" || status?.mode === "break";

  return (
    <nav className="navbar" id="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <span className="logo-icon">🌌</span>
          <span className="logo-text">Obscurus - Mordern Boomer Shooter</span>
        </div>

        <div className="nav-menu" id="nav-menu">
          <a href="#home" className="nav-link">Home</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#status" className="nav-link">Status</a>
          <a href="#devlog" className="nav-link">DevLog</a>
          <a href="/blog" className="nav-link">Blog</a>
          <a href="#contact" className="nav-link">Contact</a>
        </div>

        <div className="status-indicator" id="status-indicator">
          <span className={`status-dot ${active ? "active" : ""}`}></span>
          <span className="status-text">{active ? "Unity Active" : "Offline"}</span>
        </div>

        <div className="nav-toggle" id="nav-toggle">
          <span></span><span></span><span></span>
        </div>
      </div>
    </nav>
  );
}
