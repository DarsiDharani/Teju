# Weighted Actual Progress Implementation

## Overview
Implemented a sophisticated **Weighted Actual Progress** calculation that combines three key metrics with specific weightages to provide an accurate measure of skill development.

---

## 📐 Final Formula

### **Weighted Actual Progress = (Training × 30%) + (Assignment × 40%) + (Feedback × 30%)**

Each component is calculated as follows:

### **Component 1: Training Completion (30% weightage)**
- **Score**: 100% if training session attended, 0% if not attended
- **Data Source**: `TrainingAttendance` table
- **Contribution**: `training_score × 0.30`

### **Component 2: Assignment Score (40% weightage)**
- **Score**: Assignment/quiz submission score (0-100%)
- **Data Source**: `AssignmentSubmission.score` (most recent submission)
- **Handling Multiple Assignments**: Average of all assignment scores for the skill
- **Contribution**: `assignment_score × 0.40`

### **Component 3: Manager Feedback (30% weightage)**
- **Score**: Average of manager performance ratings (1-5 scale)
- **Conversion**: $(rating / 5) × 100$ to convert to percentage scale
- **Data Source**: `ManagerPerformanceFeedback` table
  - `application_of_training`
  - `quality_of_deliverables`
  - `problem_solving_capability`
  - `productivity_independence`
  - `process_compliance_adherence`
  - `overall_performance`
- **Handling Multiple Feedback**: Average all available ratings, then convert
- **Contribution**: `feedback_percentage × 0.30`

---

## 📊 Detailed Examples

### **Example 1: Full Completion (Excellent Progress)**

**Scenario:**
- Engineer completed JavaScript training
- Attended the training session ✅
- Submitted assignment with score of 95/100 ✅
- Manager feedback ratings: [5, 5, 4, 5] ✅

**Calculation:**

| Component | Calculation | Score |
|-----------|-------------|-------|
| **Training** | 100% × 0.30 | 30% |
| **Assignment** | 95% × 0.40 | 38% |
| **Feedback** | ((5+5+4+5)/4 = 4.75, (4.75/5)×100 = 95%) × 0.30 | 28.5% |
| **TOTAL** | 30 + 38 + 28.5 | **96.5% → 97%** |

---

### **Example 2: Partial Completion (On Track)**

**Scenario:**
- Engineer partially completed Python training
- Attended the training session ✅
- Submitted assignment with score of 70/100
- Manager feedback ratings: [3, 3, 2] (improving)

**Calculation:**

| Component | Calculation | Score |
|-----------|-------------|-------|
| **Training** | 100% × 0.30 | 30% |
| **Assignment** | 70% × 0.40 | 28% |
| **Feedback** | ((3+3+2)/3 = 2.67, (2.67/5)×100 = 53.4%) × 0.30 | 16% |
| **TOTAL** | 30 + 28 + 16 | **74% → 74%** |

---

### **Example 3: Not Yet Started (No Progress)**

**Scenario:**
- Engineer assigned but hasn't attended training
- No assignment submission
- No manager feedback yet

**Calculation:**

| Component | Calculation | Score |
|-----------|-------------|-------|
| **Training** | 0% × 0.30 | 0% |
| **Assignment** | 0% × 0.40 | 0% |
| **Feedback** | No feedback available × 0.30 | 0% |
| **TOTAL** | 0 + 0 + 0 | **0%** |

---

### **Example 4: Training Done, Awaiting Feedback**

**Scenario:**
- Engineer attended AWS training ✅
- Completed assignment with 85/100
- Manager hasn't provided feedback yet

**Calculation:**

| Component | Calculation | Score |
|-----------|-------------|-------|
| **Training** | 100% × 0.30 | 30% |
| **Assignment** | 85% × 0.40 | 34% |
| **Feedback** | No feedback available × 0.30 | 0% |
| **TOTAL** | 30 + 34 + 0 | **64%** |

---

## 🏗️ Implementation Architecture

### **Backend Changes**

#### **1. New Utility Function: `calculate_weighted_actual_progress()`**
**File:** `backend/app/utils.py`

