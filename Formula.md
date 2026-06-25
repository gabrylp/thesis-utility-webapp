# Thesis Utility App — Mathematical Formulas

## Group H — Microplastic Sampling Robot
### USC CPE Department

---

## 1. Flow Rate Calculations

### 1.1 Without Flow Sensor (Manual)

$$ \text{Flow Rate (L/h)} = \frac{V_{ml} \times 3.6}{t_s} $$

- $V_{ml}$ = volume collected (mL)
- $t_s$ = elapsed time (seconds)

**Derivation:** $\displaystyle \frac{V_{ml}}{1000} \div \frac{t_s}{3600} = \frac{V_{ml} \times 3.6}{t_s}$

### 1.2 With Flow Sensor (YF-S201 Hall-Effect)

$$ \text{Flow Rate (L/h)} = \frac{P \times 3600}{K \times t_s} $$

- $P$ = total pulse count
- $K$ = sensor K-factor (pulses per liter, default 450)
- $t_s$ = elapsed time (seconds)

**Derivation:** $\displaystyle \text{Volume (L)} = \frac{P}{K}$, then $\displaystyle \frac{P}{K} \div \frac{t_s}{3600} = \frac{P \times 3600}{K \times t_s}$

---

## 2. Volume Projection

### 2.1 Point Estimate

$$ V_{proj} = \bar{Q} \times t_{target} $$

- $\bar{Q}$ = mean flow rate (L/h)
- $t_{target}$ = target projection time (hours)

### 2.2 Confidence Interval

$$ \Delta V_{proj} = \text{MoE}_{\bar{Q}} \times \sqrt{\frac{t_{target}}{t_{actual}}} $$

$$ \text{MoE}_{\bar{Q}} = t_{0.025, df} \times \frac{s}{\sqrt{n}} $$

95% CI: $V_{proj} \pm \Delta V_{proj}$

---

## 3. Welch's t-Test (Sensor vs No Sensor)

$$ t = \frac{\bar{x}_1 - \bar{x}_2}{\sqrt{\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}}} $$

$$ df = \frac{\left(\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}\right)^2}{\frac{(s_1^2/n_1)^2}{n_1 - 1} + \frac{(s_2^2/n_2)^2}{n_2 - 1}} $$

$$ p = 2 \times I\left(\frac{df}{df + t^2} \;\middle|\; \frac{df}{2},\; 0.5\right) $$

where $I(x | a, b)$ is the **regularized incomplete beta function**.

**Decision ($\alpha = 0.05$):**

| Condition | Conclusion |
|-----------|-----------|
| $p \ge 0.05$ | No significant difference — sensor does NOT reduce flow rate |
| $p < 0.05$ | Significant difference — sensor affects flow rate |

---

## 4. Descriptive Statistics

| Metric | Formula |
|--------|---------|
| Mean | $\bar{x} = \frac{1}{n}\sum x_i$ |
| Variance | $s^2 = \frac{1}{n-1}\sum (x_i - \bar{x})^2$ |
| Std Dev | $s = \sqrt{s^2}$ |
| CoV | $CV = (s / \bar{x}) \times 100\%$ |
| MoE (95%) | $\text{MoE} = t_{0.025} \times s / \sqrt{n}$ |

---

## 5. System Performance Targets (Thesis)

| Metric | Formula | Target |
|--------|---------|--------|
| Sampling Rate | $Q = V \times 3.6 / t_s$ | $\ge 1000$ L/h |
| Endurance | Measured runtime | $\ge 1.5$ h |
| Control Range | Measured max distance | $\ge 100$ m |
| Latency | $\bar{L} = \frac{1}{n}\sum L_i$ | $\le 1000$ ms |
| Roll Stability | $\sigma_\theta$ | $\le 13.10^\circ$ |

---

## 6. YF-S201 Flow Sensor Calibration

$$ K_{calibrated} = \frac{P_{measured}}{V_{measured}} \times 1000 $$

- Default K-factor: **450 pulses/L**
- Range: 1–30 L/min (60–1800 L/h)
- Output: 5V square wave, 50% duty cycle

---

*Implemented in Thesis Utility App v1.0 — Formulas rendered in LaTeX notation*
