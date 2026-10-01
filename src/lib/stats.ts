export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
}

export function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  return values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1);
}

export function stdDev(values: number[]): number {
  return Math.sqrt(variance(values));
}

export function marginOfError(values: number[]): number {
  if (values.length < 2) return 0;
  return 1.96 * (stdDev(values) / Math.sqrt(values.length));
}

export function coeffOfVariation(values: number[]): number {
  const m = mean(values);
  if (m === 0) return 0;
  return (stdDev(values) / m) * 100;
}

export function min(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.min(...values);
}

export function max(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values);
}

export interface StatsResult {
  n: number;
  mean: number;
  median: number;
  stdDev: number;
  variance: number;
  coeffOfVar: number;
  marginOfError: number;
  min: number;
  max: number;
}

export function computeStats(values: number[]): StatsResult {
  return {
    n: values.length,
    mean: mean(values),
    median: median(values),
    stdDev: stdDev(values),
    variance: variance(values),
    coeffOfVar: coeffOfVariation(values),
    marginOfError: marginOfError(values),
    min: min(values),
    max: max(values),
  };
}

export function formatNum(n: number, decimals = 2): string {
  return n.toFixed(decimals);
}

export function formatDispersion(n: number, value: number, decimals = 2): string {
  return n < 2 ? "—" : value.toFixed(decimals);
}

export interface TTestResult {
  tStat: number;
  df: number;
  pValue: number;
  significant: boolean;
  groupA: { mean: number; stdDev: number; n: number };
  groupB: { mean: number; stdDev: number; n: number };
}

export function independentTTest(groupA: number[], groupB: number[]): TTestResult {
  const n1 = groupA.length;
  const n2 = groupB.length;
  const m1 = mean(groupA);
  const m2 = mean(groupB);
  const v1 = variance(groupA);
  const v2 = variance(groupB);
  const se = Math.sqrt(v1 / n1 + v2 / n2);
  const t = se === 0 ? 0 : (m1 - m2) / se;
  const df = (v1 / n1 + v2 / n2) ** 2 / ((v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1));
  const x = df / (df + t * t);

  // Two-tailed p for Welch's t-test is exactly the regularized incomplete beta
  // I_x(df/2, 1/2) with x = df/(df + t^2) -- it already accounts for both tails,
  // so it must NOT be doubled.
  //
  // It must also not be evaluated as 1 - I_x(...): in the far tail I_x rounds to
  // exactly 1.0, that subtraction cancels to 0, and the clamp turns the largest
  // measurable effect into p = 1 ("no difference"). So evaluate whichever tail is
  // genuinely small and return it directly.
  let p: number;
  if (!isFinite(x) || x <= 0) {
    p = 0;
  } else if (x >= 1) {
    p = 1;
  } else {
    const a = df / 2;
    const mid = (a + 1) / (a + 1.5);
    p = x < mid ? betainc(x, a, 0.5) : 1 - betainc(x, a, 0.5);
    if (!isFinite(p) || p < 0) p = 1;
    if (p > 1) p = 1;
  }

  return {
    tStat: t,
    df: isNaN(df) ? 0 : df,
    pValue: p,
    significant: p < 0.05,
    groupA: { mean: m1, stdDev: Math.sqrt(v1), n: n1 },
    groupB: { mean: m2, stdDev: Math.sqrt(v2), n: n2 },
  };
}

function betainc(x: number, a: number, b: number): number {
  if (x < 0 || x > 1) return 0;
  if (x === 0 || x === 1) return x;
  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) {
    return bt * betacf(x, a, b) / a;
  }
  return 1 - bt * betacf(1 - x, b, a) / b;
}

function betacf(x: number, a: number, b: number): number {
  const fpmin = 1e-30;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - qab * x / qap;
  if (Math.abs(d) < fpmin) d = fpmin;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 100; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-10) break;
  }
  return h;
}

