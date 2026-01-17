/**
 * Admin Dashboard Component - COMPLETE IMPLEMENTATION
 * 
 * Main admin tasks:
 * 1. User Management - CRUD operations for all users
 * 2. Training Management - Create, edit, delete trainings system-wide
 * 3. Skills Management - View and edit all employee skills
 * 4. Data Management - Import Excel/CSV files
 * 5. Analytics - System-wide statistics
 * 
 * @author Orbit Skill Development Team
 * @date 2025
 */

import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { trigger, style, animate, transition } from '@angular/animations';
import { ToastService } from '../../services/toast.service';

interface User {
  username: string;
  name: string;
  role: string;
  is_trainer: boolean;
  manager_name?: string;
  created_at?: string;
}

interface Training {
  id: number;
  training_name: string;
  trainer_name: string;
  email?: string;
  division?: string;
  department?: string;
  competency?: string;
  skill?: string;
  skill_category?: string;
  training_topics?: string;
  prerequisites?: string;
  training_date?: string;
  duration?: string;
  time?: string;
  training_type?: string;
  seats?: string;
  assessment_details?: string;
  assigned_count: number;
  attended_count: number;
  completion_rate: number;
}

interface Competency {
  id: number;
  employee_empid: string;
  employee_name: string;
  skill: string;
  competency?: string;
  current_expertise: string;
  target_expertise: string;
  status: string;
  department?: string;
  division?: string;
  project?: string;
  role_specific_comp?: string;
  destination?: string;
  comments?: string;
  target_date?: string;
}

interface GapAnalysis {
  total_skills: number;
  skills_met: number;
  skills_gap: number;
  gap_percentage: number;
}

interface CoreSkill {
  title: string;
  iconClass: string;
}

interface FeedbackRating {
  training_id: number;
  training_name: string;
  trainer_name: string;
  skill: string;
  division: string;
  department: string;
  average_rating: number | null;
  has_numeric_rating: boolean;
  total_submissions: number;
  total_responses: number;
  total_assigned: number;
  total_attended: number;
  submission_rate: number;
  total_questions: number;
  first_submission?: string;
  last_submission?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('500ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideFadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('bouncyScale', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class AdminDashboardComponent implements OnInit {
  // Component state
  activeTab: string = 'dashboard';
  adminName: string = 'Admin';
  adminId: string = '';

  expandedMetric: 'users' | 'trainers' | 'skills' | 'trainings' | 'attendance' | 'report' | null = null;

  showUsersPopup: boolean = false;
  showTrainersPopup: boolean = false;
  showTrainingsPopup: boolean = false;
  showCoreSkillsPopup: boolean = false;
  trainerUsers: User[] = [];
  trainersPopupLoading: boolean = false;
  
  // Popup filters
  usersPopupSearch: string = '';
  trainersPopupSearch: string = '';
  trainingsPopupSearch: string = '';
  skillsPopupSearch: string = '';

  coreSkills: CoreSkill[] = [
    { title: 'EXAM', iconClass: 'fa-solid fa-microscope' },
    { title: 'Softcar', iconClass: 'fa-solid fa-car' },
    { title: 'Python', iconClass: 'fa-brands fa-python' },
    { title: 'C++ (CPP)', iconClass: 'fa-solid fa-code' },
    { title: 'Axivion', iconClass: 'fa-solid fa-search' },
    { title: 'MATLAB', iconClass: 'fa-solid fa-chart-line' },
    { title: 'DOORS', iconClass: 'fa-solid fa-door-open' },
    { title: 'Azure DevOps', iconClass: 'fa-brands fa-microsoft' },
    { title: 'Smart Git', iconClass: 'fa-brands fa-git-alt' },
    { title: 'Integrity', iconClass: 'fa-solid fa-shield-halved' }
  ];

  openTrainingsPopup(): void {
    this.showTrainingsPopup = true;
    // Always refresh so the list matches the latest state
    this.loadTrainings();
  }

  closeTrainingsPopup(): void {
    this.showTrainingsPopup = false;
    this.trainingsPopupSearch = '';
  }
  
  // Dashboard metrics
  totalUsers: number = 0;
  totalManagers: number = 0;
  totalEmployees: number = 0;
  totalTrainings: number = 0;
  totalAssignments: number = 0;
  attendedAssignments: number = 0;
  attendanceRate: number = 0;
  totalSkills: number = 0;
  pendingRequests: number = 0;
  activeTrainers: number = 0;
  
  // Attendance breakdown data
  attendanceByLevel: any = {};
  skillBreakdown: any = {};
  attendanceLoading: boolean = false;
  expandedLevelInCard: string | null = null;
  showAttendanceModal: boolean = false;
  attendanceViewMode: 'skill' | 'level' = 'skill';
  expandedSkillInModal: string | null = null;
  
  // New dashboard cards data
  trainingRate: number = 0;
  trainingCompletionRate: number = 0;
  topFeedbackRatings: FeedbackRating[] = [];  // Top 5 feedback ratings
  allFeedbackRatings: FeedbackRating[] = [];  // Store all feedback ratings for modal
  feedbackRatingsLoading: boolean = false;
  topTrainers: Array<{ name: string; value: number; display: string; metric: 'deliveries' | 'completion' | 'assigned' | 'attended'; count?: number; }> = [];
  topCompletionTrainings: Training[] = []; // Top 5 trainings by completion rate
  newCardsLoading: boolean = false;
  // Calculation trace values
  trainingRateNumerator: number = 0;     // available trainings
  trainingRateDenominator: number = 0;   // same as available trainings (by definition)
  completionNumerator: number = 0;       // attended assignments
  completionDenominator: number = 0;     // total assignments
  
  // Modal controls for new cards
  showTrainingRateModal: boolean = false;
  showCompletionRateModal: boolean = false;
  showFeedbackRatingsModal: boolean = false;
  showTopTrainersModal: boolean = false;
  feedbackRatingsSearch: string = '';
  trainersDetailSearch: string = '';
  // Trainer ranking basis
  trainerRankBasis: 'deliveries' | 'completion' | 'assigned' | 'attended' = 'deliveries';
  private trainerRankLabels: Record<'deliveries' | 'completion' | 'assigned' | 'attended', string> = {
    deliveries: 'Deliveries',
    completion: 'Completion %',
    assigned: 'Assigned',
    attended: 'Attended'
  };
  // All Training Rates modal
  showAllTrainingRatesModal: boolean = false;
  allRatesSearch: string = '';
  allRatesSort: 'name' | 'trainer' | 'assigned' | 'attended' | 'trainingRate' | 'completionRate' = 'name';
  allRatesSortDir: 'asc' | 'desc' = 'asc';
  
  // User Management
  users: User[] = [];
  usersLoading: boolean = false;
  userSearch: string = '';
  userRoleFilter: string = 'all';
  showCreateUserModal: boolean = false;
  showEditUserModal: boolean = false;
  selectedUser: User | null = null;
  selectedUsers: Set<string> = new Set<string>(); // Track selected usernames for bulk delete
  isSelectAll: boolean = false;
  newUser: any = {
    username: '',
    password: '',
    name: '',
    role: 'employee',
    manager_empid: '',
    is_trainer: false
  };
  
  // Training Management
  trainings: Training[] = [];
  trainingsLoading: boolean = false;
  trainingSearch: string = '';
  trainingSkillFilter: string = '';
  trainingTypeView: 'all' | 'recorded' | 'classroom' = 'all';
  showCreateTrainingModal: boolean = false;
  showEditTrainingModal: boolean = false;
  showTrainingDetailModal: boolean = false;
  selectedTraining: Training | null = null;
  selectedTrainings: Set<number> = new Set<number>(); // Track selected training IDs for bulk delete
  isSelectAllTrainings: boolean = false;
  skillCategoryLevels: string[] = ['L1', 'L2', 'L3', 'L4', 'L5'];
  newTraining: any = {
    training_name: '',
    trainer_name: '',
    email: '',
    division: '',
    department: '',
    competency: '',
    skill: '',
    skill_category: '',
    training_topics: '',
    prerequisites: '',
    training_date: '',
    duration: '',
    time: '',
    training_type: '',
    seats: '',
    assessment_details: ''
  };
  
  // Skills Management
  competencies: Competency[] = [];
  competenciesLoading: boolean = false;
  skillSearch: string = '';
  skillEmployeeFilter: string = '';
  showEditSkillModal: boolean = false;
  showCreateSkillModal: boolean = false;
  selectedCompetency: Competency | null = null;
  skillUpdate: any = {
    current_expertise: '',
    target_expertise: ''
  };
  newCompetency: any = {
    employee_empid: '',
    employee_name: '',
    skill: '',
    competency: '',
    current_expertise: '',
    target_expertise: '',
    department: '',
    division: '',
    project: '',
    role_specific_comp: '',
    destination: '',
    comments: '',
    target_date: ''
  };
  allEmployees: User[] = [];
  gapAnalysis: GapAnalysis | null = null;
  
  // Data Management
  excelFile: File | null = null;
  csvFile: File | null = null;
  uploading: boolean = false;
  
  // Report Generation
  showReportModal: boolean = false;
  selectedReportType: string = '';
  reportTypes = [
    { value: 'users', label: 'Users Report', description: 'All users with roles and managers', icon: 'fa-users' },
    { value: 'trainings', label: 'Trainings Report', description: 'All trainings with assignments and attendance', icon: 'fa-book-open' },
    { value: 'skills', label: 'Skills Report', description: 'Employee competencies and skill gaps', icon: 'fa-graduation-cap' },
    { value: 'attendance', label: 'Attendance Report', description: 'Training attendance breakdown', icon: 'fa-clipboard-check' },
    { value: 'assignments', label: 'Assignments Report', description: 'Training assignments by training', icon: 'fa-tasks' },
    { value: 'feedback', label: 'Feedback Report', description: 'Feedback submissions summary', icon: 'fa-comment-dots' },
    { value: 'all', label: 'Complete Report', description: 'All system data in one report', icon: 'fa-database' }
  ];
  generatingReport: boolean = false;
  
  // Analytics
  analytics: any = null;
  analyticsLoading: boolean = false;
  
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const role = this.authService.getRole();
    if (role !== 'admin') {
      this.toastService.show('Access denied. Admin privileges required.', 'error');
      if (role === 'manager') {
        this.router.navigate(['/manager-dashboard']);
      } else {
        this.router.navigate(['/engineer-dashboard']);
      }
      return;
    }

    this.adminId = this.authService.getUsername() || '';
    this.adminName = `Admin (${this.adminId})`;
    
    this.loadTrainersForPopup(); // Load trainer list first
    this.loadDashboardData();
    this.loadTrainings();
    this.loadGapAnalysis();
    this.loadAdditionalDashboardCards();
    this.loadFeedbackRatings();
  }

  getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('No authentication token available');
      // Return headers without Authorization if token is missing
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getFormHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // ==================== DASHBOARD ====================
  loadDashboardData(): void {
    // Check if user is logged in before making request
    if (!this.authService.isLoggedIn()) {
      this.toastService.show('Please log in to continue', 'error');
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.http.get<any>(this.apiService.adminDashboardUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.adminName = data.admin_name || this.adminName;
          this.adminId = data.admin_id || this.adminId;
          
          if (data.metrics) {
            this.totalUsers = data.metrics.total_users || 0;
            this.totalManagers = data.metrics.total_managers || 0;
            this.totalEmployees = data.metrics.total_employees || 0;
            this.totalTrainings = data.metrics.total_trainings || 0;
            this.totalAssignments = data.metrics.total_assignments || 0;
            this.attendedAssignments = data.metrics.attended_assignments ?? 0;
            this.attendanceRate = data.metrics.attendance_rate ?? 0;
            this.totalSkills = data.metrics.total_skills || 0;
            this.pendingRequests = data.metrics.pending_requests || 0;
            this.activeTrainers = data.metrics.active_trainers || 0;
          }
          
          // Load detailed attendance breakdown
          this.loadAttendanceBreakdown();

          // Refresh calculated card values after metrics arrive
          this.loadAdditionalDashboardCards();
          
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading dashboard data:', err);
          // Handle 401 Unauthorized - redirect to login
          if (err.status === 401 || err.status === 403) {
            this.toastService.show('Session expired. Please log in again', 'error');
            this.authService.logout();
            this.router.navigate(['/login']);
          } else {
            this.toastService.show('Failed to load dashboard data', 'error');
          }
          this.isLoading = false;
        }
      });
  }

  loadAttendanceBreakdown(): void {
    this.attendanceLoading = true;
    this.http.get<any>(this.apiService.adminAttendanceBreakdownUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.attendanceByLevel = data.attendance_by_level || {};
          this.skillBreakdown = data.skill_breakdown || {};
          this.attendanceLoading = false;
        },
        error: (err) => {
          console.error('Error loading attendance breakdown:', err);
          this.attendanceLoading = false;
        }
      });
  }

  toggleLevelExpansion(level: string): void {
    this.expandedLevelInCard = this.expandedLevelInCard === level ? null : level;
  }

  openAttendanceModal(): void {
    this.showAttendanceModal = true;
  }

  closeAttendanceModal(): void {
    this.showAttendanceModal = false;
    this.expandedSkillInModal = null;
  }

  openTrainingRateModal(): void {
    this.showTrainingRateModal = true;
  }

  closeTrainingRateModal(): void {
    this.showTrainingRateModal = false;
  }

  openCompletionRateModal(): void {
    this.showCompletionRateModal = true;
  }

  closeCompletionRateModal(): void {
    this.showCompletionRateModal = false;
  }

  openFeedbackRatingsModal(): void {
    this.showFeedbackRatingsModal = true;
  }

  closeFeedbackRatingsModal(): void {
    this.showFeedbackRatingsModal = false;
    this.feedbackRatingsSearch = '';
  }

  openTopTrainersModal(): void {
    this.showTopTrainersModal = true;
  }

  closeTopTrainersModal(): void {
    this.showTopTrainersModal = false;
    this.trainersDetailSearch = '';
  }

  openAllTrainingRatesModal(): void {
    this.showAllTrainingRatesModal = true;
  }

  closeAllTrainingRatesModal(): void {
    this.showAllTrainingRatesModal = false;
    this.allRatesSearch = '';
  }

  toggleSkillExpansion(skillName: string): void {
    this.expandedSkillInModal = this.expandedSkillInModal === skillName ? null : skillName;
  }

  getAttendanceStatusColor(status: string): string {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      case 'no_data': return 'text-gray-400';
      default: return 'text-slate-600';
    }
  }

  getAttendanceStatusBg(status: string): string {
    switch (status) {
      case 'good': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'critical': return 'bg-red-50 border-red-200';
      case 'no_data': return 'bg-gray-50 border-gray-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  }

  getSkillBreakdownEntries(): Array<{key: string, value: any}> {
    return Object.entries(this.skillBreakdown).map(([key, value]) => ({ key, value }));
  }

  asAny(val: any): any {
    return val;
  }

  // --- Timeline-based status helpers (mirrors engineer dashboard My Skills) ---
  // Backend now provides: weighted_actual_progress, assignment_start_date, target_completion_date
  
  private toDate(val?: string | Date | null): Date | null {
    if (!val) return null;
    try {
      if (val instanceof Date) return val;
      return new Date(val);
    } catch {
      return null;
    }
  }

  private getActualProgress(comp: any): number {
    // Use weighted_actual_progress from backend
    if (typeof comp.weighted_actual_progress === 'number') {
      return Math.max(0, Math.min(100, comp.weighted_actual_progress));
    }
    return 0;
  }

  private getExpectedProgress(comp: any): number {
    const now = new Date();
    const start = this.toDate(comp.assignment_start_date);
    const target = this.toDate(comp.target_completion_date || comp.target_date);

    if (!start || !target || isNaN(start.getTime()) || isNaN(target.getTime()) || target <= start) {
      return 0;
    }

    const totalMs = target.getTime() - start.getTime();
    const elapsedMs = Math.min(Math.max(now.getTime() - start.getTime(), 0), totalMs);
    const expected = Math.round((elapsedMs / totalMs) * 100);
    return Math.max(0, Math.min(100, expected));
  }

  getTimelineStatus(comp: any): 'Not Started' | 'Behind' | 'On Track' | 'Completed' {
    const actual = this.getActualProgress(comp);
    const now = new Date();
    const assignmentStart = this.toDate(comp.assignment_start_date);
    const target = this.toDate(comp.target_completion_date || comp.target_date);

    // Not Started: no progress and assignment hasn't started yet
    if (actual <= 0 && assignmentStart && now <= assignmentStart) {
      return 'Not Started';
    }

    // Completed: 100% progress
    if (actual >= 100) {
      return 'Completed';
    }

    // No timeline data: fallback
    if (!assignmentStart || !target || isNaN(assignmentStart.getTime()) || isNaN(target.getTime())) {
      return actual <= 0 ? 'Not Started' : 'On Track';
    }

    // Behind: past target date and not completed
    if (now > target && actual < 100) {
      return 'Behind';
    }

    // Behind: actual progress less than expected progress
    const expected = this.getExpectedProgress(comp);
    if (expected > 0 && actual < expected) {
      return 'Behind';
    }

    return 'On Track';
  }

  getStatusChipClass(status: 'Not Started' | 'Behind' | 'On Track' | 'Completed'): string {
    switch (status) {
      case 'Completed':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300';
      case 'Behind':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300';
      case 'On Track':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300';
      case 'Not Started':
      default:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300';
    }
  }


  getUpcomingTrainings(): Training[] {
    const now = new Date();
    return this.trainings
      .filter(t => {
        if (!t.training_date) return false;
        const trainingDate = new Date(t.training_date);
        return trainingDate >= now;
      })
      .sort((a, b) => {
        const dateA = new Date(a.training_date || '');
        const dateB = new Date(b.training_date || '');
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  }

  toggleMetric(metric: 'users' | 'trainers' | 'skills' | 'trainings' | 'attendance' | 'report'): void {
    this.expandedMetric = this.expandedMetric === metric ? null : metric;
  }

  openUsersPopup(): void {
    this.expandedMetric = null;
    this.showUsersPopup = true;
    // Load users for the popup (all roles) and allow scrolling in the UI.
    this.loadUsers();
  }

  closeUsersPopup(): void {
    this.showUsersPopup = false;
    this.usersPopupSearch = '';
  }

  openTrainersPopup(): void {
    this.expandedMetric = null;
    this.showTrainersPopup = true;
    this.loadTrainersForPopup();
  }

  closeTrainersPopup(): void {
    this.showTrainersPopup = false;
    this.trainersPopupSearch = '';
  }

  openCoreSkillsPopup(): void {
    this.expandedMetric = null;
    this.showCoreSkillsPopup = true;
  }

  closeCoreSkillsPopup(): void {
    this.showCoreSkillsPopup = false;
    this.skillsPopupSearch = '';
  }

  private loadTrainersForPopup(): void {
    this.trainersPopupLoading = true;
    this.http.get<any>(this.apiService.adminTrainersUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          // Map trainers payload into User-like structure used by the template
          const trainers = (data.trainers || []) as Array<{ username: string; name: string; role: string }>;
          this.trainerUsers = trainers.map(t => ({
            username: t.username,
            name: t.name,
            role: t.role,
            is_trainer: true
          }));
          this.trainersPopupLoading = false;
        },
        error: (err) => {
          console.error('Error loading trainers:', err);
          this.toastService.show('Failed to load trainers', 'error');
          this.trainerUsers = [];
          this.trainersPopupLoading = false;
        }
      });
  }

  // ==================== USER MANAGEMENT ====================
  loadUsers(): void {
    this.usersLoading = true;
    let url = `${this.apiService.adminUsersUrl}?page=1&limit=1000`;
    if (this.userRoleFilter !== 'all') {
      url += `&role=${this.userRoleFilter}`;
    }
    if (this.userSearch) {
      url += `&search=${this.userSearch}`;
    }
    
    this.http.get<any>(url, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.users = data.users || [];
          // Clear selections when users are reloaded (e.g., after search/filter)
          this.selectedUsers.clear();
          this.isSelectAll = false;
          this.usersLoading = false;
        },
        error: (err) => {
          console.error('Error loading users:', err);
          this.toastService.show('Failed to load users', 'error');
          this.usersLoading = false;
        }
      });
  }

  openCreateUserModal(): void {
    this.newUser = {
      username: '',
      password: '',
      name: '',
      role: 'employee',
      manager_empid: '',
      is_trainer: false
    };
    this.showCreateUserModal = true;
  }

  createUser(): void {
    if (!this.newUser.username || !this.newUser.password || !this.newUser.name) {
      this.toastService.show('Please fill all required fields', 'error');
      return;
    }

    this.http.post(this.apiService.adminUsersUrl, this.newUser, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.toastService.show('User created successfully', 'success');
          this.showCreateUserModal = false;
          this.loadUsers();
          this.loadDashboardData();
          // Delay analytics refresh slightly to ensure database is updated
          setTimeout(() => {
            this.loadAnalytics(); // Refresh analytics data
          }, 500);
        },
        error: (err) => {
          this.toastService.show(err.error?.detail || 'Failed to create user', 'error');
        }
      });
  }

  openEditUserModal(user: User): void {
    this.selectedUser = { ...user };
    this.showEditUserModal = true;
  }

  updateUser(): void {
    if (!this.selectedUser) return;

    const updateData: any = {
      name: this.selectedUser.name,
      role: this.selectedUser.role,
      is_trainer: this.selectedUser.is_trainer
    };

    this.http.put(this.apiService.adminUserUrl(this.selectedUser.username), updateData, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.toastService.show('User updated successfully', 'success');
          this.showEditUserModal = false;
          this.loadUsers();
          this.loadDashboardData();
          // Delay analytics refresh slightly to ensure database is updated
          setTimeout(() => {
            this.loadAnalytics(); // Refresh analytics data
          }, 500);
        },
        error: (err) => {
          this.toastService.show(err.error?.detail || 'Failed to update user', 'error');
        }
      });
  }

  deleteUser(user: User): void {
    if (!confirm(`Are you sure you want to delete user ${user.username}?`)) return;

    this.http.delete(this.apiService.adminUserUrl(user.username), { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.toastService.show('User deleted successfully', 'success');
          this.selectedUsers.delete(user.username); // Remove from selection if deleted
          this.loadUsers();
          this.loadDashboardData();
          // Delay analytics refresh slightly to ensure database is updated
          setTimeout(() => {
            this.loadAnalytics(); // Refresh analytics data
          }, 500);
        },
        error: (err) => {
          this.toastService.show(err.error?.detail || 'Failed to delete user', 'error');
        }
      });
  }

  // ==================== BULK USER OPERATIONS ====================
  toggleUserSelection(user: User): void {
    if (this.selectedUsers.has(user.username)) {
      this.selectedUsers.delete(user.username);
    } else {
      this.selectedUsers.add(user.username);
    }
    this.updateSelectAllState();
  }

  toggleSelectAll(): void {
    if (this.isSelectAll) {
      this.selectedUsers.clear();
    } else {
      this.users.forEach(user => {
        this.selectedUsers.add(user.username);
      });
    }
    this.isSelectAll = !this.isSelectAll;
  }

  updateSelectAllState(): void {
    this.isSelectAll = this.users.length > 0 && this.selectedUsers.size === this.users.length;
  }

  isUserSelected(username: string): boolean {
    return this.selectedUsers.has(username);
  }

  getSelectedUsersCount(): number {
    return this.selectedUsers.size;
  }

  deleteSelectedUsers(): void {
    const count = this.selectedUsers.size;
    if (count === 0) {
      this.toastService.show('Please select at least one user to delete', 'error');
      return;
    }

    const usernames = Array.from(this.selectedUsers);
    if (!confirm(`Are you sure you want to delete ${count} user(s)?\n\nUsers: ${usernames.join(', ')}`)) {
      return;
    }

    // Delete users sequentially to avoid overwhelming the server
    let deletedCount = 0;
    let errorCount = 0;
    const total = usernames.length;

    usernames.forEach((username, index) => {
      this.http.delete(this.apiService.adminUserUrl(username), { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            deletedCount++;
            this.selectedUsers.delete(username);
            
            // If this is the last request, refresh data
            if (deletedCount + errorCount === total) {
              if (errorCount > 0) {
                this.toastService.show(`Deleted ${deletedCount} user(s). ${errorCount} failed.`, 'warning');
              } else {
                this.toastService.show(`Successfully deleted ${deletedCount} user(s)`, 'success');
              }
              this.selectedUsers.clear();
              this.isSelectAll = false;
              this.loadUsers();
              this.loadDashboardData();
              // Delay analytics refresh slightly to ensure database is updated
              setTimeout(() => {
                this.loadAnalytics(); // Refresh analytics data
              }, 500);
            }
          },
          error: (err) => {
            errorCount++;
            console.error(`Failed to delete user ${username}:`, err);
            
            // If this is the last request, refresh data
            if (deletedCount + errorCount === total) {
              if (deletedCount > 0) {
                this.toastService.show(`Deleted ${deletedCount} user(s). ${errorCount} failed.`, 'warning');
              } else {
                this.toastService.show('Failed to delete users', 'error');
              }
              this.selectedUsers.clear();
              this.isSelectAll = false;
              this.loadUsers();
              this.loadDashboardData();
              // Delay analytics refresh slightly to ensure database is updated
              setTimeout(() => {
                this.loadAnalytics(); // Refresh analytics data
              }, 500);
            }
          }
        });
    });
  }

  resetPassword(user: User): void {
    const newPassword = prompt(`Enter new password for ${user.username}:`);
    if (!newPassword) return;

    this.http.post(this.apiService.adminResetPasswordUrl(user.username), { new_password: newPassword }, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.toastService.show('Password reset successfully', 'success');
        },
        error: (err) => {
          this.toastService.show(err.error?.detail || 'Failed to reset password', 'error');
        }
      });
  }

  // ==================== TRAINING MANAGEMENT ====================
  /**
   * Groups duplicate trainings by training_name + date + time and combines trainer names
   * This handles the case where Excel loader created separate records for each trainer
   */
  groupDuplicateTrainings(trainings: Training[]): Training[] {
    const groupedMap = new Map<string, Training[]>();
    
    // Normalize date to ISO string format for consistent comparison
    const normalizeDate = (date: any): string => {
      if (!date) return '';
      try {
        // If it's already a string in ISO format, use it
        if (typeof date === 'string') {
          // Extract just the date part (YYYY-MM-DD) if it's a full ISO string
          const dateMatch = date.match(/^(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) return dateMatch[1];
          return date.trim();
        }
        // If it's a Date object, convert to ISO string
        if (date instanceof Date) {
          return date.toISOString().split('T')[0];
        }
      } catch (e) {
        console.warn('Error normalizing date:', date, e);
      }
      return String(date || '').trim();
    };
    
    // Normalize time string (remove extra spaces, normalize separators)
    const normalizeTime = (time: string | undefined): string => {
      if (!time) return '';
      return time.trim().replace(/\s+/g, ' ').replace(/\./g, ':');
    };
    
    // Group trainings by a unique key: training_name + normalized date + normalized time
    trainings.forEach(training => {
      const normalizedName = (training.training_name || '').trim().toLowerCase();
      const normalizedDate = normalizeDate(training.training_date);
      const normalizedTime = normalizeTime(training.time);
      const key = `${normalizedName}_${normalizedDate}_${normalizedTime}`;
      
      if (!groupedMap.has(key)) {
        groupedMap.set(key, []);
      }
      groupedMap.get(key)!.push(training);
    });
    
    // Combine grouped trainings
    const grouped: Training[] = [];
    groupedMap.forEach((trainingsGroup, key) => {
      if (trainingsGroup.length === 0) return;
      
      // Use the first training as base
      const baseTraining = { ...trainingsGroup[0] };
      
      // Collect all unique trainer names
      const trainerNamesSet = new Set<string>();
      const emailSet = new Set<string>();
      const trainingIds: number[] = [];
      
      // Aggregate counts from all duplicate trainings
      let totalAssignedCount = 0;
      let totalAttendedCount = 0;
      
      trainingsGroup.forEach(t => {
        if (t.trainer_name) {
          // Split by comma in case trainer_name already contains multiple names
          const names = t.trainer_name.split(',').map(n => n.trim()).filter(n => n);
          names.forEach(name => trainerNamesSet.add(name));
        }
        if (t.email) {
          const emails = t.email.split(',').map(e => e.trim()).filter(e => e);
          emails.forEach(email => emailSet.add(email));
        }
        if (t.id) {
          trainingIds.push(t.id);
        }
        // Sum up counts from all duplicate trainings
        totalAssignedCount += t.assigned_count || 0;
        totalAttendedCount += t.attended_count || 0;
      });
      
      // Combine trainer names with comma separation
      baseTraining.trainer_name = Array.from(trainerNamesSet).join(', ');
      baseTraining.email = Array.from(emailSet).join(', ');
      
      // Aggregate counts
      baseTraining.assigned_count = totalAssignedCount;
      baseTraining.attended_count = totalAttendedCount;
      baseTraining.completion_rate = totalAssignedCount > 0 
        ? Math.round((totalAttendedCount / totalAssignedCount * 100) * 100) / 100 
        : 0;
      
      // Store all related training IDs for reference
      (baseTraining as any).relatedTrainingIds = trainingIds;
      
      // Use the first training ID as the primary one
      baseTraining.id = trainingIds[0];
      
      grouped.push(baseTraining);
    });
    
    return grouped;
  }

  loadTrainings(): void {
    this.trainingsLoading = true;
    let url = this.apiService.adminTrainingsUrl;
    if (this.trainingSkillFilter) {
      url += `?skill=${this.trainingSkillFilter}`;
    }
    if (this.trainingSearch) {
      url += url.includes('?') ? `&trainer=${this.trainingSearch}` : `?trainer=${this.trainingSearch}`;
    }
    
    this.http.get<any>(url, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          const rawTrainings = data.trainings || [];
          // Group duplicate trainings by training_name + date + time and combine trainer names
          this.trainings = this.groupDuplicateTrainings(rawTrainings);
          // Clear selections when trainings are reloaded (e.g., after search/filter)
          this.selectedTrainings.clear();
          this.isSelectAllTrainings = false;
          this.trainingsLoading = false;
          
          // Refresh the additional dashboard cards
          this.loadAdditionalDashboardCards();
        },
        error: (err) => {
          console.error('Error loading trainings:', err);
          this.toastService.show('Failed to load trainings', 'error');
          this.trainingsLoading = false;
        }
      });
  }

  private isRecordedTraining(training: Training): boolean {
    const rawType = (training.training_type || '').toLowerCase().trim();
    return rawType.includes('record');
  }

  get recordedTrainingsCount(): number {
    return (this.trainings || []).filter(t => this.isRecordedTraining(t)).length;
  }

  get classroomTrainingsCount(): number {
    return (this.trainings || []).filter(t => !this.isRecordedTraining(t)).length;
  }

  getTrainingTypeLabel(training: Training): string {
    return this.isRecordedTraining(training) ? 'Recorded' : 'Classroom';
  }

  get filteredTrainings(): Training[] {
    if (this.trainingTypeView === 'recorded') {
      return this.trainings.filter(t => this.isRecordedTraining(t));
    }
    if (this.trainingTypeView === 'classroom') {
      return this.trainings.filter(t => !this.isRecordedTraining(t));
    }
    return this.trainings;
  }

  setTrainingTypeView(view: 'all' | 'recorded' | 'classroom'): void {
    this.trainingTypeView = view;
    this.updateSelectAllTrainingsState();
  }

  openCreateTrainingModal(): void {
    this.newTraining = {
      training_name: '',
      trainer_name: '',
      email: '',
      division: '',
      department: '',
      competency: '',
      skill: '',
      skill_category: '',
      training_topics: '',
      prerequisites: '',
      training_date: '',
      duration: '',
      time: '',
      training_type: '',
      seats: '',
      assessment_details: ''
    };
    this.showCreateTrainingModal = true;
  }

  createTraining(): void {
    if (!this.newTraining.training_name || !this.newTraining.trainer_name) {
      this.toastService.show('Training name and trainer name are required', 'error');
      return;
    }

    // Prepare payload with all fields, converting empty strings to null for optional fields
    const payload = {
      division: this.newTraining.division || null,
      department: this.newTraining.department || null,
      competency: this.newTraining.competency || null,
      skill: this.newTraining.skill || null,
      training_name: this.newTraining.training_name,
      training_topics: this.newTraining.training_topics || null,
      prerequisites: this.newTraining.prerequisites || null,
      skill_category: this.newTraining.skill_category || null,
      trainer_name: this.newTraining.trainer_name,
      email: this.newTraining.email || null,
      training_date: this.newTraining.training_date || null,
      duration: this.newTraining.duration || null,
      time: this.newTraining.time || null,
      training_type: this.newTraining.training_type || null,
      seats: this.newTraining.seats || null,
      assessment_details: this.newTraining.assessment_details || null
    };

    this.http.post(this.apiService.adminTrainingsUrl, payload, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.toastService.show('Training created successfully', 'success');
          this.showCreateTrainingModal = false;
          this.loadTrainings();
          this.loadDashboardData();
          // Delay analytics refresh slightly to ensure database is updated
          setTimeout(() => {
            this.loadAnalytics(); // Refresh analytics data
          }, 500);
        },
        error: (err) => {
          this.toastService.show(err.error?.detail || 'Failed to create training', 'error');
        }
      });
  }

  openEditTrainingModal(training: Training): void {
    this.selectedTraining = { ...training };
    this.showEditTrainingModal = true;
  }

  openTrainingDetailModal(training: Training): void {
    this.selectedTraining = { ...training };
    this.showTrainingDetailModal = true;
  }

  closeTrainingDetailModal(): void {
    this.showTrainingDetailModal = false;
    this.selectedTraining = null;
  }

  updateTraining(): void {
    if (!this.selectedTraining) return;

    // Prepare update data from selectedTraining with all fields
    const updateData: any = {
      training_name: this.selectedTraining.training_name,
      trainer_name: this.selectedTraining.trainer_name,
      email: this.selectedTraining.email || null,
      division: this.selectedTraining.division || null,
      department: this.selectedTraining.department || null,
      competency: this.selectedTraining.competency || null,
      skill: this.selectedTraining.skill || null,
      skill_category: this.selectedTraining.skill_category || null,
      training_topics: this.selectedTraining.training_topics || null,
      prerequisites: this.selectedTraining.prerequisites || null,
      training_date: this.selectedTraining.training_date || null,
      duration: this.selectedTraining.duration || null,
      time: this.selectedTraining.time || null,
      training_type: this.selectedTraining.training_type || null,
      seats: this.selectedTraining.seats || null,
      assessment_details: this.selectedTraining.assessment_details || null
    };

    this.http.put(this.apiService.adminTrainingUrl(this.selectedTraining.id), updateData, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.toastService.show('Training updated successfully', 'success');
          this.showEditTrainingModal = false;
          this.loadTrainings();
          this.loadDashboardData();
          // Delay analytics refresh slightly to ensure database is updated
          setTimeout(() => {
            this.loadAnalytics(); // Refresh analytics data
          }, 500);
        },
        error: (err) => {
          this.toastService.show(err.error?.detail || 'Failed to update training', 'error');
        }
      });
  }

  deleteTraining(training: Training): void {
    if (!confirm(`Are you sure you want to delete training "${training.training_name}"?`)) return;

    this.http.delete(this.apiService.adminTrainingUrl(training.id), { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.toastService.show('Training deleted successfully', 'success');
          this.selectedTrainings.delete(training.id); // Remove from selection if deleted
          this.loadTrainings();
          this.loadDashboardData();
          // Delay analytics refresh slightly to ensure database is updated
          setTimeout(() => {
            this.loadAnalytics(); // Refresh analytics data
          }, 500);
        },
        error: (err) => {
          this.toastService.show(err.error?.detail || 'Failed to delete training', 'error');
        }
      });
  }

  // ==================== BULK TRAINING OPERATIONS ====================
  toggleTrainingSelection(training: Training): void {
    if (this.selectedTrainings.has(training.id)) {
      this.selectedTrainings.delete(training.id);
    } else {
      this.selectedTrainings.add(training.id);
    }
    this.updateSelectAllTrainingsState();
  }

  toggleSelectAllTrainings(): void {
    const visibleTrainings = this.filteredTrainings;

    if (this.isSelectAllTrainings) {
      visibleTrainings.forEach(training => this.selectedTrainings.delete(training.id));
    } else {
      visibleTrainings.forEach(training => this.selectedTrainings.add(training.id));
    }

    this.updateSelectAllTrainingsState();
  }

  updateSelectAllTrainingsState(): void {
    const visibleTrainings = this.filteredTrainings;
    this.isSelectAllTrainings = visibleTrainings.length > 0 && visibleTrainings.every(t => this.selectedTrainings.has(t.id));
  }

  isTrainingSelected(trainingId: number): boolean {
    return this.selectedTrainings.has(trainingId);
  }

  getSelectedTrainingsCount(): number {
    return this.selectedTrainings.size;
  }

  deleteSelectedTrainings(): void {
    const count = this.selectedTrainings.size;
    if (count === 0) {
      this.toastService.show('Please select at least one training to delete', 'error');
      return;
    }

    const trainingIds = Array.from(this.selectedTrainings);
    const trainingNames = this.trainings
      .filter(t => trainingIds.includes(t.id))
      .map(t => t.training_name);
    
    if (!confirm(`Are you sure you want to delete ${count} training(s)?\n\nTrainings: ${trainingNames.join(', ')}`)) {
      return;
    }

    // Delete trainings sequentially to avoid overwhelming the server
    let deletedCount = 0;
    let errorCount = 0;
    const total = trainingIds.length;

    trainingIds.forEach((trainingId, index) => {
      this.http.delete(this.apiService.adminTrainingUrl(trainingId), { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            deletedCount++;
            this.selectedTrainings.delete(trainingId);
            
            // If this is the last request, refresh data
            if (deletedCount + errorCount === total) {
              if (errorCount > 0) {
                this.toastService.show(`Deleted ${deletedCount} training(s). ${errorCount} failed.`, 'warning');
              } else {
                this.toastService.show(`Successfully deleted ${deletedCount} training(s)`, 'success');
              }
              this.selectedTrainings.clear();
              this.isSelectAllTrainings = false;
              this.loadTrainings();
              this.loadDashboardData();
              // Delay analytics refresh slightly to ensure database is updated
              setTimeout(() => {
                this.loadAnalytics(); // Refresh analytics data
              }, 500);
            }
          },
          error: (err) => {
            errorCount++;
            console.error(`Failed to delete training ${trainingId}:`, err);
            
            // If this is the last request, refresh data
            if (deletedCount + errorCount === total) {
              if (deletedCount > 0) {
                this.toastService.show(`Deleted ${deletedCount} training(s). ${errorCount} failed.`, 'warning');
              } else {
                this.toastService.show('Failed to delete trainings', 'error');
              }
              this.selectedTrainings.clear();
              this.isSelectAllTrainings = false;
              this.loadTrainings();
              this.loadDashboardData();
              // Delay analytics refresh slightly to ensure database is updated
              setTimeout(() => {
                this.loadAnalytics(); // Refresh analytics data
              }, 500);
            }
          }
        });
    });
  }

  // ==================== SKILLS MANAGEMENT ====================
  loadCompetencies(): void {
    this.competenciesLoading = true;
    let url = this.apiService.adminSkillsCompetenciesUrl;
    if (this.skillEmployeeFilter) {
      url += `?employee_empid=${this.skillEmployeeFilter}`;
    }
    if (this.skillSearch) {
      url += url.includes('?') ? `&skill=${this.skillSearch}` : `?skill=${this.skillSearch}`;
    }
    
    this.http.get<any>(url, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.competencies = data.competencies || [];
          this.competenciesLoading = false;
        },
        error: (err) => {
          console.error('Error loading competencies:', err);
          this.toastService.show('Failed to load competencies', 'error');
          this.competenciesLoading = false;
        }
      });
  }

  loadGapAnalysis(): void {
    this.http.get<any>(this.apiService.adminSkillsGapAnalysisUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.gapAnalysis = data;
        },
        error: (err) => {
          console.error('Error loading gap analysis:', err);
          this.toastService.show('Failed to load gap analysis', 'error');
        }
      });
  }

  loadFeedbackRatings(): void {
    this.feedbackRatingsLoading = true;
    this.http.get<any>(this.apiService.adminFeedbackRatingsUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.allFeedbackRatings = data.trainings || [];
          this.topFeedbackRatings = this.allFeedbackRatings.slice(0, 5);
          this.feedbackRatingsLoading = false;
        },
        error: (err) => {
          console.error('Error loading feedback ratings:', err);
          this.feedbackRatingsLoading = false;
        }
      });
  }

  loadAdditionalDashboardCards(): void {
    this.newCardsLoading = true;
    
    // Calculate Training Rate based on assignments vs trainings available
    // Definition: Assigned Trainings ÷ Available Trainings × 100
    // Uses total assignments as the count of trainings assigned out.
    this.trainingRateNumerator = this.totalAssignments;
    this.trainingRateDenominator = this.totalTrainings;
    this.trainingRate = this.trainingRateDenominator > 0
      ? (this.trainingRateNumerator / this.trainingRateDenominator) * 100
      : 0;
    
    // Calculate overall training completion rate
    this.completionNumerator = this.attendedAssignments;
    this.completionDenominator = this.totalAssignments;
    this.trainingCompletionRate = this.completionDenominator > 0
      ? (this.completionNumerator / this.completionDenominator) * 100
      : 0;
    
    // Get top 5 trainings by completion rate
    this.topCompletionTrainings = [...this.trainings]
      .filter(t => t.assigned_count > 0) // Only include trainings with assignments
      .sort((a, b) => b.completion_rate - a.completion_rate)
      .slice(0, 5);
    
    // Load top 5 trainers
    this.loadTopTrainers();
  }

  loadTopTrainers(): void {
    // Compute top trainers based on the selected basis
    this.topTrainers = this.computeTopTrainers(this.trainerRankBasis);
    this.newCardsLoading = false;
  }

  private computeTopTrainers(basis: 'deliveries' | 'completion' | 'assigned' | 'attended')
    : Array<{ name: string; value: number; display: string; metric: 'deliveries' | 'completion' | 'assigned' | 'attended'; count?: number; }> {
    const result: Array<{ name: string; value: number; display: string; metric: 'deliveries' | 'completion' | 'assigned' | 'attended'; count?: number; }> = [];
    if (!this.trainings || this.trainings.length === 0) return result;

    // Build aggregates per trainer (filter out invalid names)
    const trainerMap = new Map<string, { deliveries: number; assigned: number; attended: number; completion: number }>();
    const namesSet = new Set<string>();
    this.trainings.forEach(t => {
      const name = t.trainer_name || 'Unknown';
      // Filter out "Not Assigned", "Unknown", empty strings, etc.
      if (!name || name.trim() === '' || name.toLowerCase() === 'not assigned' || name.toLowerCase() === 'unknown') {
        return;
      }
      namesSet.add(name);
      if (!trainerMap.has(name)) {
        trainerMap.set(name, { deliveries: 0, assigned: 0, attended: 0, completion: 0 });
      }
      const agg = trainerMap.get(name)!;
      agg.deliveries += 1;
      agg.assigned += t.assigned_count || 0;
      agg.attended += t.attended_count || 0;
    });

    // Compute completion after counts
    trainerMap.forEach(agg => {
      agg.completion = agg.assigned > 0 ? (agg.attended / agg.assigned) * 100 : 0;
    });

    // Build sortable array according to basis
    namesSet.forEach(name => {
      const agg = trainerMap.get(name)!;
      let value = 0;
      let display = '';
      if (basis === 'deliveries') {
        value = agg.deliveries;
        display = `${agg.deliveries}`;
      } else if (basis === 'assigned') {
        value = agg.assigned;
        display = `${agg.assigned}`;
      } else if (basis === 'attended') {
        value = agg.attended;
        display = `${agg.attended}`;
      } else { // completion
        value = Math.round(agg.completion * 100) / 100;
        display = `${Math.round(agg.completion)}%`;
      }
      result.push({ name, value, display, metric: basis, count: agg.deliveries });
    });

    // Sort desc by value and take top 5
    return result.sort((a, b) => (b.value - a.value)).slice(0, 5);
  }

  onTrainerRankBasisChange(basis: 'deliveries' | 'completion' | 'assigned' | 'attended') {
    this.trainerRankBasis = basis;
    this.topTrainers = this.computeTopTrainers(this.trainerRankBasis);
  }

  getTrainerRankLabel(): string {
    return this.trainerRankLabels[this.trainerRankBasis];
  }

  getTrainerBasisSubtext(): string {
    switch (this.trainerRankBasis) {
      case 'deliveries':
        return 'Leading trainers by number of training deliveries';
      case 'completion':
        return 'Leading trainers by average completion rate across their trainings';
      case 'assigned':
        return 'Leading trainers by total assigned candidates across their trainings';
      case 'attended':
        return 'Leading trainers by total attendees across their trainings';
    }
  }

  // ==================== TRAINING RATES HELPERS ====================
  private parseSeats(val: any): number {
    if (val == null) return 0;
    try {
      const str = String(val);
      const match = str.match(/\d+/);
      return match ? Number(match[0]) : 0;
    } catch {
      return 0;
    }
  }

  getSeatsNumber(t: Training): number {
    return this.parseSeats(t.seats);
  }

  getTrainingRateValue(t: Training): number {
    const assigned = t.assigned_count || 0;
    const totalAssigned = this.totalAssignments || 0;
    if (totalAssigned > 0) {
      const rate = (assigned / totalAssigned) * 100;
      return Math.round(rate * 100) / 100; // 2-decimals
    }
    return 0;
  }

  getCompletionRateValue(t: Training): number {
    if (typeof t.completion_rate === 'number') {
      return Math.round(t.completion_rate * 100) / 100; // ensure 2-decimals
    }
    const assigned = t.assigned_count || 0;
    const attended = t.attended_count || 0;
    if (assigned > 0) {
      const rate = (attended / assigned) * 100;
      return Math.round(rate * 100) / 100;
    }
    return 0;
  }

  getAllTrainingRatesRows(): Array<{
    name: string;
    trainer: string;
    assigned: number;
    attended: number;
    trainingRate: number;
    completionRate: number;
    seats: number;
    insight: string;
    ref: Training;
  }> {
    const rows = (this.trainings || []).map(t => ({
      name: t.training_name,
      trainer: t.trainer_name || 'Unknown',
      assigned: t.assigned_count || 0,
      attended: t.attended_count || 0,
      trainingRate: this.getTrainingRateValue(t),
      completionRate: this.getCompletionRateValue(t),
      seats: this.getSeatsNumber(t),
      insight: this.getTrainingInsight(t),
      ref: t
    }));

    // filter
    const q = (this.allRatesSearch || '').toLowerCase();
    const filtered = q
      ? rows.filter(r =>
          (r.name || '').toLowerCase().includes(q) ||
          (r.trainer || '').toLowerCase().includes(q)
        )
      : rows;

    // sort
    const key = this.allRatesSort;
    const dir = this.allRatesSortDir === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      const va = a[key];
      const vb = b[key];
      if (typeof va === 'string' && typeof vb === 'string') {
        return va.localeCompare(vb) * dir;
      }
      return ((va as number) - (vb as number)) * dir;
    });

    return filtered;
  }

  getTrainingInsight(t: Training): string {
    const assigned = t.assigned_count || 0;
    const attended = t.attended_count || 0;
    const trainingRate = this.getTrainingRateValue(t);
    const completion = this.getCompletionRateValue(t);

    if (!t.training_name) return 'Needs definition';
    if (assigned === 0) return 'No learners assigned yet';
    if (trainingRate >= 20) return 'High participation rate';
    if (trainingRate >= 10) return 'Good participation';
    if (trainingRate >= 5) return 'Moderate participation';
    if (trainingRate < 5) return 'Low participation';
    if (completion >= 90) return 'Excellent completion rate';
    if (completion >= 75) return 'Steady progress';
    if (completion < 60) return 'Completion risk';
    return 'Monitor engagement';
  }

  getTrainingStats(trainingName: string): any {
      const training = this.trainings.find(t => t.training_name === trainingName);
      if (training) {
        const rate = training.assigned_count > 0 
          ? (training.attended_count / training.assigned_count) * 100 
          : 0;
        return {
          assigned: training.assigned_count || 0,
          attended: training.attended_count || 0,
          rate: rate
        };
      }
      return { assigned: 0, attended: 0, rate: 0 };
  }

  getTrainerTrainings(trainerName: string): Training[] {
    return this.trainings.filter(t => t.trainer_name === trainerName);
  }

  getTrainerAggregates(trainerName: string): { trainings: number; assigned: number; attended: number; completion: number; } {
    const list = this.getTrainerTrainings(trainerName);
    let assigned = 0;
    let attended = 0;
    list.forEach(t => {
      assigned += t.assigned_count || 0;
      attended += t.attended_count || 0;
    });
    const completion = assigned > 0 ? Math.round((attended / assigned) * 10000) / 100 : 0;
    return { trainings: list.length, assigned, attended, completion };
  }

  getTop5TrainingsByAssignment(): Array<{
    name: string;
    assigned: number;
    trainingRate: number;
  }> {
    const rows = (this.trainings || [])
      .map(t => ({
        name: t.training_name,
        assigned: t.assigned_count || 0,
        trainingRate: this.getTrainingRateValue(t)
      }))
      .sort((a, b) => b.assigned - a.assigned)  // Sort by assigned count descending
      .slice(0, 5);  // Take top 5
    return rows;
  }

  getAllTrainersWithCounts(): Array<{
    name: string;
    trainingCount: number;
  }> {
    const trainerMap = new Map<string, number>();
    
    // Get known trainer names from trainerUsers (loaded from backend)
    const knownTrainerNames = (this.trainerUsers || [])
      .map(t => t.name?.trim())
      .filter(name => name && name.length > 0);
    
    console.log('Known trainer names from backend:', knownTrainerNames);
    
    // Process each training
    (this.trainings || []).forEach(t => {
      let nameField = t.trainer_name;
      
      // Filter out invalid names
      if (!nameField || nameField.trim() === '' || 
          nameField.toLowerCase() === 'not assigned' || 
          nameField.toLowerCase() === 'unknown') {
        return;
      }
      
      nameField = nameField.trim();
      const nameLower = nameField.toLowerCase();
      const matchedTrainers: string[] = [];
      
      // Check each known trainer name
      for (const knownName of knownTrainerNames) {
        const knownLower = knownName.toLowerCase();
        // Check if this known trainer name appears in the training's trainer_name
        if (nameLower.includes(knownLower)) {
          matchedTrainers.push(knownName);
        }
      }
      
      console.log(`Training "${t.training_name}" has trainer_name: "${nameField}" -> matched: [${matchedTrainers.join(', ')}]`);
      
      // If no matches, treat as single trainer
      if (matchedTrainers.length === 0) {
        matchedTrainers.push(nameField);
      }
      
      // Count each matched trainer
      matchedTrainers.forEach(name => {
        trainerMap.set(name, (trainerMap.get(name) || 0) + 1);
      });
    });

    const result: Array<{ name: string; trainingCount: number }> = [];
    trainerMap.forEach((count, name) => {
      result.push({ name, trainingCount: count });
    });

    console.log('Final trainer counts:', result);

    // Sort by training count descending
    return result.sort((a, b) => b.trainingCount - a.trainingCount);
  }

  getTrainingByName(name: string): Training | null {
    const match = this.trainings.find(t => t.training_name === name);
    return match ? { ...match } : null;
  }

  openEditSkillModal(competency: Competency): void {
    this.selectedCompetency = { ...competency };
    this.skillUpdate = {
      current_expertise: competency.current_expertise || '',
      target_expertise: competency.target_expertise || ''
    };
    this.showEditSkillModal = true;
  }

  updateSkill(): void {
    if (!this.selectedCompetency) return;

    // Validate required fields
    if (!this.skillUpdate.current_expertise || !this.skillUpdate.target_expertise) {
      this.toastService.show('Both Current Expertise and Target Expertise are required', 'warning');
      return;
    }

    // Trim whitespace
    const payload = {
      current_expertise: this.skillUpdate.current_expertise.trim(),
      target_expertise: this.skillUpdate.target_expertise.trim()
    };

    // Validate after trimming
    if (!payload.current_expertise || !payload.target_expertise) {
      this.toastService.show('Both Current Expertise and Target Expertise are required', 'warning');
      return;
    }

    this.http.put(this.apiService.adminSkillCompetencyUrl(this.selectedCompetency.id), payload, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.toastService.show('Skill updated successfully', 'success');
          this.showEditSkillModal = false;
          this.loadCompetencies();
          this.loadGapAnalysis();
          this.loadDashboardData();
          // Delay analytics refresh slightly to ensure database is updated
          setTimeout(() => {
            this.loadAnalytics(); // Refresh analytics data
          }, 500);
        },
        error: (err) => {
          console.error('Error updating skill:', err);
          // Handle different error response structures
          let errorMessage = 'Failed to update skill';
          
          if (err.error) {
            if (typeof err.error === 'string') {
              errorMessage = err.error;
            } else if (err.error.detail) {
              errorMessage = typeof err.error.detail === 'string' 
                ? err.error.detail 
                : JSON.stringify(err.error.detail);
            } else if (Array.isArray(err.error) && err.error.length > 0) {
              // FastAPI validation error format
              errorMessage = err.error.map((e: any) => e.msg || e.message).join(', ');
            } else {
              errorMessage = err.statusText || errorMessage;
            }
          }
          
          this.toastService.show(errorMessage, 'error');
        }
      });
  }

  openCreateSkillModal(): void {
    this.newCompetency = {
      employee_empid: '',
      employee_name: '',
      skill: '',
      competency: '',
      current_expertise: '',
      target_expertise: '',
      department: '',
      division: '',
      project: '',
      role_specific_comp: '',
      destination: '',
      comments: '',
      target_date: ''
    };
    // Load employees for selection
    this.loadAllEmployees();
    this.showCreateSkillModal = true;
  }

  loadAllEmployees(): void {
    this.http.get<any>(`${this.apiService.adminUsersUrl}?page=1&limit=1000`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.allEmployees = (data.users || []).filter((u: User) => u.role === 'employee' || u.role === 'manager');
        },
        error: (err) => {
          console.error('Error loading employees:', err);
        }
      });
  }

  onEmployeeSelected(employeeEmpid: string): void {
    if (employeeEmpid) {
      const employee = this.allEmployees.find(u => u.username === employeeEmpid);
      if (employee) {
        this.newCompetency.employee_empid = employee.username;
        this.newCompetency.employee_name = employee.name || employee.username;
      }
    } else {
      this.newCompetency.employee_empid = '';
      this.newCompetency.employee_name = '';
    }
  }

  createSkill(): void {
    if (!this.newCompetency.employee_empid || !this.newCompetency.employee_name || !this.newCompetency.skill) {
      this.toastService.show('Please fill in employee ID, employee name, and skill', 'error');
      return;
    }

    if (!this.newCompetency.current_expertise || !this.newCompetency.target_expertise) {
      this.toastService.show('Please specify both current and target expertise levels', 'error');
      return;
    }

    // Prepare payload, converting empty strings to null for optional fields
    const payload: any = {
      employee_empid: this.newCompetency.employee_empid,
      employee_name: this.newCompetency.employee_name,
      skill: this.newCompetency.skill,
      current_expertise: this.newCompetency.current_expertise,
      target_expertise: this.newCompetency.target_expertise,
      competency: this.newCompetency.competency || null,
      department: this.newCompetency.department || null,
      division: this.newCompetency.division || null,
      project: this.newCompetency.project || null,
      role_specific_comp: this.newCompetency.role_specific_comp || null,
      destination: this.newCompetency.destination || null,
      comments: this.newCompetency.comments || null,
      target_date: this.newCompetency.target_date || null
    };

    this.http.post(this.apiService.adminSkillsCompetenciesUrl, payload, { headers: this.getHeaders() })
      .subscribe({
        next: (data: any) => {
          this.toastService.show(data.message || 'Skill created successfully', 'success');
          this.showCreateSkillModal = false;
          this.loadCompetencies();
          this.loadGapAnalysis();
          this.loadDashboardData();
          // Delay analytics refresh slightly to ensure database is updated
          setTimeout(() => {
            this.loadAnalytics(); // Refresh analytics data
          }, 500);
        },
        error: (err) => {
          this.toastService.show(err.error?.detail || 'Failed to create skill', 'error');
        }
      });
  }

  // ==================== DATA MANAGEMENT ====================
  onExcelFileSelected(event: any): void {
    this.excelFile = event.target.files[0];
  }

  onCsvFileSelected(event: any): void {
    this.csvFile = event.target.files[0];
  }

  uploadExcel(): void {
    if (!this.excelFile) {
      this.toastService.show('Please select an Excel file', 'error');
      return;
    }

    this.uploading = true;
    const formData = new FormData();
    formData.append('file', this.excelFile);

    this.http.post(this.apiService.uploadExcelUrl, formData, { headers: this.getFormHeaders() })
      .subscribe({
        next: (data: any) => {
          this.toastService.show(data.message || 'Excel file uploaded successfully', 'success');
          this.uploading = false;
          this.excelFile = null;
          // Refresh all data to ensure consistency
          this.loadDashboardData();
          this.loadUsers();
          this.loadTrainings();
          this.loadCompetencies();
          this.loadGapAnalysis();
          // Delay analytics refresh to ensure database is fully updated after file upload
          setTimeout(() => {
            this.loadAnalytics(); // Refresh analytics data
          }, 1000);
        },
        error: (err) => {
          this.toastService.show(err.error?.detail || 'Failed to upload Excel file', 'error');
          this.uploading = false;
        }
      });
  }

  uploadCsv(): void {
    if (!this.csvFile) {
      this.toastService.show('Please select a CSV file', 'error');
      return;
    }

    this.uploading = true;
    const formData = new FormData();
    formData.append('file', this.csvFile);

    this.http.post(this.apiService.uploadCsvUrl, formData, { headers: this.getFormHeaders() })
      .subscribe({
        next: (data: any) => {
          this.toastService.show(data.message || 'CSV file uploaded successfully', 'success');
          this.uploading = false;
          this.csvFile = null;
          // Refresh all data to ensure consistency
          this.loadDashboardData();
          this.loadUsers();
          // Delay analytics refresh to ensure database is fully updated after file upload
          setTimeout(() => {
            this.loadAnalytics(); // Refresh analytics data
          }, 1000);
        },
        error: (err) => {
          this.toastService.show(err.error?.detail || 'Failed to upload CSV file', 'error');
          this.uploading = false;
        }
      });
  }

  // ==================== ANALYTICS ====================
  loadAnalytics(): void {
    this.analyticsLoading = true;
    // Add cache-busting parameter to ensure fresh data
    const url = `${this.apiService.adminAnalyticsOverviewUrl}?t=${Date.now()}`;
    this.http.get<any>(url, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.analytics = data;
          this.analyticsLoading = false;
        },
        error: (err) => {
          console.error('Error loading analytics:', err);
          this.toastService.show('Failed to load analytics', 'error');
          this.analyticsLoading = false;
        }
      });
  }

  // ==================== TAB MANAGEMENT ====================
  selectTab(tab: string): void {
    this.activeTab = tab;
    
    // Load data when switching tabs
    if (tab === 'users') {
      this.loadUsers();
    } else if (tab === 'trainings') {
      this.loadTrainings();
    } else if (tab === 'skills') {
      this.loadCompetencies();
      this.loadGapAnalysis();
    } else if (tab === 'analytics') {
      // Always reload analytics when switching to analytics tab to ensure fresh data
      this.loadAnalytics();
    } else if (tab === 'dashboard') {
      // Reload dashboard data when switching back to dashboard
      this.loadDashboardData();
    }
  }

  // ==================== REPORT GENERATION ====================
  
  openReportModal(): void {
    this.showReportModal = true;
    this.selectedReportType = '';
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.selectedReportType = '';
  }

  selectReportType(reportType: string): void {
    this.selectedReportType = reportType;
  }

  generateReport(): void {
    if (!this.selectedReportType) {
      this.toastService.show('Please select a report type', 'error');
      return;
    }

    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.toastService.show('Please log in to continue', 'error');
      this.router.navigate(['/login']);
      return;
    }

    this.generatingReport = true;
    const url = this.apiService.adminGenerateReportUrl(this.selectedReportType);
    const token = this.authService.getToken();

    // Create headers without Content-Type for blob response
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(url, {
      headers: headers,
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: (response: any) => {
        // Extract filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `report_${this.selectedReportType}_${new Date().getTime()}.csv`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }

        // Create blob and download
        const blob = new Blob([response.body], { type: 'text/csv' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        this.toastService.show('Report generated successfully', 'success');
        this.generatingReport = false;
        this.closeReportModal();
      },
      error: (err) => {
        console.error('Error generating report:', err);
        this.toastService.show(err.error?.detail || 'Failed to generate report', 'error');
        this.generatingReport = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
