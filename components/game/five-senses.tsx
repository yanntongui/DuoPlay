"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Badge, TableCard } from "@/components/admin/ui";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type Step = "vue" | "ouie" | "odeur" | "goût" | "toucher";

const numberFormat = new Intl.NumberFormat("fr-FR");

function getStepLabel(step: Step): string {
  const labels: Record<Step, string> = {
    vue: "La Vue",
    ouie: "L'Ouïe",
    odeur: "L'Odorat",
    goût: "Le Goût",
    toucher: "Le Toucher",
  };
  return labels[step];
}

function getStepTone(step: Step): "positive" | "neutral" | "warning" | "danger" | "plum" {
  const tones: Record<Step, "positive" | "neutral" | "warning" | "danger" | "plum"> = {
    vue: "positive",
    ouie: "positive",
    odeur: "positive",
    goût: "plum",
    toucher: "warning",
  };
  return tones[step];
}

export function FiveSensesBoard() {
  const [step, setStep] = useState<Step>("vue");
  const [rollCount, setRollCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const data = useQuery(api["five-senses"].cards, {
    step,
    deviceToken: undefined,
  });

  const avancerEtape = useMutation(api["five-senses"].avancerEtape);
  const validerCarte = useMutation(api["five-senses"].validerCarte);
  const passerCarte = useMutation(api["five-senses"].passerCarte);

  useEffect(() => {
    setRollCount(0);
  }, [step]);

  const isLoading = data === undefined;
  const cards = (data?.cards as any[]) || [];
  const totalCount = data?.totalCount || 0;

  const handleAvancer = async () => {
    try {
      const result = await avancerEtape({ currentStep: step });
      setStep(result.newStep);
      setRollCount(prev => prev + 1);
      setToast(`Étape ${getStepLabel(result.newStep)}.`);
    } catch (err) {
      setToast("Erreur lors de l'avancement.");
      console.error(err);
    }
  };

  const handleValider = async (cardId: string) => {
    try {
      await validerCarte({ cardId, step });
      setToast("Carte validée.");
    } catch (err) {
      setToast("Erreur lors de la validation.");
      console.error(err);
    }
  };

  const handlePasser = async (cardId: string) => {
    try {
      await passerCarte({ cardId, step });
      setToast("Carte passée.");
    } catch (err) {
      setToast("Erreur lors du passage.");
      console.error(err);
    }
  };

  return (
    <TableCard>
      <div className="h-64 border rounded-2xl overflow-hidden bg-gradient-to-b from-lavender-100 to-coral-50">
        <div className="grid grid-cols-5">
          <div className="col-span-1 bg-lavender-200/50 border-r border-lavender-300/50 hover:bg-lavender-300/80">
            <p className="text-xs font-medium text-lavender-600">La Vue</p>
            <p className="text-lg font-bold text-lavender-700">1</p>
          </div>
          <div className="col-span-1 bg-coral-200/50 border-r border-coral-300/50 hover:bg-coral-300/80">
            <p className="text-xs font-medium text-coral-600">L'Ouïe</p>
            <p className="text-lg font-bold text-coral-700">2</p>
          </div>
          <div className="col-span-1 bg-plum-200/50 border-r border-plum-300/50 hover:bg-plum-300/80">
            <p className="text-xs font-medium text-plum-600">Le Goût</p>
            <p className="text-lg font-bold text-plum-700">3</p>
          </div>
          <div className="col-span-1 bg-warning-200/50 border-r border-warning-300/50 hover:bg-warning-300/80">
            <p className="text-xs font-medium text-warning-600">Le Toucher</p>
            <p className="text-lg font-bold text-warning-700">4</p>
          </div>
          <div className="col-span-1 bg-danger-200/50 border-r border-danger-300/50 hover:bg-danger-300/80">
            <p className="text-xs font-medium text-danger-600">L'Intimité</p>
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
        <button onClick={handleAvancer} className="ad-btn ad-btn-primary">
          <Plus /> Étape suivante
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