import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Droplets, Activity, BarChart3, Beaker, FlaskConical, Radio, Zap,
  BookOpen, Database, Cpu,
} from "lucide-react";

interface FormulaDef {
  name: string;
  formula: string;
  variables: { sym: string; desc: string }[];
  usedIn: string;
  significance: string;
}

interface Section {
  title: string;
  icon: React.ElementType;
  color: string;
  formulas: FormulaDef[];
}

const SECTIONS: Section[] = [
  {
    title: "Flow Rate",
    icon: Droplets,
    color: "text-green-400",
    formulas: [
      {
        name: "Flow Rate (Without Sensor)",
        formula: "Q = (V × 3.6) / t",
        variables: [
          { sym: "Q", desc: "Flow rate (L/h)" },
          { sym: "V", desc: "Volume collected (mL)" },
          { sym: "t", desc: "Time elapsed (s)" },
        ],
        usedIn: "Flow Rate tab, RunDetail",
        significance:
          "Measures flow rate by directly measuring accumulated water volume over time. Used as the ground truth when no flow sensor is present.",
      },
      {
        name: "Flow Rate (With Sensor)",
        formula: "Q = (P × 3600) / (K × t)",
        variables: [
          { sym: "Q", desc: "Flow rate (L/h)" },
          { sym: "P", desc: "Pulse count from sensor" },
          { sym: "K", desc: "K-factor (pulses per liter)" },
          { sym: "t", desc: "Time elapsed (s)" },
        ],
        usedIn: "Flow Rate tab, RunDetail",
        significance:
          "Estimates flow rate from the hall-effect sensor's pulse output. The K-factor (default 440 pulses/L for YF-S201) converts pulses to volume. Must be calibrated for accuracy.",
      },
    ],
  },
  {
    title: "PPL Calibration",
    icon: FlaskConical,
    color: "text-blue-400",
    formulas: [
      {
        name: "Pulses Per Liter (per reading)",
        formula: "PPL = P / (V / 1000)",
        variables: [
          { sym: "PPL", desc: "Pulses per liter for this reading" },
          { sym: "P", desc: "Pulse count" },
          { sym: "V", desc: "Volume collected (mL)" },
        ],
        usedIn: "Sensor t-Test tab",
        significance:
          "Computes the actual PPL for a single calibration test by comparing pulse output against a known measured volume. Multiple readings are averaged for the calibrated value.",
      },
      {
        name: "Calibrated PPL",
        formula: "PPL_cal = mean(PPL₁, PPL₂, ..., PPLₙ)",
        variables: [
          { sym: "PPL_cal", desc: "Calibrated pulses per liter" },
          { sym: "PPLᵢ", desc: "PPL from each calibration reading" },
          { sym: "n", desc: "Number of calibration readings" },
        ],
        usedIn: "Sensor t-Test tab",
        significance:
          "The mean PPL across all calibration readings. Use this as the K-factor in your TestRun settings. Higher n and lower CoV indicate a more reliable calibration.",
      },
      {
        name: "Volume from Pulses",
        formula: "V = (P / PPL) × 1000",
        variables: [
          { sym: "V", desc: "Estimated volume (mL)" },
          { sym: "P", desc: "Pulse count" },
          { sym: "PPL", desc: "Calibrated pulses per liter" },
        ],
        usedIn: "RunDetail (Est. Vol column)",
        significance:
          "Converts sensor pulse output into estimated water volume using the calibrated PPL. Enables volume estimation in long-duration tests (e.g., 1-hour) where manual water collection is impractical.",
      },
    ],
  },
  {
    title: "Descriptive Statistics",
    icon: BarChart3,
    color: "text-purple-400",
    formulas: [
      {
        name: "Mean (Arithmetic Average)",
        formula: "x̄ = Σxᵢ / n",
        variables: [
          { sym: "x̄", desc: "Sample mean" },
          { sym: "xᵢ", desc: "Individual observation" },
          { sym: "n", desc: "Sample size" },
        ],
        usedIn: "All stat cards and interpretation panels",
        significance:
          "The central value of a dataset. Used as the primary measure of flow rate, power consumption, and signal strength across all analysis tabs.",
      },
      {
        name: "Median",
        formula: "median = middle value of sorted x",
        variables: [
          { sym: "n odd", desc: "Value at position (n+1)/2" },
          { sym: "n even", desc: "Average of values at n/2 and n/2+1" },
        ],
        usedIn: "FlowStats",
        significance:
          "The middle value that separates the higher half from the lower half. More robust to outliers than the mean — useful when a single bad reading skews the average.",
      },
      {
        name: "Variance (Sample)",
        formula: "s² = Σ(xᵢ - x̄)² / (n - 1)",
        variables: [
          { sym: "s²", desc: "Sample variance" },
          { sym: "x̄", desc: "Sample mean" },
          { sym: "n", desc: "Sample size" },
        ],
        usedIn: "FlowStats, CommStats, t-test",
        significance:
          "Measures how spread out the data is from the mean. Uses n-1 (Bessel's correction) for an unbiased estimate of the population variance. Foundation for standard deviation and t-test.",
      },
      {
        name: "Standard Deviation",
        formula: "s = √s²",
        variables: [
          { sym: "s", desc: "Sample standard deviation" },
          { sym: "s²", desc: "Sample variance" },
        ],
        usedIn: "FlowStats, CommStats, t-test, MoE",
        significance:
          "The square root of variance, expressed in the same units as the data. Indicates the typical distance of a data point from the mean. Used to compute margin of error.",
      },
      {
        name: "Coefficient of Variation",
        formula: "CV = (s / x̄) × 100%",
        variables: [
          { sym: "CV", desc: "Coefficient of variation (%)" },
          { sym: "s", desc: "Standard deviation" },
          { sym: "x̄", desc: "Mean" },
        ],
        usedIn: "All Data Interpretation panels",
        significance:
          "Normalized measure of dispersion. Allows comparison of consistency across datasets with different scales. Thresholds: <5% excellent, <10% good, <20% fair, >20% poor.",
      },
      {
        name: "Margin of Error (95% CI)",
        formula: "MoE = 1.96 × s / √n",
        variables: [
          { sym: "MoE", desc: "Margin of error" },
          { sym: "s", desc: "Standard deviation" },
          { sym: "n", desc: "Sample size" },
          { sym: "1.96", desc: "Z-score for 95% confidence" },
        ],
        usedIn: "FlowStats, Projection tab",
        significance:
          "Half-width of the 95% confidence interval. Indicates the range within which the true population mean likely falls. Decreases with larger sample size (√n relationship).",
      },
    ],
  },
  {
    title: "Sensor Resistance Analysis",
    icon: Beaker,
    color: "text-yellow-400",
    formulas: [
      {
        name: "Resistance Factor",
        formula: "RF = x̄_with / x̄_without",
        variables: [
          { sym: "RF", desc: "Resistance factor (dimensionless)" },
          { sym: "x̄_with", desc: "Mean flow rate with sensor" },
          { sym: "x̄_without", desc: "Mean flow rate without sensor" },
        ],
        usedIn: "Sensor t-Test tab",
        significance:
          "Quantifies the hydraulic resistance introduced by the flow sensor. RF < 1 means the sensor reduces flow. In deployment (without sensor), actual flow is higher by 1/RF.",
      },
      {
        name: "Volume Loss Percentage",
        formula: "Loss = (1 - RF) × 100%",
        variables: [
          { sym: "Loss", desc: "Volume loss due to sensor (%)" },
          { sym: "RF", desc: "Resistance factor" },
        ],
        usedIn: "Sensor t-Test tab",
        significance:
          "Expresses sensor resistance as a percentage of flow reduction. If Loss = 8%, the sensor causes an 8% decrease in measured volume compared to the true (no-sensor) flow.",
      },
    ],
  },
  {
    title: "Statistical Testing (Welch's t-test)",
    icon: FlaskConical,
    color: "text-red-400",
    formulas: [
      {
        name: "t-statistic",
        formula: "t = (x̄₁ - x̄₂) / √(s₁²/n₁ + s₂²/n₂)",
        variables: [
          { sym: "t", desc: "t-statistic" },
          { sym: "x̄₁, x̄₂", desc: "Group means" },
          { sym: "s₁², s₂²", desc: "Group variances" },
          { sym: "n₁, n₂", desc: "Group sample sizes" },
        ],
        usedIn: "Sensor t-Test tab",
        significance:
          "Measures how many standard errors apart the two group means are. Larger |t| indicates a greater difference between with-sensor and without-sensor flow rates.",
      },
      {
        name: "Degrees of Freedom (Welch–Satterthwaite)",
        formula:
          "df = (s₁²/n₁ + s₂²/n₂)² / [(s₁²/n₁)²/(n₁-1) + (s₂²/n₂)²/(n₂-1)]",
        variables: [
          { sym: "df", desc: "Effective degrees of freedom" },
          { sym: "s²", desc: "Group variance" },
          { sym: "n", desc: "Group sample size" },
        ],
        usedIn: "Sensor t-Test tab",
        significance:
          "Adjusts degrees of freedom when groups have unequal variances. More accurate than the pooled t-test for real-world data where variance differs between methods.",
      },
      {
        name: "p-value",
        formula: "p = 2 × (1 - I_x(df/2, 0.5))",
        variables: [
          { sym: "p", desc: "Two-tailed p-value" },
          { sym: "I_x", desc: "Regularized incomplete beta function" },
          { sym: "x", desc: "df / (df + t²)" },
        ],
        usedIn: "Sensor t-Test tab",
        significance:
          "The probability of observing a difference as extreme as the data if the null hypothesis (no difference) is true. p < 0.05 → reject null → sensor has a significant effect on flow rate.",
      },
    ],
  },
  {
    title: "Volume Projection",
    icon: BarChart3,
    color: "text-cyan-400",
    formulas: [
      {
        name: "Projected Volume",
        formula: "V = Q_avg × T_target",
        variables: [
          { sym: "V", desc: "Projected volume (L)" },
          { sym: "Q_avg", desc: "Average flow rate (L/h)" },
          { sym: "T_target", desc: "Target duration (hours)" },
        ],
        usedIn: "Projection tab",
        significance:
          "Linear extrapolation of measured flow rate to predict total volume over a longer duration. Assumes constant flow rate — uncertainty increases with extrapolation distance.",
      },
      {
        name: "MoE Scaling Factor",
        formula: "scale = √(T_target / T_actual)",
        variables: [
          { sym: "scale", desc: "MoE scaling factor" },
          { sym: "T_target", desc: "Target duration (hours)" },
          { sym: "T_actual", desc: "Actual test duration (hours)" },
        ],
        usedIn: "Projection tab",
        significance:
          "Scales the margin of error proportionally to the square root of the extrapolation ratio. Doubling the target duration increases MoE by ~41% (√2), reflecting growing uncertainty.",
      },
      {
        name: "95% Confidence Interval (Projected)",
        formula: "CI = V ± MoE × scale",
        variables: [
          { sym: "CI", desc: "95% confidence interval (L)" },
          { sym: "V", desc: "Projected volume (L)" },
          { sym: "MoE", desc: "Margin of error from measured data" },
          { sym: "scale", desc: "MoE scaling factor" },
        ],
        usedIn: "Projection tab",
        significance:
          "The range within which the true accumulated volume is expected to fall with 95% confidence. Wider intervals indicate less certainty — collect more data or test for longer to narrow.",
      },
    ],
  },
  {
    title: "Power",
    icon: Zap,
    color: "text-amber-400",
    formulas: [
      {
        name: "Electrical Power",
        formula: "P = V × I",
        variables: [
          { sym: "P", desc: "Power (Watts)" },
          { sym: "V", desc: "Voltage (Volts)" },
          { sym: "I", desc: "Current (Amperes)" },
        ],
        usedIn: "Power tab",
        significance:
          "Instantaneous power consumption of the microplastic sampling robot's subsystems. Used to estimate battery life and power supply requirements for field deployment.",
      },
    ],
  },
];

