import { useEffect, useRef } from "react";

export default function Particles() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current!;
    const create = () => {
      const el = document.createElement("div");
      el.className = "particle";
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const size = Math.random() * 3 + 1;
      const duration = Math.random() * 10 + 5;
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.width = size + "px";
      el.style.height = size + "px";
      (el.style as any).animationDuration = duration + "s";
      host.appendChild(el);
      setTimeout(() => el.remove(), duration * 1000);
    };

    const count = 50;
    for (let i = 0; i < count; i++) create();
    const id = setInterval(create, 800);
    return () => clearInterval(id);
  }, []);

  return <div className="particles" id="particles" ref={ref} />;
}
