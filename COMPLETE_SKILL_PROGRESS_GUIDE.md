# SKILL PROGRESS TRACKING SYSTEM
## Complete Guide with Formulas & Examples

---

# TABLE OF CONTENTS

1. Executive Summary
2. The Two Progress Metrics
3. Complete Example: Arun Kumar
4. How to Interpret Status
5. Implementation Details

---

# SECTION 1: EXECUTIVE SUMMARY

## What This System Does

Measures skill development using **two complementary metrics**:

1. **Expected Progress** - Where employees SHOULD be based on timeline
2. **Actual Progress** - Where employees ACTUALLY are based on performance

Together, they show if employees are on track, behind, or ahead of schedule.

---

# SECTION 2: THE TWO PROGRESS METRICS

## METRIC 1: EXPECTED PROGRESS (Timeline-Based)

**Question**: "Based on the timeline, where should the employee be?"

### Formula
```
Expected Progress = Average(Days Elapsed / Total Days × 100%)
                    across all skill levels
```

### Why Multiple Levels?
Employees learn skills in stages:
- L1: Fundamentals
- L2: Intermediate
- L3: Advanced
- L4: Expert
- L5: Mastery

Each level has its own timeline, so we **average across all assigned levels**.

### Example
For Arun on Feb 15 (31 days into 60-day timeline):
- L1: (31/17) × 100 = 100% (completed)
- L2: (31/31) × 100 = 100% (on time)
- L3: (31/59) × 100 = 53% (midway)
- **Average = 84%**

---

## METRIC 2: ACTUAL PROGRESS (Performance-Based)

**Question**: "Based on real performance, where are they?"

### Formula
```
Actual Progress = (Training × 30%) + (Assignment × 40%) + (Feedback × 30%)
```

### Three Components

#### Component 1: Training Attendance (30%)
- **What it measures**: Did they show up?
- **Scoring**: 100% if attended, 0% if not
- **Why**: Can't learn if you don't attend
- **Contribution**: 100% × 0.30 = **30%**

#### Component 2: Assignment Scores (40%)
- **What it measures**: What do quizzes/assignments show?
- **Scoring**: Average of all submissions (0-100)
- **Why**: Direct proof of knowledge (MOST IMPORTANT)
- **Contribution**: Score × 0.40 = **40% of total**

#### Component 3: Manager Feedback (30%)
- **What it measures**: Can they apply it in real work?
- **Scoring**: Average of 1-5 ratings converted to 0-100%
- **Why**: Shows real-world application ability
- **Contribution**: (Rating/5) × 100 × 0.30 = **30%**

---

# SECTION 3: COMPLETE EXAMPLE - ARUN KUMAR

## The Situation

| Detail | Value |
|--------|-------|
| **Employee** | Arun Kumar (ENG045) |
| **Skill** | JavaScript |
| **Levels** | L1, L2, L3 |
| **Start Date** | Jan 15, 2025 |
| **Target Date** | Mar 15, 2025 |
| **Total Days** | 60 days |
| **Today** | Feb 15, 2025 |
| **Days Elapsed** | 31 days |
| **Days Remaining** | 29 days |

---

## STEP 1: CALCULATE EXPECTED PROGRESS

### Level-by-Level Timeline

**JavaScript L1 (Fundamentals)**
```
Timeline: Jan 15 → Feb 1 (17 days)
Elapsed:  31 days (capped at 17)
Expected: (17/17) × 100 = 100% ✅
```

**JavaScript L2 (Intermediate)**
```
Timeline: Jan 15 → Feb 15 (31 days)
Elapsed:  31 days
Expected: (31/31) × 100 = 100% ✅
```

**JavaScript L3 (Advanced)**
```
Timeline: Jan 15 → Mar 15 (59 days)
Elapsed:  31 days
Expected: (31/59) × 100 = 53% ⏳
```

### Calculate Average
```
Expected = (100 + 100 + 53) / 3
         = 253 / 3
         = 84.3%
         ≈ 84% (rounded)
```

**Result**: Arun SHOULD be 84% complete by Feb 15

---

## STEP 2: CALCULATE ACTUAL PROGRESS

### Component 1: Training Attendance (30%)

**Data**:
- L1 Training: ✅ Attended
- L2 Training: ✅ Attended
- L3 Training: ❌ Did not attend

**Score**: 100% (attended at least one training)

**Contribution**: 
```
100% × 0.30 = 30%
```

---

### Component 2: Assignment Scores (40%)

**Data**:

