import type { ComponentType } from "react";
import type { DemoDefinition, DemoKind } from "../../types";
import {
  CanAttackEvidenceLab,
  CassiDeploymentLab,
  ControlAlignmentLab,
  LocalizationEvidenceLab,
  SafetyEvidenceLab,
  SensorEvidenceLab,
  TampaBsmEvidenceLab,
  TimingAuditLab,
} from "./RealDataLabs";

interface DemoRendererProps {
  demo: DemoDefinition;
  index: number;
}

const renderers: Record<DemoKind, ComponentType> = {
  "comma-sensor-evidence": SensorEvidenceLab,
  "tampa-bsm-evidence": TampaBsmEvidenceLab,
  "comma-localization-evidence": LocalizationEvidenceLab,
  "comma-control-alignment": ControlAlignmentLab,
  "comma-timing-audit": TimingAuditLab,
  "road-can-evidence": CanAttackEvidenceLab,
  "nhtsa-safety-evidence": SafetyEvidenceLab,
  "cassi-deployment-evidence": CassiDeploymentLab,
};

export function DemoRenderer({ demo, index }: DemoRendererProps) {
  const Lab = renderers[demo.kind];
  return (
    <article className={`demo-lab real-evidence-demo accent-${demo.accent}`} aria-labelledby={`${demo.id}-heading`}>
      <header className="demo-heading">
        <span className="demo-number">{String(index).padStart(2, "0")}</span>
        <div>
          <h3 id={`${demo.id}-heading`}>{demo.title}</h3>
          <p>{demo.description}</p>
        </div>
        <span className="demo-live">Recorded-data lab</span>
      </header>
      <Lab />
    </article>
  );
}
