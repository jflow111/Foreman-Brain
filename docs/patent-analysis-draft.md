# Foreman Brain — Patent Analysis Draft
**Prepared:** March 2026
**Status:** Draft — For Review Only
**Note:** This is an internal analysis only. This document does not constitute legal advice. Consult a registered patent attorney before filing any patent application.

---

## 1. Overview of the Invention

Foreman Brain is an AI-powered electrical estimating system that combines multiple novel technical capabilities:

- Natural language job description input
- AI reasoning trained on electrical code (NEC + California CEC Title 24)
- Computer vision analysis of job site photographs for estimating context
- Voice input for hands-free field operation
- Automated material takeoff generation with small parts inclusion
- Multi-store price comparison and contractor price override
- Customer-ready proposal generation
- PWA (Progressive Web App) installable on mobile devices

---

## 2. Potentially Patentable Elements

### 2.1 Core Method — AI Electrical Estimating from Natural Language
**Description:** A computer-implemented method for generating electrical material takeoffs and labor estimates from unstructured natural language job descriptions, wherein the AI system applies jurisdiction-specific electrical code logic (NEC and CEC) to determine conductor sizing, circuit protection requirements, and complete material lists including small consumable parts.

**Novelty argument:** Existing estimating tools require structured form input or item selection from catalogs. This invention accepts plain English and applies code logic automatically — no prior art known to combine natural language processing with electrical code reasoning for estimating.

**Claim type:** Method claim (process patent)

---

### 2.2 Computer Vision Integration for Field Estimating
**Description:** A system and method for augmenting electrical estimates by analyzing job site photographs using computer vision, wherein the analysis identifies electrical panel brand, condition, load capacity, potential code violations, and construction conditions, and automatically incorporates these findings into the estimate scope and material list.

**Novelty argument:** No known prior art combines field photography with AI code-aware electrical estimating. The photo-to-estimate pipeline is a novel workflow.

**Claim type:** System claim + method claim

---

### 2.3 Voice-Activated Field Estimating System
**Description:** A method for generating electrical estimates through voice input in field conditions, wherein spoken job descriptions are transcribed and processed through an electrical code-aware AI estimating engine, enabling hands-free operation by contractors on active job sites.

**Novelty argument:** Voice input for estimating tools is not novel on its own. However, combined with the AI electrical code reasoning engine, the combination may be patentable as a unique application.

**Claim type:** Method claim (weaker — likely dependent on 2.1)

---

### 2.4 Jurisdiction-Specific Code Overlay System
**Description:** A system for dynamically applying jurisdiction-specific electrical code amendments (e.g., California Title 24, CEC) on top of base NEC requirements during automated estimate generation, wherein the system defaults to the stricter of applicable code requirements and flags jurisdiction-specific items in the output.

**Novelty argument:** No known estimating system applies multi-layer code logic (federal + state + local) automatically. This is a strong differentiator.

**Claim type:** System claim + method claim

---

### 2.5 Multi-Source Price Comparison in Automated Takeoffs
**Description:** A system for real-time or near-real-time price comparison across multiple electrical supply sources (retail and wholesale) within an automatically generated material takeoff, with contractor-level price override capability and automatic recalculation of marked-up totals.

**Novelty argument:** Moderately novel. Price comparison tools exist but not integrated into an AI-generated code-compliant takeoff system.

**Claim type:** System claim

---

## 3. Prior Art Concerns

The following existing products may constitute prior art and should be reviewed by a patent attorney:

| Product | Overlap | Risk Level |
|---|---|---|
| ServiceTitan | Estimating + proposals | Low — no AI or NEC logic |
| Jobber | Field service estimating | Low — no electrical code |
| PlanSwift | Takeoff software | Low — requires drawings |
| Trimble Estimation | Electrical estimating | Medium — review needed |
| ProEst | Construction estimating | Low — not AI-driven |
| ChatGPT / Claude | AI reasoning | Low — not domain-specific |

**Key differentiator from all above:** None of the above combine NEC/CEC code reasoning + natural language input + computer vision + voice input in a single mobile-first system.

---

## 4. Patent Strategy Recommendation

### Option A — Utility Patent (Full Protection)
- **Cost:** $10,000 — $15,000 with a patent attorney
- **Timeline:** 2-3 years for approval
- **Protection:** 20 years from filing date
- **Best claims to file:** 2.1 (core method) and 2.2 (photo analysis)

### Option B — Provisional Patent Application
- **Cost:** $1,500 — $3,000 with attorney, or $320 USPTO fee if self-filed
- **Timeline:** File within days
- **Protection:** Establishes "patent pending" status for 12 months
- **Recommended:** File provisional NOW to establish priority date, then pursue full utility patent once revenue supports it

### Option C — Trade Secret Protection (No Patent)
- **Cost:** $0
- **Protection:** Indefinite, as long as kept secret
- **Risk:** Competitors can independently develop similar systems
- **Best for:** System prompt content, pricing algorithms, proprietary training data

---

## 5. Recommended Immediate Actions

1. **Do not publicly disclose technical implementation details** — public disclosure before filing starts a 1-year clock in the US (and immediately bars international patents)
2. **Document everything with dates** — keep timestamped records of development (GitHub commit history already serves this purpose)
3. **File a provisional patent application** — establishes priority date cheaply while you build revenue
4. **Consult a registered patent attorney** — specifically one with software/AI patent experience
5. **Consider trade secret protection** for the system prompt and code reasoning logic as a complement to patent protection

---

## 6. Strongest Patent Claims Summary

In order of patentability strength:

1. **AI + NEC/CEC Code Reasoning from Natural Language** — strongest, most novel
2. **Computer Vision + Field Photo → Code-Aware Estimate** — strong, highly novel combination
3. **Jurisdiction-Specific Code Overlay (NEC + State amendments)** — strong
4. **Voice Input + Code-Aware Estimating Engine** — moderate
5. **Multi-Source Price Comparison in AI Takeoff** — moderate

---

## 7. Resources

- USPTO Provisional Application: https://www.uspto.gov/patents/apply
- USPTO Patent Center: https://patentcenter.uspto.gov
- Find a Patent Attorney: https://www.uspto.gov/learning-and-resources/patent-and-trademark-attorneys
- USPTO Filing Fee (Provisional, Micro Entity): ~$320

---

*This document is a preliminary internal analysis only and does not constitute legal advice. The patentability of any invention requires a formal prior art search and analysis by a registered patent attorney or agent.*