| Level | Assignment 1 | Assignment 2 | Average |
|-------|-------------|-------------|---------|
| L1 | 88% | 92% | 90% |
| L2 | 82% | 85% | 83.5% |
| L3 | 75% | 78% | 76.5% |

**Score**: 
```
(90 + 83.5 + 76.5) / 3 = 250 / 3 = 83.3% ≈ 83%
```

**Contribution**: 
```
83% × 0.40 = 33.2%
```

---

### Component 3: Manager Feedback (30%)

**Data** (Manager ratings on 1-5 scale):

| Dimension | L1 | L2 | L3 | Average |
|-----------|----|----|----|---------| 
| Application of Training | 4 | 3 | 2 | 3.0 |
| Quality of Deliverables | 5 | 4 | 3 | 4.0 |
| Problem Solving | 4 | 3 | 2 | 3.0 |
| Productivity/Independence | 5 | 4 | 3 | 4.0 |
| Process Compliance | 4 | 4 | 3 | 3.67 |
| Overall Performance | 5 | 4 | 3 | 4.0 |

**Calculation**:
```
All ratings: [4,3,2,5,4,3,4,3,2,5,4,3,4,4,3,5,4,3]
Sum: 65
Count: 18
Average rating: 65 / 18 = 3.61

Convert to percentage: (3.61 / 5) × 100 = 72.2% ≈ 72%
```

**Contribution**: 
```
72% × 0.30 = 21.6%
```

---

## STEP 3: FINAL ACTUAL PROGRESS

```
Actual = 30% + 33.2% + 21.6%
       = 84.8%
       ≈ 85% (rounded)
```

**Result**: Arun IS ACTUALLY 85% complete

---

## COMPARISON & STATUS

| Metric | Value | Meaning |
|--------|-------|---------|
| **Expected** | 84% | Where timeline says he should be |
| **Actual** | 85% | Where he really is based on performance |
| **Difference** | +1% | Slightly ahead of schedule |
| **Status** | ✅ **ON TRACK** | Continue as planned |

---

## VISUAL REPRESENTATION

```
EXPECTED PROGRESS (Timeline):
Expected: [████████████████░░░░░░░░░░░░] 84%  (Light Blue)

ACTUAL PROGRESS (Performance):
Actual:   [████████████████░░░░░░░░░░░░░] 85%  (Deep Blue)

COMPARISON:
Both are nearly equal - Arun is ON TRACK! ✅
```

---

## KEY INSIGHTS ABOUT ARUN

### ✅ Strengths
1. **Excellent Attendance**: Attended 2 out of 3 trainings
2. **Strong Assignments**: 83% average across all levels
3. **Good Overall Performance**: 3.6/5 average rating
4. **On Timeline**: 85% actual vs 84% expected

### ⚠️ Areas for Development
1. **L3 Performance**: Noticeably lower (76.5% assignments, 3.0 avg feedback)
2. **Advanced Concepts**: Struggled more with L3 material
3. **Manager Feedback**: While 3.6/5 is good, L3 ratings were 2-3

### 📋 Recommendations
1. **Assign L3 Mentor**: Provide additional support for advanced topics
2. **Schedule Practice Sessions**: Extra practice on L3 concepts
3. **Follow-up Assessment**: Re-assess L3 on March 1st
4. **Continue Current Support**: Overall trajectory is excellent

---

# SECTION 4: HOW TO INTERPRET STATUS

## Status Determination

### ✅ ON TRACK
**When**: Actual ≥ Expected AND Actual < 100%

**What it means**: Employee is performing as per timeline expectations

**Action**: Continue regular support and monitoring

**Arun's case**: 85% ≥ 84% → **ON TRACK** ✅

---

### ⚠️ BEHIND
**When**: Actual < Expected OR (Past target date AND Actual < 100%)

**What it means**: Employee is lagging behind the expected timeline

**Action**: Provide additional support
- Assign mentor
- Increase tutoring
- Extend timeline if needed
- Increase monitoring frequency

**Example**: If Arun's actual was 75% → BEHIND (75% < 84%)

---

### 🏆 COMPLETED
**When**: Actual ≥ 100%

**What it means**: Employee has fully mastered the skill

**Action**: 
- Certify competency
- Assign next skill
- Consider expert role

**Example**: If Arun's actual was 100% → COMPLETED

---

### ⏳ NOT STARTED
**When**: Actual = 0% AND Today < Assignment Start Date

**What it means**: Training hasn't officially begun yet

**Action**: No immediate action needed; prepare materials

**Example**: If today was Jan 10 (before Jan 15 start) → NOT STARTED

---

# SECTION 5: IMPLEMENTATION DETAILS

