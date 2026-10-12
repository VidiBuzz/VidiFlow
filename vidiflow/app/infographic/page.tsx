import Infographic from '@/components/Infographic';
import { FOOTNOTES } from '@/lib/catalog';

export const metadata = {
  title: 'Bandwidth Ladder 2026 — corrected infographic | VidiSmart',
};

/** Standalone poster page — PNG export target (2× screenshot → images/bandwidth-ladder-2026.png). */
export default function InfographicPage() {
  return (
    <main
      style={{
        maxWidth: 1600,
        marginInline: 'auto',
        padding: '0.5rem',
        background: '#020617',
      }}
    >
      <Infographic />
      <div style={{ padding: '0.75rem 0.5rem', maxWidth: 1600 }}>
        {Object.entries(FOOTNOTES).map(([n, f]) => (
          <p key={n} style={{ color: '#64748b', fontSize: 11, margin: '0.15rem 0' }}>
            <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0891b2' }}>
              [{n}]
            </a>{' '}
            {f.label}
          </p>
        ))}
      </div>
    </main>
  );
}