import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Briefcase,
  Search,
  ExternalLink,
  ArrowRight,
  Filter
} from 'lucide-react';
import { getApplications } from '../services/api';

const Applications = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');

  const fetchApplicationsList = async () => {
    setLoading(true);
    try {
      const data = await getApplications();
      const list = data.applications || data || [];
      setApplications(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationsList();
  }, []);

  const tabs = ['All', 'Applied', 'Reviewed', 'Interview', 'Offered', 'Rejected'];

  const filteredApplications = applications.filter((app) => {
    const status = (app.status || 'Applied').toLowerCase();
    const matchesTab =
      activeTab === 'All' || status === activeTab.toLowerCase();

    if (!matchesTab) return false;

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const titleMatch = (app.job_title || app.title || '').toLowerCase().includes(q);
      const companyMatch = (app.company || '').toLowerCase().includes(q);
      return titleMatch || companyMatch;
    }

    return true;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'offered':
        return <span className="badge-success">Offered</span>;
      case 'interview':
        return (
          <span className="badge bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Interview
          </span>
        );
      case 'reviewed':
        return <span className="badge-warning">Reviewed</span>;
      case 'rejected':
        return <span className="badge-danger">Rejected</span>;
      default:
        return <span className="badge-primary">Applied</span>;
    }
  };

  const getTabCount = (tabName) => {
    if (tabName === 'All') return applications.length;
    return applications.filter((a) => (a.status || 'Applied').toLowerCase() === tabName.toLowerCase())
      .length;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Application Pipeline</h1>
          <p className="text-dark-400 text-sm mt-1">
            Track your interview stages, employer reviews, and job offers in real-time.
          </p>
        </div>
        <Link
          to="/jobs"
          id="applications-browse-more-btn"
          className="btn-primary flex items-center gap-2 text-xs !py-2.5 !px-4 self-start sm:self-auto"
        >
          <span>Find More Opportunities</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Tabs & Search Bar */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {tabs.map((tab) => {
              const count = getTabCount(tab);
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  id={`applications-tab-${tab.toLowerCase()}`}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                      : 'text-dark-400 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-dark-800 text-dark-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search within applications */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 text-dark-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="applications-search-input"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search applications..."
              className="input-field pl-9 text-xs !py-2"
            />
          </div>
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="glass-card p-8 animate-pulse h-64 bg-dark-800/40" />
      ) : filteredApplications.length === 0 ? (
        <div className="glass-card p-12 text-center border-dashed">
          <ClipboardList className="w-12 h-12 text-dark-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No applications found</h3>
          <p className="text-sm text-dark-400 mt-1 max-w-sm mx-auto">
            {activeTab === 'All'
              ? "You haven't submitted any job applications yet."
              : `No applications with status "${activeTab}".`}
          </p>
          <Link to="/jobs" className="btn-primary inline-flex text-xs mt-4">
            Browse Jobs & Apply
          </Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-700 bg-dark-900/60">
                  <th className="table-header">Job Title & Role</th>
                  <th className="table-header">Company</th>
                  <th className="table-header">Date Submitted</th>
                  <th className="table-header">Match Score</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {filteredApplications.map((app, idx) => {
                  const score = Math.round(app.match_score || 84);
                  return (
                    <tr
                      key={app.id || idx}
                      className="hover:bg-dark-800/30 transition-colors"
                    >
                      <td className="table-cell">
                        <div className="font-bold text-white text-base">
                          {app.job_title || app.title || 'Software Engineer'}
                        </div>
                        {app.location && (
                          <div className="text-xs text-dark-400 mt-0.5">{app.location}</div>
                        )}
                      </td>

                      <td className="table-cell text-dark-200 font-medium">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-primary-400 shrink-0" />
                          <span>{app.company || 'TechCorp'}</span>
                        </div>
                      </td>

                      <td className="table-cell text-dark-400 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-dark-500" />
                          <span>
                            {(app.applied_date || app.applied_at)
                              ? new Date(app.applied_date || app.applied_at).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'Recently'}
                          </span>
                        </div>
                      </td>

                      <td className="table-cell">
                        <span
                          className={`font-bold ${
                            score >= 75
                              ? 'score-high'
                              : score >= 50
                              ? 'score-medium'
                              : 'score-low'
                          }`}
                        >
                          {score}%
                        </span>
                      </td>

                      <td className="table-cell">{getStatusBadge(app.status || 'Applied')}</td>

                      <td className="table-cell text-right">
                        <Link
                          to={`/jobs?selected=${app.job_id || app.id}`}
                          id={`app-view-job-link-${app.id || idx}`}
                          className="text-xs text-primary-400 hover:text-white font-semibold inline-flex items-center gap-1"
                        >
                          <span>View Job</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
