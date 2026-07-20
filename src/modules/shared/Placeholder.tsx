// Página provisional para las secciones que se implementarán en fases
// posteriores (subidas → fase 2, análisis/histórico → fase 3).
interface PlaceholderProps {
  title: string;
  description: string;
}

export default function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <section className="p-8">
      <h2 className="text-h1 text-ink">{title}</h2>
      <p className="mt-2 max-w-prose text-body text-muted">{description}</p>
      <span className="mt-4 inline-block rounded-badge bg-brand-soft px-3 py-1 text-caption text-brand-700">
        En construcción
      </span>
    </section>
  );
}
