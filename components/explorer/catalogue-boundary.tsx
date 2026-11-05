"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Filet de sécurité du catalogue : une requête qui échoue ne doit jamais
 * laisser un grand bloc vide. On explique et on propose de réessayer.
 */
export class CatalogueBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <Card tone="lavender" className="flex flex-col items-center gap-3 p-7 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-coral-100 text-coral-600">
            <AlertTriangle className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium">
              Le catalogue n&apos;a pas pu se charger.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Votre connexion est peut-être instable. Rien n&apos;est perdu :
              vous pouvez réessayer ou revenir à l&apos;accueil.
            </p>
          </div>
          <Button type="button" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="size-4" />
            Réessayer
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}
