import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { projectVolume } from "@/lib/stats";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Props {
  avgFlowRate: number;
  actualHours: number;
  moe: number;
}

export function ProjectionCard({ avgFlowRate, actualHours, moe }: Props) {
  const [targetHours, setTargetHours] = useState(1);
  const [showFormula, setShowFormula] = useState(false);

  const proj = projectVolume(avgFlowRate, targetHours, actualHours, moe);
  const scale = actualHours > 0 ? Math.sqrt(targetHours / actualHours) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Volume Projection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3 text-center text-sm font-mono">
          <div className="rounded-lg border border-border p-2">
            <p className="text-[10px] text-muted-foreground">Avg Flow Rate</p>
            <p className="font-semibold text-blue-400">{avgFlowRate.toFixed(1)} L/h</p>
          </div>
          <div className="rounded-lg border border-border p-2">
            <p className="text-[10px] text-muted-foreground">Actual Duration</p>
            <p className="font-semibold text-muted-foreground">{(actualHours * 60).toFixed(0)} min</p>
          </div>
          <div className="rounded-lg border border-border p-2">
            <p className="text-[10px] text-muted-foreground">MoE of Mean</p>
            <p className="font-semibold text-yellow-400">±{moe.toFixed(2)} L/h</p>
          </div>
        </div>

        <div className="flex items-end gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Project to (hours)</Label>
            <Input
              type="number"
              value={targetHours}
              onChange={(e) => setTargetHours(Math.max(0.1, parseFloat(e.target.value) || 1))}
              className="w-24 h-8 font-mono text-sm"
              step={0.25}
              min={0.1}
            />
          </div>
        </div>

        <div className="rounded-lg bg-primary/10 border border-primary/30 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            Projected Volume at {targetHours}h
          </p>
          <p className="text-2xl font-bold text-primary">{proj.volume.toFixed(1)} L</p>
          <p className="text-xs text-muted-foreground mt-1">
            95% CI: {proj.lower.toFixed(1)} L – {proj.upper.toFixed(1)} L
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowFormula(!showFormula)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showFormula ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {showFormula ? "Hide formula" : "Show formula"}
          </button>
          {showFormula && (
            <div className="mt-2 rounded-lg border border-border bg-secondary/20 p-3 font-mono text-xs space-y-1.5 text-muted-foreground">
              <p><span className="text-foreground">Projected Volume</span> = Avg Flow Rate × Target Hours</p>
              <p className="pl-4">= {avgFlowRate.toFixed(1)} × {targetHours.toFixed(1)}</p>
              <p className="pl-4">= <span className="text-primary font-semibold">{proj.volume.toFixed(1)} L</span></p>
              <div className="border-t border-border/50 my-1.5" />
              <p><span className="text-foreground">MoE Scaling</span> = √(Target / Actual)</p>
              <p className="pl-4">= √({targetHours.toFixed(1)} / {actualHours.toFixed(1)})</p>
              <p className="pl-4">= {scale.toFixed(3)}</p>
              <p><span className="text-foreground">Scaled MoE</span> = {moe.toFixed(2)} × {scale.toFixed(3)}</p>
              <p className="pl-4">= <span className="text-yellow-400 font-semibold">±{proj.moe.toFixed(2)} L</span></p>
              <div className="border-t border-border/50 my-1.5" />
              <p><span className="text-foreground">95% CI</span> = {proj.volume.toFixed(1)} ± {proj.moe.toFixed(1)} L</p>
              <p className="pl-4">= [{proj.lower.toFixed(1)} L, {proj.upper.toFixed(1)} L]</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
