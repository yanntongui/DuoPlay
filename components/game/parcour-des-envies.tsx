"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Badge, TableCard } from "@/components/admin/ui";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type Zone = "depart" | "decouverte" | "complicite" | "romantisme" | "sensations" | "rapprochement" | "notre-moment";

const numberFormat = new Intl.NumberFormat("fr-FR");

function getZoneLabel(zone: Zone): string {
  const labels: Record<Zone, string> = {
    depart: "Départ",
    decouverte: "Découverte",
    complicite: "Complicité",
    romantisme: "Romantisme",
    sensations: "Sensations",
    rapprochement: "Rapprochement",
    "notre-moment": "Notre moment",
  };
  return labels[zone];
}

function getZoneTone(zone: Zone): "positive" | "neutral" | "warning" | "danger" | "plum" {
  const tones: Record<Zone, "positive" | "neutral" | "warning" | "danger" | "plum"> = {
    depart: "positive",
    decouverte: "positive",
    complicite: "positive",
    romantisme: "plum",
    sensations: "warning",
    rapprochement: "danger",
    "notre-moment": "positive",
  };
  return tones[zone];
}

export function ParcoursDesEnviesBoard() {
  const [zone, setZone] = useState<Zone>("depart");
  const [caseIndex, setCaseIndex] = useState(0);
  const [rollCount, setRollCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const data = useQuery(api["parcour-des-envies"].cards, {
    zone,
    deviceToken: undefined,
  });

  const avancerCase = useMutation(api["parcour-des-envies"].avancerCase);
  const validerDefi = useMutation(api["parcour-des-envies"].validerDefi);
  const passerDefi = useMutation(api["parcour-des-envies"].passerDefi);

  useEffect(() => {
    setRollCount(0);
  }, [zone]);

  const isLoading = data === undefined;
  const cards = (data?.cards as any[]) || [];
  const totalCount = data?.totalCount || 0;

  const handleLancerDes = async () => {
    try {
      const result = await avancerCase({ currentZone: zone });
      setCaseIndex(result.newCaseIndex);
      setZone(result.newZone);
      setRollCount(prev => prev + 1);
      setToast(`Case ${getZoneLabel(result.newZone)}.`);
    } catch (err) {
      setToast("Erreur lors de l'avancement.");
      console.error(err);
    }
  };

  const handleValider = async (cardId: string) => {
    try {
      await validerDefi({ cardId, zone });
      setToast("Défi relevé.");
    } catch (err) {
      setToast("Erreur lors de la validation.");
      console.error(err);
    }
  };

  const handlePasser = async (cardId: string) => {
    try {
      await passerDefi({ cardId, zone });
      setToast("Défi passé.");
    } catch (err) {
      setToast("Erreur lors du passage.");
      console.error(err);
    }
  };

  const zonesDisplay = [
    { zone: "depart" as Zone, label: "Départ", order: 1 },
    { zone: "decouverte" as Zone, label: "Découverte", order: 2 },
    { zone: "complicite" as Zone, label: "Complicité", order: 3 },
    { zone: "romantisme" as Zone, label: "Romantisme", order: 4 },
    { zone: "sensations" as Zone, label: "Sensations", order: 5 },
    { zone: "rapprochement" as Zone, label: "Rapprochement", order: 6 },
    { zone: "notre-moment" as Zone, label: "Notre moment", order: 7 },
  ];

  return (
    <TableCard>
      <div className="h-64 border rounded-2xl overflow-hidden bg-gradient-to-b from-lavender-100 to-coral-50">
        <div className="grid grid-cols-7">
          {zonesDisplay.map((z) => (
            <div
              key={z.zone}
              className={`col-span-1 bg-${getZoneTone(z.zone)}-200/50 border-r border-${getZoneTone(z.zone)}-300/50 hover:bg-${getZoneTone(z.zone)}-300/80`}
            >
              <p className="text-xs font-medium text-${getZoneTone(z.zone)}-600">{z.label}</p>
              <p className="text-lg font-bold text-${getZoneTone(z.zone)}-700">{z.order}</p>
            </div>
          ))}
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white/90 shadow-lg">
          <Badge tone="plum">💑</Badge>
        </div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white text-lavender-500 text-xs font-bold">
          {zone.charAt(0).toUpperCase() + zone.slice(1)}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center">
        <button onClick={handleLancerDes} className="ad-btn ad-btn-primary">
          <Plus /> Lancer le dé
        </button>
      </div>

      {toast && (
        <div className="mt-4">
          {toast}
        </div>
      )}

      {isLoading ? (
        <p className="mt-4 text-center text-[12.5px] ad-muted">Chargement des cartes...</p>
      ) : cards.length === 0 ? (
        <p className="mt-4 text-center text-[12.5px] ad-muted">Aucune carte pour cette zone. Lancer le dé pour en générer.</p>
      ) : (
        <div className="mt-6">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-[12.5px] font-medium ad-ink">Zone actuelle : {getZoneLabel(zone)}</p>
            <p className="text-[12.5px] ad-faint">Case {caseIndex + 1} sur {totalCount}</p>
            
            {cards.length > 0 && (
              <div className="bg-white/90 rounded-xl p-6 max-w-md w-full">
                <h3 className="text-[13px] font-medium text-lavender-600 mb-4">Défi du moment</h3>
                <p className="text-[12.5px] leading-relaxed">{cards[0].titre || "Défi"}</p>
                <p className="text-[11px] text-lavender-500 mb-4">{cards[0].description || "Description du défi"}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleValider(cards[0].id)}
                    className="ad-btn ad-btn-outline ad-btn-small"
                  >
                    Relever
                  </button>
                  <button
                    onClick={() => handlePasser(cards[0].id)}
                    className="ad-btn ad-btn-small"
                  >
                    Passer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </TableCard>
  );
}