function logGamma(x: number): number {
  const coef = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += coef[j]! / y;
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

export function computeFlowRate(method: "with_sensor" | "without_sensor", timeSec: number, volumeMl: number, pulses: number, kFactor: number): number {
  if (timeSec <= 0) return 0;
  if (method === "without_sensor") {
    return (volumeMl * 3.6) / timeSec;
  }
  if (pulses <= 0 || kFactor <= 0) return 0;
  return (pulses * 3600) / (kFactor * timeSec);
}

export function projectVolume(avgFlowRate: number, targetHours: number, actualHours: number, moe: number): { volume: number; moe: number; lower: number; upper: number } {
  const vol = avgFlowRate * targetHours;
  const projMoe = targetHours > 0 && actualHours > 0 ? moe * Math.sqrt(targetHours / actualHours) : 0;
  return { volume: vol, moe: projMoe, lower: Math.max(0, vol - projMoe), upper: vol + projMoe };
}

export interface PPLResult {
  perReading: { index: number; ppl: number; pulses: number; volumeMl: number }[];
  calibratedPPL: number;
  stdDev: number;
  coeffOfVar: number;
  n: number;
}

export function computePPL(readings: { pulses: number; volume_ml: number }[]): PPLResult {
  const valid = readings.filter((r) => r.pulses > 0 && r.volume_ml > 0);
  const perReading = valid.map((r, i) => ({
    index: i,
    ppl: r.pulses / (r.volume_ml / 1000),
    pulses: r.pulses,
    volumeMl: r.volume_ml,
  }));
  const pplValues = perReading.map((r) => r.ppl);
  const s = computeStats(pplValues);
  return {
    perReading,
    calibratedPPL: s.mean,
    stdDev: s.stdDev,
    coeffOfVar: s.coeffOfVar,
    n: s.n,
  };
}

export interface AggregatePPLResult {
  ppl: number;
  avgPulses: number;
  avgVolumeMl: number;
  totalPulses: number;
  totalVolumeMl: number;
  n: number;
}

export function computeAggregatePPL(readings: { pulses: number; volume_ml: number }[]): AggregatePPLResult {
  const valid = readings.filter((r) => r.pulses > 0 && r.volume_ml > 0);
  const n = valid.length;
  if (n === 0) return { ppl: 0, avgPulses: 0, avgVolumeMl: 0, totalPulses: 0, totalVolumeMl: 0, n: 0 };
  const totalPulses = valid.reduce((s, r) => s + r.pulses, 0);
  const totalVolumeMl = valid.reduce((s, r) => s + r.volume_ml, 0);
  const avgPulses = totalPulses / n;
  const avgVolumeMl = totalVolumeMl / n;
  // Ratio of means (== ratio of totals) rather than the mean of per-reading
  // ratios: every reading contributes in proportion to its volume, so a short
  // low-flow trial is not weighted the same as a long one.
  const ppl = totalVolumeMl > 0 ? totalPulses / (totalVolumeMl / 1000) : 0;
  return { ppl, avgPulses, avgVolumeMl, totalPulses, totalVolumeMl, n };
}

export interface SensorResistanceResult {
  withSensorMean: number;
  withoutSensorMean: number;
  resistanceFactor: number;
  volumeLossPct: number;
  withSensorN: number;
  withoutSensorN: number;
}

export function computeSensorResistance(
  withSensorFlowRates: number[],
  withoutSensorFlowRates: number[]
): SensorResistanceResult {
  const wsMean = mean(withSensorFlowRates);
  const wosMean = mean(withoutSensorFlowRates);
  const rf = wosMean > 0 ? wsMean / wosMean : 0;
  return {
    withSensorMean: wsMean,
    withoutSensorMean: wosMean,
    resistanceFactor: rf,
    volumeLossPct: (1 - rf) * 100,
    withSensorN: withSensorFlowRates.length,
    withoutSensorN: withoutSensorFlowRates.length,
  };
}

export function estimateVolumeFromPulses(pulses: number, ppl: number): number {
  if (ppl <= 0) return 0;
  return (pulses / ppl) * 1000;
}

export function volumeErrorPct(estimatedMl: number, actualMl: number): number | null {
  if (estimatedMl <= 0 || actualMl <= 0) return null;
  return ((estimatedMl - actualMl) / actualMl) * 100;
}

export interface FlowSeries {
  pulse: number[];
  actual: number[];
}

export function buildFlowSeries<T extends { pulses: number; volume_ml: number; time_sec: number }>(
  readings: T[],
  kFactor: number
): FlowSeries {
  const pulse: number[] = [];
  const actual: number[] = [];
  for (const r of readings) {
    if (r.time_sec <= 0) continue;
    if (r.pulses > 0) {
      const q = computeFlowRate("with_sensor", r.time_sec, r.volume_ml, r.pulses, kFactor);
      if (q > 0) pulse.push(q);
    }
    if (r.volume_ml > 0) {
      const q = computeFlowRate("without_sensor", r.time_sec, r.volume_ml, r.pulses, kFactor);
      if (q > 0) actual.push(q);
    }
  }
  return { pulse, actual };
}

export function countPairedRows(readings: { pulses: number; volume_ml: number; time_sec: number }[]): number {
  return readings.filter((r) => r.time_sec > 0 && r.pulses > 0 && r.volume_ml > 0).length;
}

export function computeElapsedMin(readings: { time_sec: number }[]): { testNum: number; elapsedMin: number }[] {
  let cumulative = 0;
  return readings.map((r, idx) => {
    cumulative += r.time_sec;
    return { testNum: idx + 1, elapsedMin: cumulative / 60 };
  });
}

export function linearExtrapolate(data: { x: number; y: number }[], targetX: number, numPoints = 5): number {
  if (data.length === 0) return 0;
  const subset = data.slice(-numPoints);
  if (subset.length <= 1) return subset[0]!.y;
  const n = subset.length;
  const sumX = subset.reduce((s, p) => s + p.x, 0);
  const sumY = subset.reduce((s, p) => s + p.y, 0);
  const sumXY = subset.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = subset.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return subset[n - 1]!.y;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return intercept + slope * targetX;
}
