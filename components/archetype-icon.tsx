import {
  FlaskConical,
  Rocket,
  BookOpen,
  HeartHandshake,
  Settings,
  Globe,
  Crosshair,
} from "lucide-react";
import { ArchetypeName } from "@/types/analysis";

interface ArchetypeIconProps {
  archetype: ArchetypeName;
  className?: string;
}

const ARCHETYPE_ICONS: Record<
  ArchetypeName,
  React.ComponentType<{ className?: string }>
> = {
  "The Experimenter": FlaskConical,
  "Indie Hacker": Rocket,
  "Tutorial Collector": BookOpen,
  "Open Source Monk": HeartHandshake,
  "Overengineer Supreme": Settings,
  "The Polyglot": Globe,
  "One-Trick Pony": Crosshair,
};

export function ArchetypeIcon({ archetype, className }: ArchetypeIconProps) {
  const Icon = ARCHETYPE_ICONS[archetype];
  return <Icon className={className} />;
}
