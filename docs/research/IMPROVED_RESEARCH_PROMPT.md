# Optimized Research Prompt for Recovery App Development
## Evidence-Based Feature Research with Implementation Focus

---

## 🎯 Context & Constraints

**Project:** 12-Step Recovery Companion PWA (Progressive Web App)  
**Tech Stack:** React + TypeScript + Express + PostgreSQL  
**Architecture:** Privacy-first, local-first with optional cloud sync  
**Target Users:** Individuals in recovery from substance use disorders  
**Current Stage:** MVP complete, planning V2 features  

**Technical Constraints:**
- Must work offline (PWA requirement)
- Bundle size target: <2MB compressed
- Mobile-first design (90% of users on mobile)
- Privacy-first (no tracking without explicit consent)
- Accessibility: WCAG 2.1 AA compliance required

**Budget Constraints:**
- Development: 2 developers, 3-month timeline
- Infrastructure: $100/month max
- No budget for paid APIs (prefer open-source)

---

## 📊 Research Methodology Request

For each topic, please provide:

1. **Evidence Summary** (2-3 sentences)
   - Key research findings with citations
   - Sample size and study quality indicators

2. **Practical Implementation** (bullet points)
   - Specific features that can be built
   - Technical approach (APIs, libraries, algorithms)
   - Estimated complexity (Low/Medium/High)

3. **Success Metrics** (measurable)
   - How to measure if the feature works
   - Expected impact on retention/engagement

4. **Pitfalls to Avoid** (bullet points)
   - Common mistakes in implementation
   - User experience anti-patterns
   - Privacy/ethical concerns

5. **Priority Score** (1-10)
   - Based on: evidence strength + implementation feasibility + user impact

---

## 🔍 Priority Research Topics

### TIER 1: Critical for Retention (Research First)

#### 1. Early Abandonment Prevention
**Context:** 70% of users abandon recovery apps within first week.

**Research Questions:**
- What specific features drive Day 1, Day 3, and Day 7 retention?
- What onboarding patterns have highest completion rates?
- How do successful apps create immediate value?
- What are the top 3 reasons users abandon recovery apps?

**Desired Output:**
```
Feature: [Name]
Evidence: [Study citation, sample size, effect size]
Implementation: 
  - Technical approach: [Specific libraries/APIs]
  - Complexity: [Low/Medium/High]
  - Timeline: [Days/weeks]
Success Metric: [Specific, measurable]
Priority: [1-10]
```

#### 2. Relapse Risk Detection
**Context:** Need to identify users at risk before they relapse.

**Research Questions:**
- What behavioral patterns predict relapse in next 24-72 hours?
- Can passive data (app usage patterns) predict risk?
- What self-reported signals are most predictive?
- How accurate are ML models for relapse prediction?

