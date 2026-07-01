import { useEffect, useRef } from "react";

interface Props {
  playing: boolean;
  playYear: number;
  speed: number;
  setPlaying: (v: boolean) => void;
  setPlayYear: (y: number) => void;
  setSpeed: (s: number) => void;
  reducedMotion: boolean;
}

const MIN = 1885;
const MAX = 2025;

export default function PlayControls({
  playing, playYear, speed, setPlaying, setPlayYear, setSpeed, reducedMotion,
}: Props) {
  const raf = useRef<number>();
  const last = useRef<number>(0);

  useEffect(() => {
    if (!playing) return;
    // if starting from the end, restart from the beginning
    if (playYear >= MAX) setPlayYear(MIN);

    const tick = (t: number) => {
      if (!last.current) last.current = t;
      const dt = (t - last.current) / 1000;
      last.current = t;
      const next = playYear + dt * speed;
      if (next >= MAX) {
        setPlayYear(MAX);
        setPlaying(false);
        last.current = 0;
        return;
      }
      setPlayYear(next);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      last.current = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, playYear, speed]);

  const atEnd = playYear >= MAX;

  return (
    <div className="panel flex items-center gap-3 rounded-full border px-3 py-1.5 hairline">
      <button
        onClick={() => setPlaying(!playing)}
        aria-label={playing ? "Pause" : "Play through time"}
        className="grid h-8 w-8 place-items-center rounded-full text-paper transition"
        style={{ background: "var(--llama)" }}
      >
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="2" y="1.5" width="3" height="9" rx="1" />
            <rect x="7" y="1.5" width="3" height="9" rx="1" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2.5 1.5 L10.5 6 L2.5 10.5 Z" />
          </svg>
        )}
      </button>

      <span className="font-mono text-sm font-semibold tabular-nums text-ink" style={{ minWidth: 40 }}>
        {atEnd && !playing ? "all" : Math.round(playYear)}
      </span>

      <input
        type="range"
        min={MIN}
        max={MAX}
        step={1}
        value={Math.round(playYear)}
        onChange={(e) => {
          setPlaying(false);
          setPlayYear(Number(e.target.value));
        }}
        aria-label="Scrub through years"
        className="h-1 w-40 cursor-pointer appearance-none rounded-full"
        style={{ accentColor: "var(--marigold)", background: "var(--rule)" }}
      />

      <button
        onClick={() => {
          setPlaying(false);
          setPlayYear(MAX);
        }}
        className="font-mono text-[10px] uppercase tracking-wide text-ink-faint transition hover:text-ink"
        aria-label="Reset to show all"
      >
        reset
      </button>

      {!reducedMotion && (
        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          aria-label="Playback speed"
          className="bg-transparent font-mono text-[10px] text-ink-soft focus:outline-none"
        >
          <option value={3}>0.5×</option>
          <option value={6}>1×</option>
          <option value={12}>2×</option>
          <option value={24}>4×</option>
        </select>
      )}
    </div>
  );
}