## Backend Implementation

### New Utility Function
**File**: `backend/app/utils.py`

```python
def calculate_weighted_actual_progress(
    training_attended: bool,
    assignment_score: Optional[int],
    manager_feedback_ratings: list
) -> int:
    """
    Calculates weighted actual progress.
    
    Components:
    - Training (30%): 100 if attended, 0 if not
    - Assignment (40%): Score 0-100
    - Feedback (30%): Average rating 1-5 converted to %
    """
    training = (100 if training_attended else 0) * 0.30
    assignment = (assignment_score or 0) * 0.40
    
    feedback = 0
    if manager_feedback_ratings:
        avg = sum(manager_feedback_ratings) / len(manager_feedback_ratings)
        feedback = (avg / 5 * 100) * 0.30
    
    return int(round(min(100, max(0, training + assignment + feedback))))
```

### API Response
**Endpoint**: `GET /data/engineer/skills-with-assignments`

**Response includes**:
```json
{
  "skill": "JavaScript",
  "current_expertise": "L2",
  "target_expertise": "L4",
  "weighted_actual_progress": 85,
  "assignment_start_date": "2025-01-15",
  "target_completion_date": "2025-03-15"
}
```

---

## Frontend Implementation

### Component Update
**File**: `engineer-dashboard.component.ts` and `manager-dashboard.component.ts`

```typescript
getSkillProgress(competency: Skill | ModalSkill): number {
  // Return weighted actual progress from backend
  return (competency as any).weighted_actual_progress || 0;
}
```

### Color Scheme
- **Expected Progress Bar**: Light Blue (sky-300 to sky-400)
- **Actual Progress Bar**: Deep Blue (blue-600 to blue-700)
- Both are from same color family - professional and non-clashing

---

## Data Sources

### Training Attendance
- **Table**: `TrainingAttendance`
- **Field**: `attended` (boolean)
- **Condition**: If ANY training attended = 100%

### Assignment Scores
- **Table**: `AssignmentSubmission`
- **Field**: `score` (0-100)
- **Aggregation**: Average all submissions

### Manager Feedback
- **Table**: `ManagerPerformanceFeedback`
- **Fields**:
  - application_of_training
  - quality_of_deliverables
  - problem_solving_capability
  - productivity_independence
  - process_compliance_adherence
  - overall_performance
- **Aggregation**: Average all ratings, convert (avg/5)×100

---

# QUICK REFERENCE TABLE

| What | Where | How Calculated |
|------|-------|-----------------|
| **Expected Progress** | Timeline | Days elapsed / Total days × 100% (averaged) |
| **Training (30%)** | TrainingAttendance | 0 or 100% based on attendance |
| **Assignment (40%)** | AssignmentSubmission | Average of all scores (0-100) |
| **Feedback (30%)** | ManagerPerformanceFeedback | Average ratings (1-5) → (avg/5)×100 |
| **Final Actual** | Weighted Combo | Training×0.3 + Assignment×0.4 + Feedback×0.3 |
| **Status** | Comparison | Actual vs Expected determines status |

---

# MANAGER QUICK Q&A

**Q: Why is Arun 85% if training isn't finished?**
A: Because 85% is his mastery level based on real performance, not completion. He understands 85% of the material.

**Q: What if actual is lower than expected?**
A: He's "Behind" - needs more support. Check which component is lowest (training/assignment/feedback) and focus there.

**Q: How often should we check?**
A: Weekly monitoring, formal re-assessment at key milestones (weekly/monthly).

**Q: What if he reaches 100%?**
A: He's "Completed" - certify the skill and assign next one.

**Q: Can we adjust the 30/40/30 weights?**
A: Yes, but 40% for assignments makes sense since that's direct knowledge proof.

---

# SUMMARY

## The Complete Picture

```
EXPECTED (Timeline):  84%  ← Where Arun should be
ACTUAL (Performance): 85%  ← Where Arun really is

85% ≥ 84% = ✅ ON TRACK

Training:   100% (Attended sessions)
Assignment: 83%  (Quiz scores)
Feedback:   72%  (Manager ratings)
= 85% Total Competency
```

## Key Takeaway

Arun is **performing slightly ahead of schedule**. His attendance and assignments are strong. His L3 performance needs focus. **Recommendation**: Continue training with enhanced L3 mentoring.

---

# END OF DOCUMENT

**For questions**, refer to:
- Formulas: Section 2
- Example: Section 3  
- Status meanings: Section 4
- Technical details: Section 5

**Version**: 1.0  
**Date**: December 16, 2025  
**Status**: Ready for Production ✅

---
