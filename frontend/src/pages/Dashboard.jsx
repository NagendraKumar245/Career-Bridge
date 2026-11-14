import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Send,
  Target,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Building,
  MapPin,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRecommendations, getApplications, getProfile } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recsRes, appsRes, profRes] = await Promise.allSettled([
        getRecommendations(),
        getApplications(),
        getProfile(),
      ]);

      if (recsRes.status === 'fulfilled') {
        const data = recsRes.value?.recommendations || recsRes.value || [];
        setRecommendations(Array.isArray(data) ? data : []);
      }
      if (appsRes.status === 'fulfilled') {
        const data = appsRes.value?.applications || appsRes.value || [];
        setApplications(Array.isArray(data) ? data : []);
      }
      if (profRes.status === 'fulfilled') {
        setProfile(profRes.value?.profile || profRes.value || null);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Unable to load some dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute stats
  const totalApplications = applications.length;
  const totalMatchedJobs = recommendations.length;
  const avgMatchScore =
    recommendations.length > 0
      ? Math.round(
          recommendations.reduce((acc, job) => acc + (job.match_score || job.score || 0), 0) /
            recommendations.length
        )
      : 0;

  const totalSkills = profile?.skills?.length || 0;

  // Skill distribution for display
  const skillCategories = {};
  if (profile?.skills?.length) {
    profile.skills.forEach((s) => {
      const cat = s.category || 'General';
      skillCategories[cat] = (skillCategories[cat] || 0) + 1;
    });
  }

  // Helper for match score color
  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  // Helper to extract skill names from recommendation
  const getSkillNames = (job) => {
    if (!job.required_skills) return [];
    if (Array.isArray(job.required_skills)) {
      return job.required_skills.map((s) => {
        if (typeof s === 'string') return s.trim();
        if (s && s.skill_name) return s.skill_name;
        return '';
      }).filter(Boolean);
    }
    if (typeof job.required_skills === 'string') {
      return job.required_skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  // Helper for status badge
  const getStatusBadge = (status) => {
    const s = (status || 'applied').toLowerCase();
    const styles = {
      offered: 'bg-green-500/20 text-green-300 border-green-500/30',
      interview: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      reviewed: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
      applied: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles[s] || styles.applied}`}>
        {s.charAt(0).toUpperCase() + s.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-card p-6 sm:p-8 bg-gradient-to-r from-primary-950/60 via-dark-900/80 to-dark-900/60 border-primary-500/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-semibold mb-3 border border-primary-500/30">
              <Sparkles className="w-3.5 h-3.5 text-primary-400" />
              <span>AI Job Match Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome, {user?.full_name || 'Graduate'}!
            </h1>
            <p className="text-sm text-dark-300 mt-1 max-w-xl">
              Your profile is continuously analyzed against fresh graduate tech openings. Check your match scores below.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="btn-secondary flex items-center gap-2 text-sm !py-2.5 !px-4"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link
              to="/jobs"
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <span>Explore Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-card p-4 border-amber-500/30 bg-amber-500/5 text-amber-300 text-sm">
          {error}
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">
              Applications Sent
            </span>
            <div className="p-2 rounded-xl bg-primary-500/10 text-primary-400">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {loading ? '...' : totalApplications}
          </div>
          <div className="text-xs text-dark-400 mt-1">
            <Link to="/applications" className="text-primary-400 hover:underline">
              View live status →
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">
              AI Jobs Matched
            </span>
            <div className="p-2 rounded-xl bg-green-500/10 text-green-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {loading ? '...' : totalMatchedJobs}
          </div>
          <div className="text-xs text-green-400 mt-1 font-medium">
            Based on current skill profile
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">
              Average Match Score
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {loading ? '...' : `${avgMatchScore}%`}
          </div>
          <div className="text-xs text-dark-400 mt-1">
            Top compatibility threshold
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">
              Skills Identified
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {loading ? '...' : totalSkills}
          </div>
          <div className="text-xs text-dark-400 mt-1">
            <Link to="/profile" className="text-primary-400 hover:underline">
              Add more skills →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Recommended Jobs & Skill Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Recommended Jobs (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Top Recommended Jobs</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/30">AI Ranked</span>
            </div>
            <Link
              to="/jobs"
              className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-card p-5 animate-pulse h-28 bg-dark-800/40" />
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="glass-card p-8 text-center border-dashed">
              <Target className="w-10 h-10 text-dark-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No job matches calculated yet</h3>
              <p className="text-sm text-dark-400 mt-1 max-w-sm mx-auto">
                Update your skills or upload your resume in the profile tab to generate AI recommendations.
              </p>
              <Link to="/profile" className="btn-primary inline-flex text-xs mt-4">
                Update Profile Skills
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.slice(0, 5).map((job, idx) => {
                const score = Math.round(job.match_score || job.score || 0);
                const skills = getSkillNames(job);
                return (
                  <div
                    key={job.id || idx}
                    className="glass-card p-5 hover:border-primary-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-white truncate">
                          {job.title}
                        </h3>
                        {job.job_type && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-dark-700 text-dark-300 text-[10px] font-medium">
                            {job.job_type}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-dark-400">
                        <span className="flex items-center gap-1 font-medium text-dark-300">
                          <Building className="w-3.5 h-3.5 text-primary-400" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location || 'Remote'}
                        </span>
                      </div>
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {skills.slice(0, 4).map((s, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-dark-700/60 text-dark-300 text-[11px]"
                            >
                              {s}
                            </span>
                          ))}
                          {skills.length > 4 && (
                            <span className="px-2 py-0.5 rounded-md bg-dark-700/60 text-dark-400 text-[11px]">
                              +{skills.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-2">
                      <div
                        className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 ${getScoreColor(score)}`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{score}% Match</span>
                      </div>
                      <Link
                        to={`/jobs`}
                        className="text-xs text-primary-400 hover:text-white flex items-center gap-1 font-semibold"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Skill Summary (1 col) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Skill Competencies</h2>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between pb-3 border-b border-dark-800">
              <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">
                Distribution By Domain
              </span>
              <span className="text-xs text-primary-400 font-semibold">
                {totalSkills} Skills Total
              </span>
            </div>

            {Object.keys(skillCategories).length > 0 ? (
              <div className="mt-4 space-y-3">
                {Object.entries(skillCategories).map(([category, count]) => {
                  const percentage = Math.round((count / totalSkills) * 100);
                  const colors = [
                    'bg-primary-500', 'bg-green-500', 'bg-amber-500',
                    'bg-pink-500', 'bg-purple-500', 'bg-cyan-500'
                  ];
                  const colorIdx = Object.keys(skillCategories).indexOf(category) % colors.length;
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-dark-300 font-medium capitalize">{category}</span>
                        <span className="text-dark-400">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-dark-700 rounded-full h-2">
                        <div
                          className={`${colors[colorIdx]} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-dark-400">No skills added yet</p>
                <Link to="/profile" className="text-xs text-primary-400 hover:underline mt-2 inline-block">
                  Add skills in your profile →
                </Link>
              </div>
            )}

            <div className="pt-3 mt-4 border-t border-dark-800 text-center">
              <Link
                to="/skills"
                className="text-xs text-primary-400 hover:text-primary-300 font-semibold inline-flex items-center gap-1"
              >
                <span>View Full Skill Gap Breakdown</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Recent Applications</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-dark-800 text-dark-300">
              {applications.length}
            </span>
          </div>
          <Link
            to="/applications"
            className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="glass-card p-6 animate-pulse h-32 bg-dark-800/40" />
        ) : applications.length === 0 ? (
          <div className="glass-card p-8 text-center border-dashed">
            <Send className="w-10 h-10 text-dark-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No active applications yet</h3>
            <p className="text-sm text-dark-400 mt-1 max-w-sm mx-auto">
              Ready to take the next step? Explore recommended jobs and apply in one click.
            </p>
            <Link to="/jobs" className="btn-primary inline-flex text-xs mt-4">
              Browse Available Roles
            </Link>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dark-700 bg-dark-900/60">
                    <th className="table-header">Job Title</th>
                    <th className="table-header">Company</th>
                    <th className="table-header">Applied Date</th>
                    <th className="table-header">Match Score</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {applications.slice(0, 5).map((app, i) => (
                    <tr key={app.id || i} className="hover:bg-dark-800/30 transition-colors">
                      <td className="table-cell font-semibold text-white">
                        {app.job_title || app.title || 'Position'}
                      </td>
                      <td className="table-cell text-dark-300">
                        {app.company || '—'}
                      </td>
                      <td className="table-cell text-dark-400 text-xs">
                        {app.applied_date
                          ? new Date(app.applied_date).toLocaleDateString()
                          : 'Recently'}
                      </td>
                      <td className="table-cell">
                        <span
                          className={`font-semibold ${
                            (app.match_score || 0) >= 75
                              ? 'text-green-400'
                              : (app.match_score || 0) >= 50
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          {app.match_score ? `${Math.round(app.match_score)}%` : '—'}
                        </span>
                      </td>
                      <td className="table-cell">
                        {getStatusBadge(app.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
