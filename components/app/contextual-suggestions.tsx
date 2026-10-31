"use client";

import { useState, useEffect } from "react";
import { Sparkles, Coffee, Star, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/surface";

interface Suggestion {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  href: string;
}

export function ContextualSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    
    const suggestionList: Suggestion[] = [
      {
        id: "evening",
        icon: <Coffee className="h-4 w-4" />,
        title: "Moment détente",
        description: "Une expérience calme pour vous relaxer ensemble",
        action: "Explorer",
        href: "/explorer?filter=calme",
      },
      {
        id: "quick",
        icon: <Star className="h-4 w-4" />,
        title: "Mini-jeu",
        description: "Quelques minutes pour vous reconnecter",
        action: "Jouer",
        href: "/explorer?duration=10",
      },
      {
        id: "deep",
        icon: <Heart className="h-4 w-4" />,
        title: "Moment complice",
        description: "Approfondissez votre connexion",
        action: "Découvrir",
        href: "/explorer?depth=profond",
      },
    ];

    if (hour >= 6 && hour < 12) {
      suggestionList.unshift({
        id: "morning",
        icon: <Sparkles className="h-4 w-4" />,
        title: "Démarrer la journée",
        description: "Un petit moment pour commencer ensemble",
        action: "Commencer",
        href: "/explorer?time=morning",
      });
    } else if (hour >= 18 || hour < 6) {
      suggestionList.unshift({
        id: "night",
        icon: <Sparkles className="h-4 w-4" />,
        title: "Moment soirée",
        description: "Raviver la flamme avant de dormir",
        action: "Profiter",
        href: "/explorer?time=night",
      });
    }

    setSuggestions(suggestionList.slice(0, 3));
    setInitialized(true);
  }, []);

  if (!initialized || suggestions.length === 0) return null;

  return (
    <section className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-coral-500/10 to-lavender-500/10 rounded-2xl blur-2xl" />
      <SectionTitle
        eyebrow="Suggestions"
        title="Moments pour vous"
      />
      <div className="relative space-y-3">
        {suggestions.map((sug, i) => (
          <Card
            key={sug.id}
            className="group relative overflow-hidden bg-gradient-to-r from-white/5 to-white/2 p-4 transition-transform hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
                {sug.icon}
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{sug.title}</p>
                <p className="text-xs text-white/70">{sug.description}</p>
              </div>
              <a
                href={sug.href}
                className="rounded-full bg-white/10 px-3 py-1 text-xs text-white transition-colors group-hover:bg-white/20"
              >
                {sug.action}
              </a>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
