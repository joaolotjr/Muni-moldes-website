import type { ReactNode } from 'react';

// Renderiza o texto das notícias, escrito em Markdown simples:
// "## Título", "### Subtítulo", listas com "- " ou "1. ", **negrito**, *itálico* e [texto](link).
// Tudo vira elemento React, sem HTML bruto, então o que for digitado no painel não executa nada.

const SAFE_LINK = /^(https?:\/\/|mailto:|\/)/i;
const INLINE = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\([^)\s]+\))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={key} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      if (!SAFE_LINK.test(link[2])) return link[1];
      const external = !link[2].startsWith('/');
      return (
        <a
          key={key}
          href={link[2]}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="font-medium text-primary underline decoration-primary-soft underline-offset-4 hover:text-primary-dark"
        >
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

function renderLines(lines: string[], keyPrefix: string): ReactNode[] {
  return lines.flatMap((line, index) => [
    ...(index > 0 ? [<br key={`${keyPrefix}-br-${index}`} />] : []),
    ...renderInline(line, `${keyPrefix}-${index}`),
  ]);
}

export function Markdown({ text, className = '' }: { text: string; className?: string }) {
  const blocks = text.replace(/\r\n/g, '\n').split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  return (
    <div className={`space-y-5 text-base leading-relaxed text-ink-soft sm:text-lg ${className}`}>
      {blocks.map((block, index) => {
        const key = `b-${index}`;
        const lines = block.split('\n');

        if (lines.length === 1 && block.startsWith('### ')) {
          return <h3 key={key} className="heading-3 pt-2 text-ink">{renderInline(block.slice(4), key)}</h3>;
        }
        if (lines.length === 1 && block.startsWith('## ')) {
          return <h2 key={key} className="font-serif text-2xl font-semibold leading-snug text-ink sm:text-3xl">{renderInline(block.slice(3), key)}</h2>;
        }
        if (lines.every((line) => /^[-*] /.test(line))) {
          return (
            <ul key={key} className="list-disc space-y-2 pl-6 marker:text-primary-soft">
              {lines.map((line, i) => <li key={i}>{renderInline(line.slice(2), `${key}-${i}`)}</li>)}
            </ul>
          );
        }
        if (lines.every((line) => /^\d+\. /.test(line))) {
          return (
            <ol key={key} className="list-decimal space-y-2 pl-6 marker:font-semibold marker:text-primary">
              {lines.map((line, i) => <li key={i}>{renderInline(line.replace(/^\d+\. /, ''), `${key}-${i}`)}</li>)}
            </ol>
          );
        }
        return <p key={key}>{renderLines(lines, key)}</p>;
      })}
    </div>
  );
}