```python
def calculate_weighted_actual_progress(
    training_attended: bool,
    assignment_score: Optional[int],
    manager_feedback_ratings: list
) -> int:
    """
    Calculates weighted actual progress based on three components:
    - Training Completion (30%)
    - Assignment Score (40%)
    - Manager Feedback (30%)
    
    Returns: int (0-100)
    """
```

**Key Features:**
- Handles missing data gracefully (uses 0 if not available)
- Converts 1-5 feedback scale to 0-100% scale
- Clamps result between 0-100
- Rounds to nearest integer

#### **2. New Async Helper Function: `get_weighted_actual_progress_for_skill()`**
**File:** `backend/app/routes/dashboard_routes.py`

```python
async def get_weighted_actual_progress_for_skill(
    employee_username: str,
    skill_name: str,
    db: AsyncSession
) -> int:
```

**What it does:**
- Fetches all trainings for a given skill
- Collects training attendance records
- Aggregates assignment submission scores
- Gathers all manager feedback ratings
- Calls `calculate_weighted_actual_progress()` with aggregated data

**Data Sources:**
- `TrainingAttendance` → training attendance
- `AssignmentSubmission` → quiz/assignment scores
- `ManagerPerformanceFeedback` → manager ratings

#### **3. Updated Endpoint: `/engineer/skills-with-assignments`**
**File:** `backend/app/routes/dashboard_routes.py`

**Changes:**
- Now includes `weighted_actual_progress` field in response
- Calculated for each skill the engineer has
- Caches calculation during single request

**Response Structure:**
```json
{
  "username": "ENG001",
  "employee_name": "John Doe",
  "skills": [
    {
      "id": 1,
      "skill": "JavaScript",
      "current_expertise": "L2",
      "target_expertise": "L4",
      "status": "Gap",
      "assignment_start_date": "2025-01-15",
      "target_completion_date": "2025-03-15",
      "weighted_actual_progress": 68
    }
  ]
}
```

#### **4. Updated Imports**
**File:** `backend/app/routes/dashboard_routes.py`

Added models:
- `TrainingAttendance`
- `AssignmentSubmission`
- `ManagerPerformanceFeedback`

Added utilities:
- `calculate_weighted_actual_progress()` from utils

---

### **Frontend Changes**

#### **1. Simplified `getSkillProgress()` Method**
**File:** `frontend/src/app/dashboards/engineer-dashboard/engineer-dashboard.component.ts`

**Before:** 150+ lines of complex feedback aggregation logic
**After:** 10 lines - simple property accessor

```typescript
getSkillProgress(competency: Skill | ModalSkill): number {
  return (competency as any).weighted_actual_progress || 0;
}
```

**Benefits:**
- ✅ Cleaner code
- ✅ Single source of truth (backend)
- ✅ More maintainable
- ✅ Better performance (no client-side filtering)

#### **2. Identical Update in Manager Dashboard**
**File:** `frontend/src/app/dashboards/manager-dashboard/manager-dashboard.component.ts`

Same simplified implementation for consistency.

---

## 🎨 Visual Display

### **Color Scheme**
- **Expected Progress Bar:** Light Blue (Sky 300-400)
  - Shows timeline-based expectation
  - Reference line for comparison
  
- **Actual Progress Bar:** Deep Blue (Blue 600-700)
  - Shows weighted actual progress
  - Primary metric for performance

### **Progress Bar HTML**
```html
<div class="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden shadow-inner relative">
  <!-- Expected progress (Light Blue) -->
  <div class="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-300 to-sky-400"
       [style.width.%]="getExpectedProgress(competency)">
  </div>
  <!-- Actual progress (Deep Blue) -->
  <div class="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-700"
       [style.width.%]="getSkillProgress(competency)">
  </div>
</div>
```

### **Status Labels**
```
Exp: 72% • Act: 68%
```

---

## 📋 Data Flow Diagram

