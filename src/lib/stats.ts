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
  const p = 2 * (1 - betainc(x, df / 2, 0.5));

  return {
    tStat: t,
    df: isNaN(df) ? 0 : df,
    pValue: isNaN(p) ? 1 : Math.min(p, 1),
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
