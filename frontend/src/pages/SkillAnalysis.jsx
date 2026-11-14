import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  Sparkles,
  ExternalLink,
  Target,
  Award,
  Clock,
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
  Layers
} from 'lucide-react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { getProfile, getSkillGap, getCourses } from '../services/api';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const SkillAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [skillGapData, setSkillGapData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('All');

  const fetchSkillAnalytics = async () => {
    setLoading(true);
    try {
      const [profRes, gapRes, courseRes] = await Promise.allSettled([
        getProfile(),
        getSkillGap(),
        getCourses(),
      ]);

      if (profRes.status === 'fulfilled') {
        const p = profRes.value.profile || profRes.value || null;
        setProfile(p);
      }

      if (gapRes.status === 'fulfilled') {
        const gap = gapRes.value.skill_gaps || gapRes.value.skill_gap || gapRes.value || null;
        setSkillGapData(gap);
      }

      if (courseRes.status === 'fulfilled') {
        let c = courseRes.value.courses;
        if (!c && courseRes.value.learning_path) {
          c = courseRes.value.learning_path.flatMap((item) =>
            (item.courses || []).map((course) => ({
              ...course,
              skill: course.skill || item.skill_name,
            }))
          );
        }
        setCourses(Array.isArray(c) ? c : []);
      }
    } catch (err) {
      console.error('Error fetching skill analysis data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillAnalytics();
  }, []);

  // Compute category proficiencies for Radar / Bar Chart
  const categoriesMap = {
    'Frontend': { total: 0, count: 0 },
    'Backend': { total: 0, count: 0 },
    'Database': { total: 0, count: 0 },
    'DevOps': { total: 0, count: 0 },
    'System Design': { total: 0, count: 0 },
    'AI / ML': { total: 0, count: 0 },
  };

  const categoryNormalize = {
    programming: 'Backend',
    framework: 'Frontend',
    database: 'Database',
    cloud_devops: 'DevOps',
    devops: 'DevOps',
    ai_ml: 'AI / ML',
    tool: 'Frontend',
    frontend: 'Frontend',
    backend: 'Backend',
  };

  if (profile?.skills) {
    profile.skills.forEach((s) => {
      const rawCat = (s.category || '').toLowerCase();
      const cat = categoryNormalize[rawCat] || s.category || 'Backend';
      const prof = s.proficiency_level || s.proficiency || 3;
      if (categoriesMap[cat]) {
        categoriesMap[cat].total += prof;
        categoriesMap[cat].count += 1;
      }
    });
  }

  const radarLabels = Object.keys(categoriesMap);
  const radarUserData = radarLabels.map((cat) => {
    const item = categoriesMap[cat];
    return item.count > 0 ? (item.total / item.count).toFixed(1) : 2.5;
  });
  const radarIndustryBenchmark = [4.2, 4.0, 3.8, 3.5, 3.6, 3.8];

  const radarChartData = {
    labels: radarLabels,
    datasets: [
      {
        label: 'Your Proficiency',
        data: radarUserData,
        backgroundColor: 'rgba(99, 102, 241, 0.25)',
        borderColor: '#6366f1',
        borderWidth: 2,
        pointBackgroundColor: '#818cf8',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#6366f1',
      },
      {
        label: 'Junior Role Benchmark',
        data: radarIndustryBenchmark,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: '#22c55e',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#fff',
      },
    ],
  };

  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(71, 85, 105, 0.4)' },
        grid: { color: 'rgba(71, 85, 105, 0.3)' },
        pointLabels: {
          color: '#cbd5e1',
          font: { family: 'Inter', size: 11, weight: '600' },
        },
        ticks: {
          display: false,
          min: 0,
          max: 5,
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#cbd5e1',
          font: { family: 'Inter', size: 12 },
          boxWidth: 12,
          padding: 16,
        },
      },
    },
  };

  const formattedMissingSkills = Array.isArray(skillGapData)
    ? skillGapData.map((g) => ({
        name: g.skill_name,
        category: 'In Demand',
        job_count: g.frequency,
        demand_level: g.frequency >= 3 ? 'High Demand' : 'Essential',
        difficulty: 'Intermediate',
        impact: `+${Math.min(25, g.frequency * 4)}% match boost`,
      }))
    : skillGapData?.missing_skills;

  // Fallback high-impact missing skills if not populated from backend
  const inDemandMissingSkills =
    (formattedMissingSkills && formattedMissingSkills.length > 0)
      ? formattedMissingSkills
      : [
      {
        name: 'Docker & Containerization',
        category: 'DevOps',
        job_count: 14,
        demand_level: 'High Demand',
        difficulty: 'Intermediate',
        impact: '+12% match boost',
      },
      {
        name: 'PostgreSQL & ORM',
        category: 'Database',
        job_count: 12,
        demand_level: 'High Demand',
        difficulty: 'Beginner',
        impact: '+9% match boost',
      },
      {
        name: 'TypeScript',
        category: 'Frontend',
        job_count: 11,
        demand_level: 'Essential',
        difficulty: 'Intermediate',
        impact: '+14% match boost',
      },
      {
        name: 'REST API & FastAPI',
        category: 'Backend',
        job_count: 9,
        demand_level: 'Essential',
        difficulty: 'Intermediate',
        impact: '+8% match boost',
      },
      {
        name: 'AWS Cloud Fundamentals',
        category: 'DevOps',
        job_count: 8,
        demand_level: 'Moderate',
        difficulty: 'Advanced',
        impact: '+6% match boost',
      },
    ];

  // Fallback courses if backend courses array is empty
  const learningCourses =
    courses.length > 0
      ? courses
      : [
          {
            id: 1,
            title: 'Docker & Kubernetes: The Practical Guide',
            provider: 'Udemy',
            skill: 'Docker & Containerization',
            difficulty: 'Intermediate',
            duration: '22 Hours',
            rating: 4.8,
            enrolled: '14,200 grads',
            link: 'https://www.udemy.com',
          },
          {
            id: 2,
            title: 'TypeScript: The Complete Developer’s Guide',
            provider: 'Coursera',
            skill: 'TypeScript',
            difficulty: 'Beginner to Pro',
            duration: '16 Hours',
            rating: 4.9,
            enrolled: '28,000 grads',
            link: 'https://www.coursera.org',
          },
          {
            id: 3,
            title: 'Complete PostgreSQL Bootcamp for Software Engineers',
            provider: 'edX',
            skill: 'PostgreSQL & ORM',
            difficulty: 'Intermediate',
            duration: '14 Hours',
            rating: 4.7,
            enrolled: '9,500 grads',
            link: 'https://www.edx.org',
          },
          {
            id: 4,
            title: 'Building Modern APIs with Python & FastAPI',
            provider: 'FreeCodeCamp',
            skill: 'REST API & FastAPI',
            difficulty: 'Beginner',
            duration: '8 Hours',
            rating: 4.9,
            enrolled: '42,000 grads',
            link: 'https://www.freecodecamp.org',
          },
        ];

  const filteredCourses =
    selectedSkillFilter === 'All'
      ? learningCourses
      : learningCourses.filter((c) =>
          c.skill?.toLowerCase().includes(selectedSkillFilter.toLowerCase())
        );

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Skill Gap Analysis & Learning</h1>
          <p className="text-dark-400 text-sm mt-1">
            Discover the exact skills needed to unlock high-matching tech roles and close gaps.
          </p>
        </div>
      </div>

      {/* TOP: Overall Skill Profile & Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart (2 cols) */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-dark-700/80 mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-400" />
                <span>Competency Radar vs. Industry Benchmark</span>
              </h2>
              <p className="text-xs text-dark-400">
                Visualizing how your profile aligns with junior software engineering benchmarks
              </p>
            </div>
            <span className="badge-primary text-xs self-start sm:self-auto">AI Calibrated</span>
          </div>

          <div className="w-full h-72 sm:h-80 relative my-auto">
            <Radar data={radarChartData} options={radarChartOptions} />
          </div>

          <div className="pt-4 border-t border-dark-800 grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <span className="text-dark-400 block">Strongest Domain</span>
              <span className="font-bold text-secondary-400 mt-0.5 block">Frontend & UI</span>
            </div>
            <div>
              <span className="text-dark-400 block">Prime Growth Area</span>
              <span className="font-bold text-amber-400 mt-0.5 block">Cloud & Containers</span>
            </div>
            <div>
              <span className="text-dark-400 block">Overall Readiness</span>
              <span className="font-bold text-primary-400 mt-0.5 block">82% Job Ready</span>
            </div>
          </div>
        </div>

        {/* Quick Highlights Card (1 col) */}
        <div className="glass-card p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-primary-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Growth Acceleration</h3>
            <p className="text-xs text-dark-300 leading-relaxed mb-4">
              Adding the top 2 recommended skills (Docker & TypeScript) will elevate your candidacy into the top 10% tier for 18 active job postings.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-dark-900/60 border border-dark-700/80 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-dark-400">Target Match Boost:</span>
              <span className="font-bold text-secondary-400">+18% Potential</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-400">New Jobs Unlocked:</span>
              <span className="font-bold text-white">24 Opportunities</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-400">Est. Learning Time:</span>
              <span className="font-bold text-indigo-400">3-4 Weeks</span>
            </div>
          </div>

          <a
            href="#courses-section"
            className="btn-primary text-xs w-full text-center flex items-center justify-center gap-1.5"
          >
            <span>Jump To Recommended Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* SECTION 2: In-Demand Missing Skills List */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-dark-700/80 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Most In-Demand Missing Skills</h2>
              <p className="text-xs text-dark-400">
                Sorted by frequency across matching employers and job listings
              </p>
            </div>
          </div>
          <span className="text-xs text-dark-400 font-medium">Ranked by hiring demand</span>
        </div>

        <div className="space-y-3">
          {inDemandMissingSkills.map((skill, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-dark-800/40 border border-dark-700/60 hover:border-primary-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-dark-700 text-dark-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  0{index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{skill.name}</h3>
                    <span className="badge bg-dark-700 text-dark-300 text-[10px]">
                      {skill.category}
                    </span>
                  </div>
                  <p className="text-xs text-dark-400 mt-0.5">
                    Required by <strong className="text-white">{skill.job_count} active jobs</strong> in your match criteria.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <span className="badge-warning text-xs">{skill.difficulty}</span>
                <span className="text-xs font-bold text-secondary-400">{skill.impact}</span>
                <button
                  type="button"
                  id={`missing-skill-learn-${index}`}
                  onClick={() => setSelectedSkillFilter(skill.name)}
                  className="btn-secondary text-xs !py-1.5 !px-3 hover:border-primary-500"
                >
                  Find Courses
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Course Recommendations */}
      <div id="courses-section" className="glass-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dark-700/80 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Targeted Learning Pathways</h2>
              <p className="text-xs text-dark-400">
                Top rated courses to help you master missing technical qualifications
              </p>
            </div>
          </div>

          {/* Skill Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedSkillFilter('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSkillFilter === 'All'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-dark-400 hover:text-white'
              }`}
            >
              All Skills
            </button>
            {inDemandMissingSkills.slice(0, 3).map((s, i) => (
              <button
                key={i}
                onClick={() => setSelectedSkillFilter(s.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSkillFilter === s.name
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-800 text-dark-400 hover:text-white'
                }`}
              >
                {s.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="p-5 rounded-2xl bg-dark-800/40 border border-dark-700/70 hover:border-primary-500/40 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="badge-primary text-[10px]">{course.provider}</span>
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{course.rating}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-primary-300 transition-colors mb-2">
                  {course.title}
                </h3>

                <p className="text-xs text-dark-400 mb-3">
                  Targeted Skill: <span className="text-primary-300 font-semibold">{course.skill}</span>
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-dark-400 pt-3 border-t border-dark-700/60 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration}
                  </span>
                  <span>{course.difficulty}</span>
                </div>

                <a
                  href={course.link || '#'}
                  target="_blank"
                  rel="noreferrer"
                  id={`course-enroll-btn-${course.id}`}
                  className="btn-secondary w-full text-xs flex items-center justify-center gap-2 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-500 transition-all !py-2.5"
                >
                  <span>Start Course</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillAnalysis;
