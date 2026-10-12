import type { Metadata } from 'next';
import LexExplorer from '@/components/LexExplorer';
import './lex.css';

export const metadata: Metadata = {
  title: 'Lexi — every tech term, explained · VidiFlow LEX',
  description:
    'Lexi is VidiFlow\u2019s tech-term expert: 460+ terms from OpenGloss v1.1 as a typed sense graph — synonyms, antonyms, hypernyms, hyponyms, collocations, derivations, inflections. Search a term, walk its edges, hop polyseme senses.',
};

export default function LexPage() {
  return <LexExplorer />;
}