export default function References() {
  const [tab, setTab] = useState("formulas");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          References
        </h2>
        <p className="text-sm text-muted-foreground">
          Formulas, definitions, and reference material for the thesis utility app.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="formulas">
            <FlaskConical className="h-4 w-4 mr-1.5" />
            Formulas
          </TabsTrigger>
          <TabsTrigger value="dictionary">
            <Database className="h-4 w-4 mr-1.5" />
            Data Dictionary
          </TabsTrigger>
          <TabsTrigger value="equipment">
            <Cpu className="h-4 w-4 mr-1.5" />
            Equipment Specs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="formulas" className="space-y-6 mt-6">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${section.color}`} />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.formulas.map((f) => (
                    <div key={f.name} className="rounded-lg border border-border p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium">{f.name}</p>
                        <Badge variant="outline" className="text-[10px] shrink-0">{f.usedIn}</Badge>
                      </div>

                      <div className="rounded-md bg-black/30 dark:bg-black/40 p-3 font-mono text-sm text-green-400 tracking-wide">
                        {f.formula}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
                        {f.variables.map((v) => (
                          <div key={v.sym} className="flex gap-1.5">
                            <span className="font-mono font-semibold text-foreground">{v.sym}</span>
                            <span className="text-muted-foreground">= {v.desc}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-2">
                        {f.significance}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="dictionary" className="mt-6">
          <Card>
            <CardContent className="py-12 text-center">
              <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Data Dictionary coming soon.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Will document all database fields, their types, units, and valid ranges.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="mt-6">
          <Card>
            <CardContent className="py-12 text-center">
              <Cpu className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Equipment Specs coming soon.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Will document sensor datasheets, operating ranges, and calibration specs.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
