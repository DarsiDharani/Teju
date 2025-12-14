/**
 * Skill Model Interfaces
 * 
 * Purpose: TypeScript interfaces for skill-related data structures
 * Used across the application for type safety and consistency
 * 
 * @author Orbit Skill Development Team
 * @date 2025
 */

/**
 * Core skill interface representing employee skill competency
 * Used in dashboard views to display skill status and gaps
 */
export interface Skill {
  /** Unique identifier for the skill record */
  id: number;
  /** Name of the skill (e.g., "Python", "Project Management") */
  skill: string;
  /** Competency area this skill belongs to */
  competency: string;
  /** Current expertise level (L1-L5) */
  current_expertise: string;
  /** Target expertise level (L1-L5) */
  target_expertise: string;
  /**
   * Legacy status from backend indicating if skill requirement is met, has a gap, or error.
   * NOTE: UI should prefer timeline-based status (Not Started/Behind/On Track/Completed)
   * which is derived from assignment/target dates and manager feedback.
   */
  status: 'Met' | 'Gap' | 'Error';
  /** Optional start date when development for this skill was assigned (ISO string) */
  assignment_start_date?: string;
  /** Optional target completion date for this skill (ISO string) */
  target_completion_date?: string;
  /** Cached expected progress (0-100) based on timeline; computed in dashboard components */
  expected_progress?: number;
  /** Cached actual progress (0-100) based on manager feedback; computed in dashboard components */
  actual_progress?: number;
  /** Timeline-based status derived from expected vs actual progress */
  timeline_status?: 'Not Started' | 'Behind' | 'On Track' | 'Completed';
}

/**
 * Skill interface for modal display
 * Similar to Skill but with optional fields for flexible display
 */
export interface ModalSkill {
  /** Unique identifier for the skill record */
  id: number;
  /** Name of the skill */
  skill: string;
  /** Competency area this skill belongs to */
  competency: string;
  /** Current expertise level (optional) */
  current_expertise?: string;
  /** Target expertise level (optional) */
  target_expertise?: string;
  /**
   * Legacy status (optional).
   * UI should prefer timeline_status for displaying skill status.
   */
  status?: 'Met' | 'Gap' | 'Error';
  /** Optional start date when development for this skill was assigned (ISO string) */
  assignment_start_date?: string;
  /** Optional target completion date for this skill (ISO string) */
  target_completion_date?: string;
  /** Cached expected progress (0-100) based on timeline; computed in dashboard components */
  expected_progress?: number;
  /** Cached actual progress (0-100) based on manager feedback; computed in dashboard components */
  actual_progress?: number;
  /** Timeline-based status derived from expected vs actual progress */
  timeline_status?: 'Not Started' | 'Behind' | 'On Track' | 'Completed';
}

/**
 * Additional skill interface for self-reported skills
 * Used for skills that employees add themselves (not from core competency matrix)
 */
export interface AdditionalSkill {
  /** Unique identifier for the additional skill record */
  id: number;
  /** Name of the skill */
  skill_name: string;
  /** Skill level (e.g., "Beginner", "Intermediate", "Advanced", "Expert") */
  skill_level: string;
  /** Category of the skill (e.g., "Technical", "Soft Skills", "Leadership") */
  skill_category: string;
  /** Optional description of the skill */
  description?: string;
  /** Timestamp when the skill was added */
  created_at?: string;
}

