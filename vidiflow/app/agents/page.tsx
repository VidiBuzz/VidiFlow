import type { Metadata } from 'next';
import Link from 'next/link';
import AgentFleet from '@/components/AgentFleet';

export const metadata: Metadata = {
  title: 'VidiFlow Agent Fleet — live status prompts & project bars',
  description:
    'Live dashboard for the VidiSmart agent fleet: animated status orbs, typewriter status prompts, and wavy project bars per agent.',
};

export default function AgentsPage() {
  return (
    <main style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '1.25rem', right: 'clamp(1rem, 3vw, 2rem)', zIndex: 10 }}>
        <Link href="/" className="chip">← Bandwidth Lab</Link>
      </div>
      <AgentFleet />
    </main>
  );
}