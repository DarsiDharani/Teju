# 🎯 Weighted Actual Progress - Quick Reference

## Final Formula

```
Weighted Actual Progress = (Training × 30%) + (Assignment × 40%) + (Feedback × 30%)
```

---

## Component Breakdown

| Component | Weightage | Data Source | Range | Formula |
|-----------|-----------|-------------|-------|---------|
| **Training Completion** | 30% | TrainingAttendance | 0-100% | Attended=100%, Not=0% |
| **Assignment Score** | 40% | AssignmentSubmission | 0-100% | Direct score / Avg if multiple |
| **Manager Feedback** | 30% | ManagerPerformanceFeedback | 0-100% | (Avg_Rating / 5) × 100 |

---

## Real-World Examples

### ✅ Example 1: Full Completion
```
Training:   100% × 0.30 = 30%
Assignment:  95% × 0.40 = 38%
Feedback:    95% × 0.30 = 28.5%
─────────────────────────────
TOTAL:                   96.5% ≈ 97%

STATUS: On Track or Completed
```

### ⏳ Example 2: Partial Progress
```
Training:   100% × 0.30 = 30%
Assignment:  70% × 0.40 = 28%
Feedback:    54% × 0.30 = 16%
─────────────────────────────
TOTAL:                   74%

STATUS: On Track
```

### 🔴 Example 3: Not Started
```
Training:    0% × 0.30 = 0%
Assignment:  0% × 0.40 = 0%
Feedback:    0% × 0.30 = 0%
─────────────────────────────
TOTAL:                   0%

STATUS: Not Started
```

---

## Status Interpretation

| Actual Progress | Expected Progress | Status | Meaning |
|---|---|---|---|
| 0-20% | N/A | Not Started | Training assignment not yet begun |
| 20-50% | Lower | Behind | Progress lags expected timeline |
| 50-80% | On Par | On Track | Maintaining expected pace |
| 80-100% | Higher | On Track | Exceeding expectations |
| 100% | Any | Completed | Skill proficiency achieved |

---

## Visual Representation

### Progress Bar Display
```
Skill: JavaScript

─────────────────────────────────────
Expected:  [Light Blue ◼◼◼◼◼◼◼◼◼◼  72%]
Actual:    [Deep Blue  ◼◼◼◼◼◼◼◼  68%]
─────────────────────────────────────

Status: Behind (68% < 72% expected)
```

---

## Data Requirements

For accurate calculation, training record must have:
1. ✅ Attendance marked in `TrainingAttendance`
2. ✅ At least one assignment submission in `AssignmentSubmission` (with score)
3. ✅ Manager feedback in `ManagerPerformanceFeedback` (with ratings)

**If data is missing:** That component contributes 0% (but calculation still works)

---

## Implementation Files Modified

### Backend
- `app/utils.py` - Added `calculate_weighted_actual_progress()`
- `app/routes/dashboard_routes.py` - Updated `/engineer/skills-with-assignments`

### Frontend
- `engineer-dashboard.component.ts` - Updated `getSkillProgress()`
- `manager-dashboard.component.html` - Updated progress bar colors
- `manager-dashboard.component.ts` - Updated `getSkillProgress()`

---

## Conversion References

### Feedback Rating Scale Conversion
```
1-5 Scale → 0-100 Scale
1 = 20%
2 = 40%
3 = 60%
4 = 80%
5 = 100%

Formula: (Rating / 5) × 100
```

### Example
```
Feedback ratings: [5, 4, 4]
Average: (5 + 4 + 4) / 3 = 4.33
Percentage: (4.33 / 5) × 100 = 86.6%
Contribution: 86.6% × 0.30 = 26%
```

---

## Color Reference

### Progress Bar Colors (Non-Clashing Blue Theme)
- **Expected Progress:** `from-sky-300 to-sky-400` (Light Blue)
- **Actual Progress:** `from-blue-600 to-blue-700` (Deep Blue)

### Status Badge Colors
- **Not Started:** Gray `#9CA3AF`
- **Behind:** Orange `#F59E0B`
- **On Track:** Green `#10B981`
- **Completed:** Emerald `#059669`

---

## FAQ

**Q: What if an employee attended training but didn't submit assignments?**
- Training: 100%, Assignment: 0%, Feedback: (if available)
- Result: At least 30% progress

**Q: How are multiple trainings handled?**
- All trainings for a skill are aggregated
- Attendance: OR logic (any = attended)
- Assignments: Average of all scores
- Feedback: Average of all ratings

**Q: Can progress exceed 100%?**
- No, calculated value is capped at 100%

**Q: What does "Expected Progress" mean?**
- Based on timeline: (Days Elapsed / Total Days) × 100
- Averaged across all skill levels
- Updated daily as timeline progresses

---

## Testing Checklist

- [ ] Backend endpoint returns `weighted_actual_progress` field
- [ ] Progress bars display correctly (Light & Deep Blue)
- [ ] Actual progress equals calculated weighted value
- [ ] Status (Behind/On Track/Completed) updates correctly
- [ ] Multiple levels average expected progress properly
- [ ] Missing data handled gracefully (0% for that component)
- [ ] Color scheme doesn't clash
- [ ] No TypeScript compilation errors
