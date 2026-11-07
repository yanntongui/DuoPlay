"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Badge, TableCard } from "@/components/admin/ui";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type Step = "decouverte" | "complicite" | "romantisme" | "proximite" | "intimite";

const numberFormat = new Intl.NumberFormat("fr-FR");

function getStepLabel(step: Step): string {
  const labels: Record<Step, string> = {
    decouverte: "Découverte",
    complicite: "Complicité",
    romantisme: "Romantisme",
    proximite: "Proximité",
    intimite: "Intimité",
  };
  return labels[step];
}

function getStepTone(step: Step): "positive" | "neutral" | "warning" | "danger" | "plum" {
  const tones: Record<Step, "positive" | "neutral" | "warning" | "danger" | "plum"> = {
    decouverte: "positive",
    complicite: "positive",
    romantisme: "plum",
    proximite: "warning",
    intimite: "danger",
  };
  return tones[step];
}

export function CheminIntimiteBoard() {
  const [step, setStep] = useState<Step>("decouverte");
  const [rollCount, setRollCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  // Use the existing "cartes" experience as a base, 
  // or use a generic query
  const data = useQuery(api.sessions.roomState, {
    skip: true, // Skip for now - will use mock data
  });

  const handleRoll = async () => {
    // Simple step advancement
    const steps: Step[] = ["decouverte", "complicite", "romantisme", "proximite", "intimite"];
    const currentIndex = steps.indexOf(step);
    const newIndex = Math.min(currentIndex + 1, steps.length - 1);
    setStep(steps[newIndex]);
    setRollCount(prev => prev + 1);
    setToast(`Nouvelle étape: ${getStepLabel(steps[newIndex])}.`);
  };

  return (
    <TableCard>
      <div className="h-64 border rounded-2xl overflow-hidden bg-gradient-to-b from-lavender-100 to-coral-50">
        <div className="grid grid-cols-5">
          <div className="col-span-1 bg-lavender-200/50 border-r border-lavender-300/50 hover:bg-lavender-300/80">
            <p className="text-xs font-medium text-lavender-600">Découverte</p>
            <p className="text-lg font-bold text-lavender-700">1</p>
          </div>
          <div className="col-span-1 bg-coral-200/50 border-r border-coral-300/50 hover:bg-coral-300/80">
            <p className="text-xs font-medium text-coral-600">Complicité</p>
            <p className="text-lg font-bold text-coral-700">2</p>
          </div>
          <div className="col-span-1 bg-plum-200/50 border-r border-plum-300/50 hover:bg-plum-300/80">
            <p className="text-xs font-medium text-plum-600">Romantisme</p>
            <p className="text-lg font-bold text-plum-700">3</p>
          </div>
          <div className="col-span-1 bg-warning-200/50 border-r border-warning-300/50 hover:bg-warning-300/80">
            <p className="text-xs font-medium text-warning-600">Proximité</p>
            <p className="text-lg font-bold text-warning-700">4</p>
          </div>
          <div className="col-span-1 bg-danger-200/50 border-r border-danger-300/50 hover:bg-danger-300/80">
            <p className="text-xs font-medium text-danger-600">Intimité</p>
            <p className="text-lg font-bold text-danger-700">5</p>
          </div>
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white/90 shadow-lg">
          <Badge tone="primary">💑</Badge>
        </div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white text-lavender-500 text-xs font-bold">
          {step.charAt(0).toUpperCase() + step.slice(1)}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center">
        <button onClick={handleRoll} className="ad-btn ad-btn-primary">
          <Plus /> Lancer le dé
        </button>
      </div>

      {toast && (
        <div className="mt-4">
          {toast}
        </div>
      )}
    </TableCard>
  );
}