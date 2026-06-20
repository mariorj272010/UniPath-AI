import { Reveal } from "@/components/ui/reveal";

export function SectionHeading({
  kicker,
  title,
  desc,
}: {
  kicker: string;
  title: string;
  desc?: string;
}) {
  return (
    <Reveal>
      <div className="mb-6">
        <p className="hud-label flex items-center gap-2.5">
          <span className="h-px w-8 bg-ember/60" />
          {kicker}
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">
          {title}
        </h2>
        {desc && <p className="mt-2 max-w-2xl text-sm text-ink-soft">{desc}</p>}
      </div>
    </Reveal>
  );
}