**Specific Interest:**
- Algorithms that work with limited data (<30 days)
- Privacy-preserving approaches (on-device ML)
- False positive rates (don't want to alarm unnecessarily)

#### 3. Just-in-Time Interventions (JITAI)
**Context:** Delivering support at the right moment.

**Research Questions:**
- What timing strategies are most effective?
- How to balance helpfulness vs. annoyance?
- What types of interventions work in different contexts?
- How to personalize without extensive data?

**Specific Interest:**
- Context-aware notification strategies
- Micro-interventions (<2 minutes to complete)
- Effectiveness of different intervention types (breathing, journaling, calling sponsor)

---

### TIER 2: High-Value Features (Research Second)

#### 4. Gamification That Respects Recovery
**Context:** Need engagement without trivializing recovery.

**Research Questions:**
- What gamification elements work in health apps?
- What approaches are seen as disrespectful in recovery?
- How to balance motivation vs. pressure?
- Do streaks help or harm recovery?

**Specific Interest:**
- Non-competitive gamification
- Intrinsic vs. extrinsic motivation
- Recovery-specific reward systems

#### 5. Social Support Mechanisms
**Context:** Fellowship is core to 12-step programs.

**Research Questions:**
- What makes digital peer support effective?
- How to facilitate sponsor-sponsee relationships remotely?
- What privacy features are essential?
- How to prevent toxic interactions?

**Specific Interest:**
- Asynchronous communication patterns
- Accountability without surveillance
- Anonymous support mechanisms

#### 6. Coping Skills Effectiveness
**Context:** Need to recommend the right coping skill for the situation.

**Research Questions:**
- Which coping skills work best for which situations?
- How to teach coping skills through an app?
- What makes users actually use coping skills vs. just reading about them?
- How to personalize recommendations?

**Specific Interest:**
- Situation-specific recommendations
- Effectiveness tracking
- Adaptive learning algorithms

---

### TIER 3: Nice-to-Have (Research If Time)

#### 7. Mindfulness & Meditation
**Context:** Many recovery programs incorporate mindfulness.

**Research Questions:**
- What duration/frequency is most effective?
- Which techniques work best for addiction recovery?
- How to make meditation "sticky" (regular practice)?

#### 8. Progress Visualization
**Context:** Showing recovery progress motivates users.

**Research Questions:**
- What metrics are most motivating?
- How to visualize progress without creating pressure?
- What data visualizations are most understood?

---

## 🎯 Specific Implementation Questions

### For Each Recommended Feature, Please Include:

**Technical Feasibility:**
- Required APIs/libraries (with links)
- Data requirements (what needs to be tracked)
- Offline capability (can it work without internet?)
- Estimated development time

**Privacy Considerations:**
- What data needs to be collected?
- Can it be done on-device?
- GDPR/HIPAA implications

**User Experience:**
- How intrusive is it? (1-10 scale)
- How much user effort required?
- Mobile vs. desktop considerations

**Evidence Quality:**
- Study type (RCT, observational, meta-analysis)
- Sample size and demographics
- Effect size (Cohen's d or similar)
- Limitations of the research

---

## 📚 Citation Format

Please cite sources in this format:
```
[Author et al., Year] Title. Journal, Volume(Issue), pages. DOI/URL
Sample size: N=XXX
Effect size: d=X.XX or OR=X.XX
Key finding: [One sentence]
```

**Example:**
```
[Gustafson et al., 2014] A smartphone application to support recovery from alcoholism. 
JAMA Psychiatry, 71(5), 566-572. doi:10.1001/jamapsychiatry.2013.4642
Sample size: N=349
Effect size: OR=1.39 for risky drinking days
Key finding: App users had 57% fewer risky drinking days at 12 months.
```

---

## 🚫 What NOT to Include

Please avoid:
- Generic advice ("users want good UX")
- Features without evidence ("I think X would work")
- Overly complex solutions (we're a small team)
- Paid services (unless exceptional value)
- Features that compromise privacy
- Anything requiring server-side ML (we're local-first)

---

## 💡 Bonus: Innovation Opportunities

If you find research on **novel approaches** not commonly used in recovery apps, please highlight them separately:

**Format:**
```
🌟 INNOVATIVE APPROACH: [Name]
Evidence: [Citation]
Why it's different: [Explanation]
Implementation complexity: [Low/Medium/High]
Potential impact: [High/Medium/Low]
```

---

## 📋 Output Format Request

Please structure your response as:

```markdown
# Research Summary: [Topic]

## Evidence Overview
[2-3 paragraph summary of research landscape]

## Top 3 Recommended Features

### Feature 1: [Name]
**Evidence:** [Citation + key findings]
**Implementation:**
- Technical approach: [Specific details]
- Required data: [List]
- Complexity: [Low/Medium/High]
- Timeline: [X days/weeks]

**Success Metrics:**
- Primary: [Specific metric]
- Secondary: [Specific metric]

**Pitfalls:**
- [Specific pitfall 1]
- [Specific pitfall 2]

**Priority Score:** [1-10] because [reasoning]

---

### Feature 2: [Name]
[Same structure]

---

### Feature 3: [Name]
[Same structure]

---

## Implementation Roadmap
1. **Week 1-2:** [Feature X] - [Reasoning]
2. **Week 3-4:** [Feature Y] - [Reasoning]
3. **Week 5-6:** [Feature Z] - [Reasoning]

## Additional Resources
- [Link to relevant library/API]
- [Link to implementation example]
- [Link to research paper]
```

---

## 🎯 Example Query (Use This Format)

**For Tier 1, Topic 1 (Early Abandonment Prevention):**

```
Research early abandonment prevention in recovery apps:

1. What features drive Day 1, Day 3, and Day 7 retention?
2. What onboarding patterns have highest completion rates?
3. How do successful apps create immediate value?
4. What are the top 3 reasons users abandon recovery apps?

For each finding:
- Provide citation with sample size and effect size
- Suggest specific implementable feature
- Estimate complexity (Low/Medium/High)
- Provide success metric
- Rate priority (1-10)

Focus on:
- Evidence from RCTs or large observational studies
- Features implementable in 2-4 weeks
- Privacy-preserving approaches
- Mobile-first solutions

Avoid:
- Generic UX advice
- Features requiring paid APIs
- Server-side ML solutions
- Anything compromising privacy
```

---

## 🔄 Iterative Research Process

**Phase 1: Broad Research** (Use this prompt)
- Get overview of all topics
- Identify highest-priority features
- Understand evidence landscape

**Phase 2: Deep Dive** (Follow-up prompts)
- "Tell me more about [specific feature]"
- "What are implementation details for [feature]?"
- "What are alternatives to [approach]?"

**Phase 3: Validation** (Final prompts)
- "What could go wrong with [feature]?"
- "How do I measure success of [feature]?"
- "What are privacy implications of [feature]?"

---

## 📊 Success Criteria for Research Output

Good research output will:
- ✅ Cite 3+ peer-reviewed studies per topic
- ✅ Provide specific implementation details
- ✅ Include measurable success metrics
- ✅ Acknowledge limitations and risks
- ✅ Prioritize based on evidence + feasibility
- ✅ Consider privacy and ethics
- ✅ Be actionable (can start building immediately)

Poor research output will:
- ❌ Cite only blog posts or opinion pieces
- ❌ Provide vague suggestions ("improve UX")
- ❌ Ignore implementation complexity
- ❌ Recommend features without evidence
- ❌ Ignore privacy concerns
- ❌ Be too theoretical (can't implement)

---

## 🚀 Ready-to-Use Prompts

### Prompt 1: Early Abandonment Prevention
```
I'm building a recovery companion app (React PWA, privacy-first, offline-capable). 
70% of users abandon within first week.

Research early abandonment prevention:
1. What features drive Day 1, 3, and 7 retention? (cite studies with N and effect size)
2. What onboarding patterns have highest completion rates?
3. How do successful health apps create immediate value?
4. What are top 3 reasons users abandon recovery apps?

For each finding:
- Cite peer-reviewed research (format: [Author, Year], N=X, effect size)
- Suggest specific implementable feature (with tech stack: React, TypeScript)
- Estimate complexity (Low: <1 week, Medium: 1-2 weeks, High: 2-4 weeks)
- Provide measurable success metric
- Rate priority (1-10) based on evidence + feasibility + impact

Constraints:
- Must work offline (PWA)
- Privacy-first (no tracking without consent)
- Mobile-first (90% mobile users)
- Small team (2 devs, 3-month timeline)
- No paid APIs

Focus on features implementable in 2-4 weeks with strong evidence (RCTs or N>100).
```

### Prompt 2: Relapse Risk Detection
```
I need to detect relapse risk in a recovery app (React PWA, privacy-first).

Research relapse prediction:
1. What behavioral patterns predict relapse in 24-72 hours? (cite studies)
2. Can passive data (app usage) predict risk? (accuracy rates)
3. What self-reported signals are most predictive?
4. What on-device ML approaches work with limited data (<30 days)?

For each approach:
- Cite research (format: [Author, Year], N=X, accuracy/AUC)
- Describe algorithm/approach (specific enough to implement)
- List required data points
- Provide false positive/negative rates
- Estimate complexity (Low/Medium/High)
- Rate priority (1-10)

Constraints:
- Must run on-device (privacy)
- Limited data (<30 days of history)
- Can't be too sensitive (avoid alarm fatigue)
- Mobile-first (limited compute)

Focus on privacy-preserving approaches with published accuracy metrics.
```

### Prompt 3: Just-in-Time Interventions
```
I need to deliver timely interventions in a recovery app (React PWA).

Research JITAI (Just-in-Time Adaptive Interventions):
1. What timing strategies are most effective? (cite studies with effect sizes)
2. How to balance helpfulness vs. annoyance? (optimal frequency)
3. What intervention types work in different contexts?
4. How to personalize without extensive data?

For each strategy:
- Cite research (format: [Author, Year], N=X, effect size)
- Describe implementation (specific algorithms/rules)
- Provide optimal timing/frequency
- List required context data
- Estimate complexity (Low/Medium/High)
- Rate priority (1-10)

Constraints:
- Must respect quiet hours
- Can't be too frequent (max 3-5/day)
- Must work offline
- Privacy-first (on-device logic)

Focus on micro-interventions (<2 min) with strong evidence from health apps.
```

---

## 📈 Expected Outcomes

After using these prompts, you should have:

1. **Prioritized Feature List**
   - Top 10 features ranked by evidence + feasibility
   - Clear implementation roadmap
   - Estimated timelines

2. **Technical Specifications**
   - Required APIs/libraries
   - Data models
   - Algorithm descriptions
   - Privacy considerations

3. **Success Metrics**
   - How to measure each feature
   - Expected impact on retention
   - A/B testing strategies

4. **Risk Assessment**
   - What could go wrong
   - How to mitigate risks
   - Privacy/ethical concerns

5. **Research Bibliography**
   - 20-30 peer-reviewed citations
   - Links to implementation examples
   - Additional resources

---

## 🎓 Why This Prompt is Better

**Compared to Original Prompt:**

| Aspect | Original | Improved |
|--------|----------|----------|
| **Scope** | 15 broad topics | 3 tiers, focused priorities |
| **Context** | Missing | Detailed constraints |
| **Output Format** | Unspecified | Structured template |
| **Actionability** | Low | High (ready to implement) |
| **Prioritization** | None | Evidence + feasibility scoring |
| **Technical Detail** | Vague | Specific (libraries, APIs) |
| **Success Metrics** | Missing | Required for each feature |
| **Constraints** | None | Budget, timeline, tech stack |
| **Citation Format** | Loose | Standardized with effect sizes |
| **Iterative Process** | No | 3-phase approach |

**Key Improvements:**

1. **Focused Scope:** 3 critical topics instead of 15
2. **Context-Rich:** Includes tech stack, constraints, current state
3. **Actionable:** Specific enough to start building immediately
4. **Prioritized:** Clear ranking system (1-10)
5. **Measurable:** Success metrics for each feature
6. **Realistic:** Considers budget, timeline, team size
7. **Structured:** Consistent output format
8. **Iterative:** Supports follow-up questions
9. **Quality-Focused:** Emphasizes peer-reviewed research
10. **Implementation-Ready:** Includes technical details

---

## 🔧 Customization Guide

To adapt this prompt for your specific needs:

1. **Update Context Section:**
   - Your tech stack
   - Your constraints
   - Your current stage

2. **Adjust Priority Tiers:**
   - Move topics between tiers
   - Add/remove topics
   - Change focus areas

3. **Modify Output Format:**
   - Add/remove sections
   - Change citation style
   - Adjust detail level

4. **Set Your Constraints:**
   - Budget limits
   - Timeline
   - Team size
   - Technical limitations

5. **Define Success Metrics:**
   - What matters to you
   - How you measure success
   - Your KPIs

---

## 📞 Support & Iteration

If research output isn't meeting your needs:

**Too Vague?**
→ "Provide more specific implementation details for [feature]"

**Too Complex?**
→ "Simplify [feature] for a 2-person team with 2-week timeline"

**Missing Evidence?**
→ "Provide additional citations for [claim]"

**Wrong Focus?**
→ "Focus on [specific aspect] instead of [current focus]"

**Need Alternatives?**
→ "What are alternatives to [approach] that are [simpler/cheaper/faster]?"

---

## ✅ Checklist Before Submitting Prompt

- [ ] Context section filled out completely
- [ ] Constraints clearly specified
- [ ] Priority topics identified
- [ ] Output format defined
- [ ] Success criteria established
- [ ] Citation format specified
- [ ] Technical details requested
- [ ] Privacy considerations mentioned
- [ ] Timeline/budget constraints included
- [ ] Specific questions formulated

---

**Ready to use!** Copy the "Ready-to-Use Prompts" section and paste into ChatGPT/Claude for immediate, actionable research results.
