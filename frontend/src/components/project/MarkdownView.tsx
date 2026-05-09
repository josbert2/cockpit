"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface Props {
  source: string;
  className?: string;
}

export function MarkdownView({ source, className }: Props) {
  return (
    <div
      className={cn(
        "prose-cockpit max-w-none text-fg leading-relaxed",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h1 className="text-2xl font-bold tracking-tight mt-6 mb-3 text-fg" {...p} />,
          h2: (p) => <h2 className="text-xl font-semibold tracking-tight mt-6 mb-2 text-fg" {...p} />,
          h3: (p) => <h3 className="text-lg font-semibold tracking-tight mt-4 mb-2 text-fg" {...p} />,
          h4: (p) => <h4 className="text-base font-semibold mt-3 mb-1 text-fg" {...p} />,
          p: (p) => <p className="my-3 text-sm text-fg/90" {...p} />,
          ul: (p) => <ul className="my-3 pl-5 list-disc space-y-1 text-sm" {...p} />,
          ol: (p) => <ol className="my-3 pl-5 list-decimal space-y-1 text-sm" {...p} />,
          li: (p) => <li className="text-fg/90" {...p} />,
          a: (p) => <a className="text-primary hover:underline" target="_blank" rel="noreferrer" {...p} />,
          blockquote: (p) => (
            <blockquote className="my-3 border-l-2 border-border pl-4 text-muted-fg italic" {...p} />
          ),
          code: ({ className: cls, children, ...props }) => {
            const isInline = !cls;
            return isInline ? (
              <code className="px-1.5 py-0.5 rounded bg-muted text-fg text-[0.85em] font-mono" {...props}>
                {children}
              </code>
            ) : (
              <code className={cls} {...props}>
                {children}
              </code>
            );
          },
          pre: (p) => (
            <pre
              className="my-3 p-3 rounded-md bg-muted text-xs overflow-x-auto font-mono"
              {...p}
            />
          ),
          hr: () => <hr className="my-6 border-border" />,
          table: (p) => <table className="my-3 text-sm border-collapse" {...p} />,
          th: (p) => (
            <th className="px-3 py-1.5 text-left font-semibold text-muted-fg border-b border-border" {...p} />
          ),
          td: (p) => <td className="px-3 py-1.5 border-b border-border" {...p} />,
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
