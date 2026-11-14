import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  Search,
  MapPin,
  Filter,
  Sparkles,
  Building,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  X,
  Send,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { getJobs, getRecommendations, applyToJob, getApplications, getProfile } from '../services/api';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [userSkills, setUserSkills] = useState([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedJobType, setSelectedJobType] = useState('All');
  const [selectedExpLevel, setSelectedExpLevel] = useState('All');
  const [viewMode, setViewMode] = useState('recommended'); // 'recommended' | 'all'

  // Modal detail states
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');

  // Fetch initial profile skills and existing applications
  const initUserData = async () => {
    try {
      const [appRes, profRes] = await Promise.allSettled([getApplications(), getProfile()]);
      if (appRes.status === 'fulfilled') {
        const apps = appRes.value.applications || appRes.value || [];
        const ids = new Set(apps.map((a) => a.job_id || a.id));
        setAppliedJobIds(ids);
      }
      if (profRes.status === 'fulfilled') {
        const prof = profRes.value.profile || profRes.value || {};
        const skills = (prof.skills || []).map((s) => {
          const val = typeof s === 'string' ? s : (s.skill_name || s.name || '');
          return val.toLowerCase();
        }).filter(Boolean);
        setUserSkills(skills);
      }
    } catch (err) {
      console.warn('Could not retrieve user application state:', err);
    }
  };

  const loadJobsList = async () => {
    setLoading(true);
    try {
      if (viewMode === 'recommended') {
        const res = await getRecommendations();
        const list = res.recommendations || res || [];
        setJobs(Array.isArray(list) ? list : []);
      } else {
        const params = {};
        if (searchQuery.trim()) params.search = searchQuery.trim();
        if (selectedLocation !== 'All') params.location = selectedLocation;
        if (selectedJobType !== 'All') params.job_type = selectedJobType;
        if (selectedExpLevel !== 'All') params.experience_level = selectedExpLevel;

        const res = await getJobs(params);
        const list = res.jobs || res || [];
        setJobs(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initUserData();
  }, []);

  useEffect(() => {
    loadJobsList();
  }, [viewMode, selectedLocation, selectedJobType, selectedExpLevel]);

  // Handle URL query parameter ?selected=<job_id>
  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId && jobs.length > 0) {
      const found = jobs.find((j) => String(j.id) === String(selectedId));
      if (found) {
        setSelectedJob(found);
      }
    }
  }, [searchParams, jobs]);

  // Filter jobs locally based on search query if in recommended mode
  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = job.title?.toLowerCase().includes(q);
    const companyMatch = job.company?.toLowerCase().includes(q);
    const descMatch = job.description?.toLowerCase().includes(q);
    return titleMatch || companyMatch || descMatch;
  });

  // Calculate skill gap for modal
  const parseSkillsList = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) {
      return skills.map((s) => (typeof s === 'string' ? s : s.skill_name || s.name || '')).filter(Boolean);
    }
    if (typeof skills === 'string') {
      return skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const getMatchedAndMissingSkills = (job) => {
    const reqSkills = parseSkillsList(job?.required_skills);
    const matched = [];
    const missing = [];

    reqSkills.forEach((skill) => {
      if (userSkills.includes(skill.toLowerCase())) {
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    });

    return { matched, missing };
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    setIsApplying(true);
    setApplyError('');
    try {
      await applyToJob(selectedJob.id, coverLetter);
      setApplySuccess(true);
      setAppliedJobIds((prev) => new Set([...prev, selectedJob.id]));
      setTimeout(() => {
        setApplySuccess(false);
        setSelectedJob(null);
        setCoverLetter('');
      }, 2000);
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setIsApplying(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-secondary-400 bg-secondary-500/10 border-secondary-500/30';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header & Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Job Opportunities</h1>
          <p className="text-dark-400 text-sm mt-1">
            Browse graduate tech positions matching your exact skill profile.
          </p>
        </div>

        {/* Recommended vs All Toggle */}
        <div className="inline-flex p-1 bg-dark-900 border border-dark-800 rounded-2xl shrink-0 self-start md:self-auto">
          <button
            type="button"
            id="jobs-toggle-recommended"
            onClick={() => setViewMode('recommended')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'recommended'
                ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/25'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Recommended</span>
          </button>
          <button
            type="button"
            id="jobs-toggle-all"
            onClick={() => setViewMode('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'all'
                ? 'bg-dark-700 text-white shadow'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>All Jobs</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="jobs-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or company..."
              className="input-field pl-10 text-xs !py-2.5"
            />
          </div>

          {/* Location Dropdown */}
          <div className="relative">
            <MapPin className="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              id="jobs-filter-location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="input-field pl-10 text-xs !py-2.5"
            >
              <option value="All">All Locations</option>
              <option value="Remote">Remote</option>
              <option value="San Francisco, CA">San Francisco, CA</option>
              <option value="New York, NY">New York, NY</option>
              <option value="Austin, TX">Austin, TX</option>
              <option value="Seattle, WA">Seattle, WA</option>
            </select>
          </div>

          {/* Job Type Dropdown */}
          <div>
            <select
              id="jobs-filter-type"
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="input-field text-xs !py-2.5"
            >
              <option value="All">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          {/* Experience Level Dropdown */}
          <div>
            <select
              id="jobs-filter-experience"
              value={selectedExpLevel}
              onChange={(e) => setSelectedExpLevel(e.target.value)}
              className="input-field text-xs !py-2.5"
            >
              <option value="All">All Experience</option>
              <option value="Fresh Graduate">Fresh Graduate</option>
              <option value="Entry-level">Entry-level (0-1 yr)</option>
              <option value="Junior">Junior (1-2 yrs)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid (2 cols desktop, 1 col mobile) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="glass-card p-6 h-48 animate-pulse bg-dark-800/40" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="glass-card p-12 text-center border-dashed">
          <Briefcase className="w-12 h-12 text-dark-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No job openings found</h3>
          <p className="text-sm text-dark-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or switch to "All Jobs" view.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map((job) => {
            const score = Math.round(job.match_score || job.score || 85);
            const isApplied = appliedJobIds.has(job.id);
            const skills = parseSkillsList(job.required_skills);

            return (
              <div
                key={job.id}
                id={`job-card-${job.id}`}
                onClick={() => setSelectedJob(job)}
                className="glass-card-hover p-6 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-primary-300 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-dark-300 mt-0.5">
                        <span className="font-semibold">{job.company}</span>
                        <span>•</span>
                        <span className="text-dark-400 flex items-center gap-1 text-xs">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location || 'Remote'}
                        </span>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 shrink-0 ${getScoreColor(
                        score
                      )}`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{score}% Match</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 my-3 text-xs">
                    <span className="badge bg-dark-800 text-dark-300 border border-dark-700">
                      {job.job_type || 'Full-time'}
                    </span>
                    {job.salary_range && (
                      <span className="badge bg-dark-800 text-dark-300 border border-dark-700 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-secondary-400" />
                        {job.salary_range}
                      </span>
                    )}
                    {job.experience_level && (
                      <span className="badge bg-dark-800 text-dark-300 border border-dark-700">
                        {job.experience_level}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-dark-400 line-clamp-2 leading-relaxed mb-4">
                    {job.description}
                  </p>
                </div>

                <div>
                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {skills.slice(0, 5).map((skill, idx) => {
                      const hasSkill = userSkills.includes(skill.toLowerCase());
                      return (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                            hasSkill
                              ? 'bg-secondary-500/15 text-secondary-300 border border-secondary-500/30'
                              : 'bg-dark-800 text-dark-300 border border-dark-700'
                          }`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                    {skills.length > 5 && (
                      <span className="px-2 py-0.5 rounded-md bg-dark-800 text-dark-400 text-[11px]">
                        +{skills.length - 5} more
                      </span>
                    )}
                  </div>

                  {/* Bottom bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-dark-800 text-xs text-dark-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {job.created_at
                        ? new Date(job.created_at).toLocaleDateString()
                        : 'Recently posted'}
                    </span>

                    {isApplied ? (
                      <span className="badge-success text-xs">Applied</span>
                    ) : (
                      <span className="text-primary-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* JOB DETAIL MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedJob(null)}
          />

          <div
            id="job-detail-modal"
            className="relative w-full max-w-3xl glass-card bg-dark-900 border border-dark-700 p-6 sm:p-8 rounded-3xl shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-fade-in"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedJob(null)}
              id="job-modal-close-btn"
              className="absolute top-6 right-6 p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="pr-10 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="badge-primary text-xs">{selectedJob.job_type || 'Full-time'}</span>
                {appliedJobIds.has(selectedJob.id) && (
                  <span className="badge-success text-xs">Application Submitted</span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {selectedJob.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-dark-300 mt-2">
                <span className="font-semibold text-white">{selectedJob.company}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-dark-400">
                  <MapPin className="w-4 h-4 text-primary-400" />
                  {selectedJob.location || 'Remote'}
                </span>
                {selectedJob.salary_range && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-secondary-400 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      {selectedJob.salary_range}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Match Score & Skill Gap Section */}
            {(() => {
              const score = Math.round(selectedJob.match_score || selectedJob.score || 85);
              const { matched, missing } = getMatchedAndMissingSkills(selectedJob);

              return (
                <div className="p-5 rounded-2xl bg-dark-950/60 border border-dark-800 mb-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-dark-800">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary-400" />
                      <span className="text-sm font-bold text-white">AI Compatibility Breakdown</span>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-xl border text-xs font-bold ${getScoreColor(
                        score
                      )}`}
                    >
                      {score}% Profile Match
                    </div>
                  </div>

                  {/* Skills You Have vs Missing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-secondary-400 font-semibold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-secondary-400" />
                        Skills You Match ({matched.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {matched.length > 0 ? (
                          matched.map((s, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-secondary-500/15 text-secondary-300 border border-secondary-500/30"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-dark-500 italic">No matching skills identified</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-red-400 font-semibold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-red-400" />
                        Missing Skill Requirements ({missing.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {missing.length > 0 ? (
                          missing.map((s, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-300 border border-red-500/30"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-secondary-400 font-medium">All required skills met!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Description */}
            <div className="space-y-4 mb-6 text-sm text-dark-300 leading-relaxed">
              <h3 className="text-base font-bold text-white">Role Overview</h3>
              <p className="whitespace-pre-line">{selectedJob.description}</p>

              {selectedJob.requirements && (
                <>
                  <h3 className="text-base font-bold text-white pt-2">Qualifications</h3>
                  <p className="whitespace-pre-line">{selectedJob.requirements}</p>
                </>
              )}
            </div>

            {/* Application Section */}
            <div className="pt-6 border-t border-dark-800 space-y-4">
              {appliedJobIds.has(selectedJob.id) ? (
                <div className="p-4 rounded-xl bg-secondary-500/10 border border-secondary-500/30 text-secondary-300 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>You have already submitted an application for this position.</span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-dark-300 mb-2">
                      Personal Note / Cover Letter (Optional)
                    </label>
                    <textarea
                      id="job-cover-letter-input"
                      rows="3"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Briefly state why you're a great fit for this role and your graduation project highlights..."
                      className="input-field text-sm resize-none"
                    />
                  </div>

                  {applyError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{applyError}</span>
                    </div>
                  )}

                  {applySuccess && (
                    <div className="p-3 rounded-xl bg-secondary-500/10 border border-secondary-500/30 text-secondary-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Application sent successfully! Good luck.</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedJob(null)}
                      className="btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      id="job-apply-submit-btn"
                      disabled={isApplying || applySuccess}
                      onClick={handleApply}
                      className="btn-primary text-sm flex items-center gap-2"
                    >
                      {isApplying ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Submit Application</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
