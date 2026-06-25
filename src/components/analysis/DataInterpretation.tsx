import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, AlertCircle, Info, ChevronDown, ChevronRight } from "lucide-react";

export interface Insight {
  icon: "check" | "warning" | "alert" | "info";
  text: string;
}

interface Props {
  title?: string;
  insights: Insight[];
}

const ICONS = {
  check: { Icon: CheckCircle, color: "text-green-400" },
  warning: { Icon: AlertTriangle, color: "text-yellow-400" },
  alert: { Icon: AlertCircle, color: "text-red-400" },
  info: { Icon: Info, color: "text-blue-400" },
} as const;

const BORDER_COLORS = {
  check: "border-green-500/20",
  warning: "border-yellow-500/20",
  alert: "border-red-500/20",
  info: "border-blue-500/20",
} as const;

export function DataInterpretation({ title = "Data Interpretation", insights }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  if (insights.length === 0) return null;

  const hasWarning = insights.some((i) => i.icon === "warning");
  const hasAlert = insights.some((i) => i.icon === "alert");
  const borderColor = hasAlert ? BORDER_COLORS.alert : hasWarning ? BORDER_COLORS.warning : BORDER_COLORS.check;

  return (
    <Card className={`border ${borderColor}`}>
      <CardHeader className="pb-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 w-full text-left hover:opacity-80 transition-opacity"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </button>
      </CardHeader>
      {!collapsed && (
        <CardContent className="pt-0">
          <ul className="space-y-2">
            {insights.map((insight, i) => {
              const { Icon, color } = ICONS[insight.icon];
              return (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                  <span className="text-muted-foreground leading-relaxed">{insight.text}</span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
