"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type CardResponse = "jaime" | "a_discuter" | "pas_maintenant" | "passer";

interface CardItem {
  _id: string;
  prompt: string;
  depth: "leger" | "moyen" | "profond";
  tags: string[];
  isOptional: boolean;
}

interface CardStackProps {
  cards: CardItem[];
  _onCardComplete?: (cardId: string, response: CardResponse) => void;
  onComplete?: () => void;
}

export function CardStack({
  cards,
  _onCardComplete,
  onComplete,
}: CardStackProps) {
  const { t, locale } = useT();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [response, setResponse] = useState<CardResponse | null>(null);

  const depthLabel = (depth: string) => {
    if (depth === "leger") return locale === "en" ? "Light" : "Léger";
    if (depth === "moyen") return locale === "en" ? "Medium" : "Moyen";
    return locale === "en" ? "Deep" : "Profond";
  };

  const currentCard = cards[currentIndex];

  const handleResponse = (cardResponse: CardResponse) => {
    setResponse(cardResponse);
    setTimeout(() => {
      if (cardResponse !== "passer" && currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else if (currentIndex >= cards.length - 1) {
        onComplete?.();
      }
      setResponse(null);
    }, 400);
  };

  if (!currentCard) return null;

  return (
    <div className="relative flex flex-col items-center gap-6">
      {/* Stack effect */}
      {cards.length > 1 && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-0">
          <div className="w-72 h-40 rounded-xl border border-ivory-200/80 bg-card shadow-lg opacity-40" />
        </div>
      )}

      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard._id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Card
              className={cn(
                "p-6 flex flex-col gap-4 transition-all duration-300",
                currentCard.depth === "profond" && "border-gradient-to-br from-coral-200/20 to-lavender-200/20",
              )}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-2 text-xs",
                    currentCard.depth === "leger" && "bg-neutral-500/10 text-neutral-600",
                    currentCard.depth === "moyen" && "bg-lavender-100 text-lavender-700",
                    currentCard.depth === "profond" && "bg-coral-100 text-coral-700",
                  )}
                >
                  {depthLabel(currentCard.depth)}
                </Button>
                {currentCard.isOptional && (
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs bg-neutral-500/10 text-neutral-600">
                    {t("cards.optional")}
                  </Button>
                )}
              </motion.div>

              {/* Prompt */}
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-lg font-medium leading-relaxed"
              >
                {currentCard.prompt}
              </motion.h3>

              {/* Response buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-2 mt-auto"
              >
                <Button
                  variant="ghost"
                  className="gap-1"
                  onClick={() => handleResponse("jaime")}
                  disabled={!!response}
                >
                  ❤️ {t("cards.jaime")}
                </Button>

                <Button
                  variant="ghost"
                  className="gap-1"
                  onClick={() => handleResponse("a_discuter")}
                  disabled={!!response}
                >
                  💬 {t("cards.a_discuter")}
                </Button>

                <Button
                  variant="ghost"
                  className="gap-1"
                  onClick={() => handleResponse("pas_maintenant")}
                  disabled={!!response}
                >
                  ⏰ {t("cards.pas_maintenant")}
                </Button>

                <Button
                  variant="outline"
                  className="gap-1"
                  onClick={() => handleResponse("passer")}
                  disabled={!!response}
                >
                  ⏭️ {t("cards.passer")}
                </Button>
              </motion.div>

              {/* Progress */}
              {cards.length > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center justify-between text-xs text-muted-foreground"
                >
                  <span>
                    {currentIndex + 1} / {cards.length}
                  </span>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