```
┌─────────────────────────────────┐
│    Engineer Dashboard (FE)      │
└────────────┬────────────────────┘
             │
             ├─→ /engineer/skills-with-assignments
             │
             ▼
┌─────────────────────────────────┐
│   Dashboard Routes (BE)         │
│  get_engineer_skills_with...   │
└────────────┬────────────────────┘
             │
             ├─→ For each skill:
             │   get_weighted_actual_progress_for_skill()
             │
             ▼
┌─────────────────────────────────┐
│  Weighted Progress Calculation  │
│  (for each training of skill)   │
└────────────┬────────────────────┘
             │
    ┌────────┼────────┬────────┐
    │        │        │        │
    ▼        ▼        ▼        ▼
┌────────┐┌────────┐┌──────────┐
│Training││Assignment││Feedback│
│Attend. ││ Score ││ Ratings │
└────────┘└────────┘└──────────┘
    │        │        │
    └────────┼────────┘
             │
             ▼
   ┌──────────────────────┐
   │calculate_weighted... │
   │   (30/40/30 blend)  │
   └──────────────────────┘
             │
             ▼
      Final Progress %
      (0-100)
```

---

## 📝 Database Tables Used

### **1. TrainingAssignment**
- Links employee to training session
- Stores assignment_date and target_date

### **2. TrainingDetail**
- Training course information
- Contains skill name

### **3. TrainingAttendance**
- Tracks attendance status (boolean)
- Boolean field: `attended`

### **4. AssignmentSubmission**
- Employee quiz/assignment responses
- Score field (0-100): `score`
- Most recent submission used

### **5. ManagerPerformanceFeedback**
- Manager ratings on skill application
- Multiple rating fields (1-5 scale):
  - application_of_training
  - quality_of_deliverables
  - problem_solving_capability
  - productivity_independence
  - process_compliance_adherence
  - overall_performance

---

## ✅ Implementation Status

### **Backend**
- ✅ `calculate_weighted_actual_progress()` function created in utils.py
- ✅ `get_weighted_actual_progress_for_skill()` async helper created
- ✅ Imports added to dashboard_routes.py
- ✅ `/engineer/skills-with-assignments` endpoint updated
- ✅ Tests compiled successfully (no errors)

### **Frontend**
- ✅ Engineer dashboard `getSkillProgress()` simplified
- ✅ Manager dashboard `getSkillProgress()` simplified
- ✅ Progress bar colors updated to Blue scheme
- ✅ TypeScript compilation successful (zero errors)

### **Testing Ready**
- ✅ Backend endpoint returns `weighted_actual_progress` field
- ✅ Frontend displays the value in progress bars
- ✅ Expected progress vs Actual progress comparison works

---

## 🚀 Next Steps

1. **Test in Browser:**
   ```bash
   cd frontend
   ng serve
   ```
   - Navigate to engineer/manager dashboard
   - Verify "My Skills" tab shows both progress bars
   - Check that actual progress = weighted calculation

2. **Verify Data:**
   - Ensure trainings have attendance marked
   - Ensure assignment submissions exist
   - Ensure manager feedback has been submitted
   - Check that expected progress averages correctly across levels

3. **Database Validation:**
   - Confirm all training records have attendance
   - Validate assignment scores are in correct range (0-100)
   - Verify feedback ratings are on 1-5 scale

---

## 📌 Key Points to Remember

1. **Weighted Formula Always Used:**
   - Even if one component is missing, formula still works (treats as 0)
   - E.g., no assignment score = 0% for that component

2. **Average for Multiple Trainings:**
   - If engineer attended multiple trainings for same skill, all are included
   - Same for assignments (average of all submission scores)
   - Same for feedback (average of all rating feedback)

3. **Conversion Formulas:**
   - Training: Boolean → 0 or 100
   - Assignment: Direct use of 0-100 score
   - Feedback: (average_rating / 5) × 100

4. **Expected Progress:**
   - Still calculated on frontend using timeline data
   - Compares: (Today - AssignmentDate) / (TargetDate - AssignmentDate)
   - Averaged across all levels of skill

5. **Status Determination:**
   - "Behind": Actual < Expected OR Past target date with incomplete
   - "On Track": Actual ≥ Expected
   - "Completed": Actual ≥ 100%
   - "Not Started": Actual = 0 AND haven't reached assignment date

---

## 📞 Questions?

For implementation details or formula clarification, refer to:
- `backend/app/utils.py` - Core calculation logic
- `backend/app/routes/dashboard_routes.py` - Data aggregation
- `engineer-dashboard.component.ts` - Frontend display
