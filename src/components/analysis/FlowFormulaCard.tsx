import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  kFactor: number;
  onChange: (k: number) => void;
}

export function FlowFormulaCard({ kFactor, onChange }: Props) {
  return (
    <Card className="bg-secondary/20">
      <CardContent className="p-4 space-y-3">
        <p className="text-sm font-medium">Flow Rate Formula</p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-black/30 p-3 font-mono text-xs leading-relaxed">
            <p className="text-green-400 font-semibold text-sm mb-1">Without Sensor</p>
            <p className="text-muted-foreground">Q (L/h) = (Volume_mL × 3.6) / Time_s</p>
          </div>
          <div className="rounded-lg bg-black/30 p-3 font-mono text-xs leading-relaxed">
            <p className="text-blue-400 font-semibold text-sm mb-1">With Sensor</p>
            <p className="text-muted-foreground">Q (L/h) = (Pulses × 3600) / (K × Time_s)</p>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-1">
          <Label htmlFor="kfactor" className="text-xs text-muted-foreground whitespace-nowrap">
            YF-S201 K-factor (pulses/L):
          </Label>
          <Input
            id="kfactor"
            type="number"
            value={kFactor}
            onChange={(e) => onChange(parseFloat(e.target.value) || 420)}
            className="w-24 h-8 text-sm font-mono"
            step={1}
            min={1}
          />
          <span className="text-[10px] text-muted-foreground">Default: 420</span>
        </div>
      </CardContent>
    </Card>
  );
}
