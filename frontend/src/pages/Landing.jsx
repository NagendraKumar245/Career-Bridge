import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import {
  Sparkles,
  ArrowRight,
  Brain,
  FileText,
  Target,
  BookOpen,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  Award,
  Users,
  Compass,
  Star,
  ChevronRight
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 flex flex-col selection:bg-primary-500/30 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
        {/* Glow & Blurred Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary-600/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[400px] h-[280px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[350px] h-[250px] bg-secondary-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top AI badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-xs sm:text-sm font-semibold mb-8 animate-fade-in shadow-inner">
            <Sparkles className="w-4 h-4 text-primary-400 animate-pulse" />
            <span>Next-Gen AI Job Matching for Fresh Graduates</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight">
            Your Career Journey <br />
            <span className="gradient-text">Starts With Intelligent AI</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop sending hundreds of generic applications into the void. CareerBridge extracts your real skills, calculates your precise job compatibility, and guides your upskilling to land dream roles.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/register"
              id="landing-hero-cta-get-started"
              className="btn-primary w-full sm:w-auto text-base py-3.5 px-8 flex items-center justify-center gap-3 shadow-xl shadow-primary-600/30 group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              id="landing-hero-cta-learn-more"
              className="btn-secondary w-full sm:w-auto text-base py-3.5 px-8 flex items-center justify-center gap-2 hover:bg-dark-700 transition-all"
            >
              <span>Explore Features</span>
              <ChevronRight className="w-4 h-4 text-dark-400" />
            </a>
          </div>

          {/* Visual Showcase Card */}
          <div className="relative max-w-4xl mx-auto rounded-3xl p-2 bg-gradient-to-b from-primary-500/20 via-dark-800/50 to-transparent border border-dark-700/80 shadow-2xl">
            <div className="rounded-2xl bg-dark-900/90 backdrop-blur-2xl p-6 sm:p-8 border border-dark-700/60 text-left">
              <div className="flex items-center justify-between pb-6 border-b border-dark-800 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-secondary-500/80" />
                  <span className="text-xs font-mono text-dark-400 ml-2">careerbridge.engine // match-analysis</span>
                </div>
                <span className="badge-success text-xs font-mono">Status: High Affinity</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="glass-card p-5 border-primary-500/30 bg-primary-950/20">
                  <div className="text-xs font-semibold text-primary-300 uppercase tracking-wider mb-1">
                    AI Match Affinity
                  </div>
                  <div className="text-4xl font-black text-white flex items-baseline gap-2">
                    <span>94.8%</span>
                    <span className="text-xs text-secondary-400 font-medium">Top 5% Match</span>
                  </div>
                  <p className="text-xs text-dark-400 mt-2">
                    Evaluated against 42 required skill vectors in Junior Software Engineer roles.
                  </p>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-dark-300 font-medium">Matched Competencies:</span>
                    <span className="text-secondary-400 font-semibold">React, TypeScript, Node.js, Git</span>
                  </div>
                  <div className="w-full bg-dark-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-secondary-500 to-primary-500 h-full w-[94%]" />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-dark-300 font-medium">High Impact Skill Gaps:</span>
                    <span className="text-amber-400 font-semibold">Docker, GraphQL (+8% boost)</span>
                  </div>
                  <div className="w-full bg-dark-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full w-[35%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 border-y border-dark-800/80 bg-dark-900/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="stat-card items-center text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center mb-2">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">500+</div>
              <div className="text-xs sm:text-sm font-medium text-dark-400">Curated Tech Jobs</div>
            </div>

            <div className="stat-card items-center text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-secondary-500/10 text-secondary-400 flex items-center justify-center mb-2">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">1,000+</div>
              <div className="text-xs sm:text-sm font-medium text-dark-400">Fresh Graduates</div>
            </div>

            <div className="stat-card items-center text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2">
                <Target className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">95%</div>
              <div className="text-xs sm:text-sm font-medium text-dark-400">Target Match Rate</div>
            </div>

            <div className="stat-card items-center text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2">
                <Award className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">50+</div>
              <div className="text-xs sm:text-sm font-medium text-dark-400">Partner Companies</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-primary-400 uppercase mb-3">
              Intelligent Architecture
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything Fresh Graduates Need To Stand Out
            </h3>
            <p className="text-dark-300 text-base sm:text-lg">
              Engineered specifically for university graduates transitioning into their first professional engineering and tech careers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="glass-card-hover p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-primary-500/20">
                  <Brain className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">AI Job Matching</h4>
                <p className="text-dark-300 text-sm leading-relaxed mb-4">
                  Leverages Scikit-Learn TF-IDF cosine similarity vectors to calculate real skill compatibility instead of naive keyword matching.
                </p>
              </div>
              <div className="pt-4 border-t border-dark-800 text-xs font-semibold text-primary-400 flex items-center gap-1">
                <span>Vector affinity algorithm</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="glass-card-hover p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-secondary-600 to-emerald-400 flex items-center justify-center text-white mb-6 shadow-lg shadow-secondary-500/20">
                  <Target className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Skill Gap Analysis</h4>
                <p className="text-dark-300 text-sm leading-relaxed mb-4">
                  See the exact delta between your current skill set and job requirements with color-coded strengths and priority missing items.
                </p>
              </div>
              <div className="pt-4 border-t border-dark-800 text-xs font-semibold text-secondary-400 flex items-center gap-1">
                <span>Granular competency radar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="glass-card-hover p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/20">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">PDF Resume Parser</h4>
                <p className="text-dark-300 text-sm leading-relaxed mb-4">
                  Upload your CV in standard PDF format. Our NLP engine instantly parses your academic degrees, tech stack, and experience into your profile.
                </p>
              </div>
              <div className="pt-4 border-t border-dark-800 text-xs font-semibold text-indigo-400 flex items-center gap-1">
                <span>Automated profile sync</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="glass-card-hover p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-400 flex items-center justify-center text-white mb-6 shadow-lg shadow-amber-500/20">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Targeted Upskilling</h4>
                <p className="text-dark-300 text-sm leading-relaxed mb-4">
                  Get high-yield course recommendations mapped precisely to high-demand skills so you can close gaps and boost match rates.
                </p>
              </div>
              <div className="pt-4 border-t border-dark-800 text-xs font-semibold text-amber-400 flex items-center gap-1">
                <span>Direct learning pathways</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-dark-900/60 border-t border-dark-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-primary-400 uppercase mb-3">
              Step-By-Step
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How CareerBridge Works
            </h3>
            <p className="text-dark-300 text-base">
              Four streamlined steps from university graduation to hired software professional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="glass-card p-6 relative">
              <span className="text-4xl font-black text-dark-700/60 absolute top-4 right-4">01</span>
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Create Profile</h4>
              <p className="text-sm text-dark-300 leading-relaxed">
                Enter your university credentials, degree, GPA, portfolio projects, and technical skills.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card p-6 relative">
              <span className="text-4xl font-black text-dark-700/60 absolute top-4 right-4">02</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Upload Resume</h4>
              <p className="text-sm text-dark-300 leading-relaxed">
                Drop your PDF resume to automatically parse skills and extract keywords with one click.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card p-6 relative">
              <span className="text-4xl font-black text-dark-700/60 absolute top-4 right-4">03</span>
              <div className="w-10 h-10 rounded-xl bg-secondary-500/20 text-secondary-400 flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Get Matched</h4>
              <p className="text-sm text-dark-300 leading-relaxed">
                Our machine learning algorithm ranks available jobs based on real compatibility scores.
              </p>
            </div>

            {/* Step 4 */}
            <div className="glass-card p-6 relative">
              <span className="text-4xl font-black text-dark-700/60 absolute top-4 right-4">04</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-4">
                4
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Apply & Track</h4>
              <p className="text-sm text-dark-300 leading-relaxed">
                Apply directly with personalized cover letters and track live status through hiring stages.
              </p>
            </div>
          </div>

          {/* Bottom Banner */}
          <div className="mt-16 glass-card p-8 sm:p-12 text-center bg-gradient-to-r from-primary-900/40 via-dark-800/60 to-dark-900/40 border border-primary-500/30">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to accelerate your career?
            </h3>
            <p className="text-dark-300 max-w-xl mx-auto mb-8 text-base">
              Join hundreds of fresh grads who found their first technical roles using CareerBridge's AI matching.
            </p>
            <Link
              to="/register"
              id="landing-bottom-cta-register"
              className="btn-primary inline-flex items-center gap-3 text-base py-3 px-8"
            >
              <span>Build Your Free Profile</span>
              <Sparkles className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-dark-800 bg-dark-950 text-dark-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-base">CareerBridge</span>
            <span className="text-xs text-dark-500">© 2026 CareerBridge Platform. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
