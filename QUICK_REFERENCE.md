# Quick Reference: Progress Calculation Formulas

## 🎯 The Two Metrics (One-Page Summary)

### 1️⃣ EXPECTED PROGRESS (Timeline-Based)

**Question**: *Where should the employee be by today?*

$$\text{Expected} = \text{Average}\left(\frac{\text{Days Since Start}}{\text{Total Training Days}} \times 100\%\right)$$

**Example:**
```
Started: Jan 15 | Target: Mar 15 (60 days total)
Today: Feb 15 (31 days elapsed)

Expected = (31 / 60) × 100 = 52%

But averaged across 3 skill levels:
L1: (31/17) = 100% (already completed)
L2: (31/31) = 100% (on schedule)  
L3: (31/59) = 53%  (midway)
Average = (100+100+53)/3 = 84%
```

---

### 2️⃣ ACTUAL PROGRESS (Performance-Based)

**Question**: *What is the employee actually achieving?*

$$\text{Actual} = (\text{Training} \times 0.30) + (\text{Assignment} \times 0.40) + (\text{Feedback} \times 0.30)$$

**Example:**
```
Training:   Attended = 100% × 0.30 = 30%
Assignment: Average score = 83% × 0.40 = 33%
Feedback:   Avg rating 3.6/5 = 72% × 0.30 = 22%
                                    TOTAL = 85%
```

---

## 📊 Status Interpretation

| Expected | Actual | Status | Meaning |
|----------|--------|--------|---------|
| 84% | 85% | ✅ **ON TRACK** | Ahead of schedule |
| 84% | 75% | ⚠️ **BEHIND** | Lagging behind |
| — | 100% | 🏆 **COMPLETED** | Fully mastered |
| — | 0% | ⏳ **NOT STARTED** | Not yet begun |

---

## 💪 Three Components of Actual Progress

### Component 1: Training Attendance (30%)
- Did they show up? **YES = 100%, NO = 0%**
- Example: Attended training → 100%

### Component 2: Assignment Scores (40%)  
- How well did they perform? **Average of all submissions (0-100)**
- Example: Scores 85%, 87%, 80% → Average 84%

### Component 3: Manager Feedback (30%)
- What does manager say? **Average rating (1-5) → convert to %**
- Example: Ratings [4, 3, 4, 5] → Avg 4.0 → (4/5)×100 = 80%

---

## 🧮 Real Numbers: Arun's JavaScript Training

### Calculation Steps

**Step 1: Expected Progress**
```
Timeline: Jan 15 → Mar 15 (60 days)
Today: Feb 15 (31 days elapsed)

L1: 100% (completed)
L2: 100% (on time)
L3: 52% (midway)
────────────
Average = 84% EXPECTED
```

**Step 2: Actual Progress**
```
Training Attended:  ✅ = 100%
Assignment Scores:  83%
Manager Feedback:   72% (avg rating 3.6/5)

Calculation:
= (100 × 0.30) + (83 × 0.40) + (72 × 0.30)
= 30 + 33 + 22
= 85% ACTUAL
```

**Step 3: Comparison**
```
Expected: 84%
Actual:   85%
Status:   ✅ ON TRACK (Slightly ahead!)
```

---

## 🔄 Why We Calculate Both

| Metric | Shows | Used For |
|--------|-------|----------|
| **Expected** | Schedule adherence | Detect delays |
| **Actual** | Real performance | Assess competency |

**Together they answer:**
- 📅 Is the employee keeping pace with the timeline?
- 📊 Is the employee actually learning and improving?
- 🎯 Should we adjust the timeline or provide support?

---

## ⚡ Quick Manager Questions Answered

**Q: "Why is Arun 85% if he hasn't finished training?"**  
A: Because 85% is the *actual performance level*, not completion. He's scored well (83% on assignments) and attended training, so he's demonstrating 85% mastery.

**Q: "What if expected is 80% and actual is 70%?"**  
A: He's "BEHIND" - lagging 10% behind schedule. Action needed.

**Q: "What if expected is 60% and actual is 90%?"**  
A: He's "ON TRACK" - actually ahead! Consider early completion.

**Q: "How do I improve actual progress?"**  
A: Focus on the weakest area:
- Low training attendance? → Ensure they attend
- Low assignment scores? → Provide tutoring
- Low feedback? → Manager coaching

---

## 📈 Visual on Dashboard

```
MY SKILLS - JavaScript
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current Level: L2  |  Target: L4

Progress:
Exp: 84% • Act: 85%

Expected: [████████████████░░] 84%  ← Timeline expectation
Actual:   [████████████████░░] 85%  ← Real performance
         
Status: ON TRACK ✅

Training:   100% ✅
Assignment:  83% ✅  
Feedback:    72% ⚠️ (focus area)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ✅ Remember

1. **Expected**: "Based on timeline, where should they be?"
2. **Actual**: "Based on real performance, where are they?"
3. **Status**: Compares the two to give recommendation
4. **Action**: Use the breakdown (training, assignment, feedback) to improve

---

**That's it! Simple, measurable, actionable.** 📊
