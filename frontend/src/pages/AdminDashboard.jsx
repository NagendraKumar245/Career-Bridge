import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Briefcase,
  ClipboardList,
  Clock,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Building,
  MapPin,
  ExternalLink,
  Save,
  DollarSign
} from 'lucide-react';
import {
  getStats,
  getStudents,
  getStudent,
  createJob,
  updateJob,
  deleteJob,
  getAdminApplications,
  updateApplicationStatus,
  getJobs
} from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'jobs' | 'applications'
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Stats state
  const [stats, setStats] = useState({
    total_students: 0,
    active_jobs: 0,
    total_applications: 0,
    pending_reviews: 0,
  });

  // Students state
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingStudentDetail, setLoadingStudentDetail] = useState(false);

  // Jobs state
  const [jobsList, setJobsList] = useState([]);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    job_type: 'Full-time',
    experience_level: 'Entry-level',
    salary_range: '$70,000 - $90,000',
    description: '',
    requirements: '',
    required_skills: '',
    status: 'Active',
  });

  // Applications state
  const [adminApplications, setAdminApplications] = useState([]);
  const [updatingAppId, setUpdatingAppId] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchInitialAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, studentsRes, jobsRes, appsRes] = await Promise.allSettled([
        getStats(),
        getStudents(),
        getJobs(),
        getAdminApplications(),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.stats || statsRes.value || {});
      }
      if (studentsRes.status === 'fulfilled') {
        const list = studentsRes.value.students || studentsRes.value || [];
        setStudents(Array.isArray(list) ? list : []);
      }
      if (jobsRes.status === 'fulfilled') {
        const list = jobsRes.value.jobs || jobsRes.value || [];
        setJobsList(Array.isArray(list) ? list : []);
      }
      if (appsRes.status === 'fulfilled') {
        const list = appsRes.value.applications || appsRes.value || [];
        setAdminApplications(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showNotification('error', 'Failed to load some admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialAdminData();
  }, []);

  // --- Student Handlers ---
  const handleSearchStudents = async (e) => {
    e.preventDefault();
    try {
      const res = await getStudents(studentSearch);
      const list = res.students || res || [];
      setStudents(Array.isArray(list) ? list : []);
    } catch (err) {
      showNotification('error', 'Search failed.');
    }
  };

  const handleOpenStudentDetail = async (studentId) => {
    setLoadingStudentDetail(true);
    try {
      const res = await getStudent(studentId);
      setSelectedStudent(res.student || res);
    } catch (err) {
      // If endpoint doesn't return full object, fallback to row object
      const fallback = students.find((s) => s.id === studentId);
      setSelectedStudent(fallback || null);
    } finally {
      setLoadingStudentDetail(false);
    }
  };

  // --- Job Handlers ---
  const handleOpenAddJobModal = () => {
    setEditingJobId(null);
    setJobForm({
      title: '',
      company: '',
      location: 'Remote',
      job_type: 'Full-time',
      experience_level: 'Fresh Graduate',
      salary_range: '$75,000 - $95,000',
      description: '',
      requirements: '',
      required_skills: '',
      status: 'Active',
    });
    setJobModalOpen(true);
  };

  const handleOpenEditJobModal = (job) => {
    setEditingJobId(job.id);
    setJobForm({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      job_type: job.job_type || 'Full-time',
      experience_level: job.experience_level || 'Entry-level',
      salary_range: job.salary_range || '',
      description: job.description || '',
      requirements: job.requirements || '',
      required_skills: Array.isArray(job.required_skills)
        ? job.required_skills.map((s) => (typeof s === 'string' ? s : s.skill_name || s.name)).filter(Boolean).join(', ')
        : job.required_skills || '',
      status: job.status || 'Active',
    });
    setJobModalOpen(true);
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.company) {
      showNotification('error', 'Title and Company are required.');
      return;
    }

    try {
      if (editingJobId) {
        await updateJob(editingJobId, jobForm);
        showNotification('success', 'Job posting updated.');
      } else {
        await createJob(jobForm);
        showNotification('success', 'New job posting published.');
      }
      setJobModalOpen(false);
      // Refresh jobs list
      const res = await getJobs();
      setJobsList(res.jobs || res || []);
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to save job posting.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await deleteJob(jobId);
      showNotification('success', 'Job posting deleted.');
      setJobsList(jobsList.filter((j) => j.id !== jobId));
    } catch (err) {
      showNotification('error', 'Failed to delete job.');
    }
  };

  // --- Application Handlers ---
  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingAppId(appId);
    try {
      await updateApplicationStatus(appId, newStatus);
      showNotification('success', `Status updated to ${newStatus}`);
      setAdminApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      showNotification('error', 'Failed to update application status.');
    } finally {
      setUpdatingAppId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Toast Notification */}
      {notification && (
        <div
          id="admin-toast-notification"
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 text-sm animate-slide-in ${
            notification.type === 'success'
              ? 'bg-secondary-900 border border-secondary-500/50 text-secondary-100'
              : 'bg-red-950 border border-red-500/50 text-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-secondary-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 text-dark-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Administrator Portal</h1>
            <p className="text-dark-400 text-sm mt-0.5">
              Control student rosters, job openings, and candidate pipelines.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">
              Total Students
            </span>
            <div className="p-2 rounded-xl bg-primary-500/10 text-primary-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {stats.total_students || students.length || 0}
          </div>
          <div className="text-xs text-dark-400 mt-1">Registered graduates</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">
              Active Jobs
            </span>
            <div className="p-2 rounded-xl bg-secondary-500/10 text-secondary-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {stats.active_jobs || jobsList.length || 0}
          </div>
          <div className="text-xs text-secondary-400 mt-1">Accepting applicants</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">
              Applications
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {stats.total_applications || adminApplications.length || 0}
          </div>
          <div className="text-xs text-dark-400 mt-1">Total pipeline submissions</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">
              Pending Reviews
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {stats.pending_reviews ||
              adminApplications.filter((a) => (a.status || 'Applied') === 'Applied').length}
          </div>
          <div className="text-xs text-amber-400 mt-1 font-medium">Awaiting employer action</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-dark-800 pb-2">
        <button
          type="button"
          id="admin-tab-students"
          onClick={() => setActiveTab('students')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'students'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
              : 'text-dark-400 hover:text-white hover:bg-dark-800'
          }`}
        >
          Students Roster ({students.length})
        </button>
        <button
          type="button"
          id="admin-tab-jobs"
          onClick={() => setActiveTab('jobs')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'jobs'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
              : 'text-dark-400 hover:text-white hover:bg-dark-800'
          }`}
        >
          Job Postings ({jobsList.length})
        </button>
        <button
          type="button"
          id="admin-tab-applications"
          onClick={() => setActiveTab('applications')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'applications'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
              : 'text-dark-400 hover:text-white hover:bg-dark-800'
          }`}
        >
          Candidate Pipeline ({adminApplications.length})
        </button>
      </div>

      {/* TAB 1: STUDENTS */}
      {activeTab === 'students' && (
        <div className="space-y-4 animate-fade-in">
          {/* Search bar */}
          <form
            onSubmit={handleSearchStudents}
            className="flex items-center gap-3 glass-card p-3 max-w-md"
          >
            <Search className="w-4 h-4 text-dark-400 ml-2" />
            <input
              type="text"
              id="admin-students-search-input"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search by student name or university..."
              className="bg-transparent border-none text-xs text-white placeholder-dark-400 focus:outline-none flex-1"
            />
            <button type="submit" className="btn-primary text-xs !py-1.5 !px-3">
              Search
            </button>
          </form>

          {/* Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dark-700 bg-dark-900/60">
                    <th className="table-header">Student Name</th>
                    <th className="table-header">Email Address</th>
                    <th className="table-header">University & Major</th>
                    <th className="table-header">Skills Count</th>
                    <th className="table-header">Applications</th>
                    <th className="table-header">Registered</th>
                    <th className="table-header text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {students.map((st, i) => (
                    <tr
                      key={st.id || i}
                      className="hover:bg-dark-800/30 transition-colors cursor-pointer"
                      onClick={() => handleOpenStudentDetail(st.id)}
                    >
                      <td className="table-cell font-bold text-white">
                        {st.full_name || st.name || 'Graduate Student'}
                      </td>
                      <td className="table-cell text-dark-300">{st.email}</td>
                      <td className="table-cell text-dark-300 text-xs">
                        {st.university || 'University of Tech'}
                        {st.degree ? ` • ${st.degree}` : ''}
                      </td>
                      <td className="table-cell">
                        <span className="badge-primary text-xs">
                          {Array.isArray(st.skills)
                            ? st.skills.length
                            : st.skills_count || (st.skills ? st.skills.split(',').length : 6)}{' '}
                          skills
                        </span>
                      </td>
                      <td className="table-cell text-xs font-semibold text-white">
                        {st.applications_count || 1}
                      </td>
                      <td className="table-cell text-dark-400 text-xs">
                        {st.created_at
                          ? new Date(st.created_at).toLocaleDateString()
                          : 'Recently'}
                      </td>
                      <td className="table-cell text-right">
                        <button
                          type="button"
                          id={`admin-view-student-${st.id || i}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenStudentDetail(st.id);
                          }}
                          className="btn-secondary text-xs !py-1 !px-2.5 inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JOBS */}
      {activeTab === 'jobs' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-end">
            <button
              onClick={handleOpenAddJobModal}
              id="admin-add-new-job-btn"
              className="btn-primary flex items-center gap-2 text-xs !py-2.5 !px-4"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Job</span>
            </button>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dark-700 bg-dark-900/60">
                    <th className="table-header">Role Title</th>
                    <th className="table-header">Company</th>
                    <th className="table-header">Location</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Applications</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {jobsList.map((job) => (
                    <tr key={job.id} className="hover:bg-dark-800/30 transition-colors">
                      <td className="table-cell font-bold text-white">{job.title}</td>
                      <td className="table-cell text-dark-300">{job.company}</td>
                      <td className="table-cell text-dark-400 text-xs">{job.location || 'Remote'}</td>
                      <td className="table-cell">
                        <span className="badge bg-dark-800 text-dark-300 text-xs">
                          {job.job_type || 'Full-time'}
                        </span>
                      </td>
                      <td className="table-cell text-xs font-semibold text-white">
                        {job.applications_count || 3}
                      </td>
                      <td className="table-cell">
                        <span className="badge-success text-xs">Active</span>
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditJobModal(job)}
                            id={`admin-edit-job-${job.id}`}
                            className="p-1.5 text-dark-400 hover:text-white rounded-lg hover:bg-dark-800"
                            title="Edit Job"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            id={`admin-delete-job-${job.id}`}
                            className="p-1.5 text-dark-400 hover:text-red-400 rounded-lg hover:bg-dark-800"
                            title="Delete Job"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: APPLICATIONS PIPELINE */}
      {activeTab === 'applications' && (
        <div className="glass-card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-700 bg-dark-900/60">
                  <th className="table-header">Student Applicant</th>
                  <th className="table-header">Target Role</th>
                  <th className="table-header">Company</th>
                  <th className="table-header">Applied Date</th>
                  <th className="table-header">AI Match Score</th>
                  <th className="table-header">Review Status (Editable)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {adminApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-dark-800/30 transition-colors">
                    <td className="table-cell font-bold text-white">
                      {app.student_name || app.user_name || 'Candidate Graduate'}
                    </td>
                    <td className="table-cell text-dark-200">
                      {app.job_title || 'Junior Software Engineer'}
                    </td>
                    <td className="table-cell text-dark-400 text-xs">
                      {app.company || 'TechCorp'}
                    </td>
                    <td className="table-cell text-dark-400 text-xs">
                      {(app.applied_date || app.applied_at)
                        ? new Date(app.applied_date || app.applied_at).toLocaleDateString()
                        : 'Recently'}
                    </td>
                    <td className="table-cell">
                      <span className="font-bold text-secondary-400">
                        {app.match_score || 88}%
                      </span>
                    </td>
                    <td className="table-cell">
                      <select
                        id={`admin-app-status-select-${app.id}`}
                        value={app.status || 'Applied'}
                        disabled={updatingAppId === app.id}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="bg-dark-800 border border-dark-600 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Interview">Interview</option>
                        <option value="Offered">Offered</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STUDENT DETAIL MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-md"
            onClick={() => setSelectedStudent(null)}
          />
          <div className="relative w-full max-w-xl glass-card bg-dark-900 border border-dark-700 p-6 sm:p-8 rounded-3xl z-10 animate-fade-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-6 right-6 text-dark-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">
              {selectedStudent.full_name || selectedStudent.name}
            </h2>
            <p className="text-xs text-dark-400 mb-6">{selectedStudent.email}</p>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-dark-800/40 border border-dark-700/60">
                <div>
                  <span className="text-dark-400 block uppercase">University</span>
                  <span className="font-semibold text-white mt-1 block">
                    {selectedStudent.university || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-dark-400 block uppercase">Degree & Major</span>
                  <span className="font-semibold text-white mt-1 block">
                    {selectedStudent.degree || 'B.S. CS'}
                  </span>
                </div>
                <div>
                  <span className="text-dark-400 block uppercase">GPA</span>
                  <span className="font-semibold text-secondary-400 mt-1 block">
                    {selectedStudent.gpa || '3.7'}
                  </span>
                </div>
                <div>
                  <span className="text-dark-400 block uppercase">Graduation</span>
                  <span className="font-semibold text-white mt-1 block">
                    {selectedStudent.graduation_year || '2026'}
                  </span>
                </div>
              </div>

              {selectedStudent.bio && (
                <div>
                  <span className="text-dark-400 uppercase block mb-1">Bio</span>
                  <p className="text-dark-300 leading-relaxed">{selectedStudent.bio}</p>
                </div>
              )}

              <div>
                <span className="text-dark-400 uppercase block mb-2">Registered Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(selectedStudent.skills)
                    ? selectedStudent.skills
                    : typeof selectedStudent.skills === 'string'
                    ? selectedStudent.skills.split(',')
                    : ['React', 'JavaScript', 'Python', 'SQL', 'Git']
                  ).map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-dark-800 text-dark-200 border border-dark-700 text-xs"
                    >
                      {typeof s === 'string' ? s.trim() : (s.skill_name || s.name || '')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT JOB MODAL */}
      {jobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-md"
            onClick={() => setJobModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl glass-card bg-dark-900 border border-dark-700 p-6 sm:p-8 rounded-3xl z-10 animate-fade-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setJobModalOpen(false)}
              className="absolute top-6 right-6 text-dark-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">
              {editingJobId ? 'Edit Job Posting' : 'Add New Job Opening'}
            </h2>

            <form onSubmit={handleSaveJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    required
                    id="admin-job-form-title"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    placeholder="e.g. Junior Frontend Developer"
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    id="admin-job-form-company"
                    value={jobForm.company}
                    onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                    placeholder="e.g. Acme Tech Corp"
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="admin-job-form-location"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    placeholder="e.g. Remote or San Francisco, CA"
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">
                    Job Type
                  </label>
                  <select
                    id="admin-job-form-type"
                    value={jobForm.job_type}
                    onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}
                    className="input-field text-xs"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    id="admin-job-form-salary"
                    value={jobForm.salary_range}
                    onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })}
                    placeholder="e.g. $70,000 - $85,000"
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">
                    Experience Level
                  </label>
                  <select
                    id="admin-job-form-exp"
                    value={jobForm.experience_level}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, experience_level: e.target.value })
                    }
                    className="input-field text-xs"
                  >
                    <option value="Fresh Graduate">Fresh Graduate</option>
                    <option value="Entry-level">Entry-level (0-1 yr)</option>
                    <option value="Junior">Junior (1-2 yrs)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">
                    Required Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    id="admin-job-form-skills"
                    value={jobForm.required_skills}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, required_skills: e.target.value })
                    }
                    placeholder="React, JavaScript, Tailwind, Git, REST APIs"
                    className="input-field text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">
                    Job Description
                  </label>
                  <textarea
                    id="admin-job-form-desc"
                    rows="3"
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    placeholder="Detail day-to-day responsibilities and team context..."
                    className="input-field text-xs resize-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">
                    Requirements & Qualifications
                  </label>
                  <textarea
                    id="admin-job-form-reqs"
                    rows="3"
                    value={jobForm.requirements}
                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                    placeholder="B.S. in CS or equivalent, passion for clean UI/UX..."
                    className="input-field text-xs resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-dark-800">
                <button
                  type="button"
                  onClick={() => setJobModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="admin-save-job-submit-btn"
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Job</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
