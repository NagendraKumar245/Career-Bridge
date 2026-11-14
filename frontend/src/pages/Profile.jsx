import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  Code,
  FileText,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Star,
  Download
} from 'lucide-react';
import {
  getProfile,
  updateProfile,
  addEducation,
  deleteEducation,
  addProject,
  deleteProject,
  updateSkills,
  uploadResume
} from '../services/api';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }
  const [profileData, setProfileData] = useState(null);

  // Section edit states
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    university: '',
    degree: '',
    field_of_study: '',
    graduation_year: '',
    gpa: '',
    bio: '',
    phone: '',
    location: '',
    linkedin_url: '',
    github_url: '',
  });

  // Education state
  const [showAddEdu, setShowAddEdu] = useState(false);
  const [eduForm, setEduForm] = useState({
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    grade: '',
  });

  // Skills state
  const [skillsList, setSkillsList] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState(3);
  const [newSkillCategory, setNewSkillCategory] = useState('Frontend');
  const [skillsChanged, setSkillsChanged] = useState(false);

  // Projects state
  const [showAddProject, setShowAddProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    technologies: '',
    url: '',
  });

  // Resume upload state
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const showFeedback = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const fetchFullProfile = async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      const prof = data.profile || data;
      setProfileData(prof);

      // Populate personal info
      setPersonalForm({
        university: prof.university || '',
        degree: prof.degree || '',
        field_of_study: prof.field_of_study || '',
        graduation_year: prof.graduation_year || '',
        gpa: prof.gpa || '',
        bio: prof.bio || '',
        phone: prof.phone || '',
        location: prof.location || '',
        linkedin_url: prof.linkedin_url || '',
        github_url: prof.github_url || '',
      });

      // Populate skills
      if (Array.isArray(prof.skills)) {
        setSkillsList(prof.skills);
      } else if (typeof prof.skills === 'string') {
        const parsed = prof.skills.split(',').map((s) => ({
          name: s.trim(),
          proficiency: 3,
          category: 'General',
        }));
        setSkillsList(parsed);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      showFeedback('error', 'Unable to retrieve complete profile. Please verify connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullProfile();
  }, []);

  // Save personal info
  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(personalForm);
      setEditingPersonalInfo(false);
      showFeedback('success', 'Personal information saved successfully.');
      fetchFullProfile();
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to update personal information.');
    }
  };

  // Education handlers
  const handleAddEducation = async (e) => {
    e.preventDefault();
    if (!eduForm.institution || !eduForm.degree) {
      showFeedback('error', 'Institution and Degree are required.');
      return;
    }
    try {
      await addEducation(eduForm);
      setShowAddEdu(false);
      setEduForm({
        institution: '',
        degree: '',
        field_of_study: '',
        start_date: '',
        end_date: '',
        grade: '',
      });
      showFeedback('success', 'Education record added.');
      fetchFullProfile();
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to add education.');
    }
  };

  const handleDeleteEducation = async (id) => {
    try {
      await deleteEducation(id);
      showFeedback('success', 'Education record deleted.');
      fetchFullProfile();
    } catch (err) {
      showFeedback('error', 'Failed to delete education entry.');
    }
  };

  // Helper to safely get skill name and level
  const getSkillName = (s) => (typeof s === 'string' ? s : s?.skill_name || s?.name || '');
  const getSkillLevel = (s) => (typeof s === 'object' ? s?.proficiency_level || s?.proficiency || 3 : 3);

  // Skill handlers
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const exists = skillsList.some(
      (s) => getSkillName(s).toLowerCase() === newSkillName.trim().toLowerCase()
    );
    if (exists) {
      showFeedback('error', 'This skill already exists in your profile.');
      return;
    }

    const newSkill = {
      name: newSkillName.trim(),
      skill_name: newSkillName.trim(),
      proficiency: Number(newSkillProficiency),
      proficiency_level: Number(newSkillProficiency),
      category: newSkillCategory,
    };

    setSkillsList([...skillsList, newSkill]);
    setNewSkillName('');
    setSkillsChanged(true);
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = skillsList.filter((s) => {
      const name = getSkillName(s);
      return name !== skillToRemove;
    });
    setSkillsList(updated);
    setSkillsChanged(true);
  };

  const handleSaveAllSkills = async () => {
    try {
      await updateSkills(skillsList);
      setSkillsChanged(false);
      showFeedback('success', 'Skills portfolio updated successfully.');
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to update skills.');
    }
  };

  // Project handlers
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.description) {
      showFeedback('error', 'Project title and description are required.');
      return;
    }
    try {
      await addProject(projectForm);
      setShowAddProject(false);
      setProjectForm({ title: '', description: '', technologies: '', url: '' });
      showFeedback('success', 'Project added to portfolio.');
      fetchFullProfile();
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to add project.');
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await deleteProject(id);
      showFeedback('success', 'Project deleted.');
      fetchFullProfile();
    } catch (err) {
      showFeedback('error', 'Failed to delete project.');
    }
  };

  // Resume file handling
  const handleResumeFileSelect = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      showFeedback('error', 'Please upload a valid PDF file.');
      return;
    }
    setResumeFile(file);
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setIsUploadingResume(true);
    try {
      const data = await uploadResume(resumeFile);
      const skillsFound = data.extracted_skills || data.skills || [];
      setExtractedSkills(skillsFound);
      showFeedback('success', `Resume parsed! Extracted ${skillsFound.length} skills.`);
      fetchFullProfile();
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to parse resume PDF.');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleAdoptExtractedSkills = () => {
    if (extractedSkills.length === 0) return;
    const currentNames = skillsList.map((s) => getSkillName(s).toLowerCase());
    const newItems = [];

    extractedSkills.forEach((item) => {
      const skillName = typeof item === 'string' ? item : (item.name || item.skill_name || '');
      const category = typeof item === 'object' && item.category ? item.category : 'Extracted';
      if (skillName && !currentNames.includes(skillName.toLowerCase())) {
        newItems.push({
          name: skillName,
          skill_name: skillName,
          proficiency: 3,
          proficiency_level: 3,
          category: category,
        });
        currentNames.push(skillName.toLowerCase());
      }
    });

    if (newItems.length > 0) {
      setSkillsList([...skillsList, ...newItems]);
      setSkillsChanged(true);
      showFeedback('success', `Added ${newItems.length} skills from resume. Don't forget to click "Save Skills".`);
    } else {
      showFeedback('success', 'All extracted skills are already in your profile.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 glass-card bg-dark-800/40" />
        <div className="h-64 glass-card bg-dark-800/40" />
        <div className="h-64 glass-card bg-dark-800/40" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Toast Feedback Notification */}
      {notification && (
        <div
          id="profile-notification-toast"
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

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Student Profile</h1>
          <p className="text-dark-400 text-sm mt-1">
            Build your comprehensive academic and technical background for optimal AI job matching.
          </p>
        </div>
      </div>

      {/* 1. PERSONAL INFO SECTION */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-dark-700/80 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Personal & Academic Details</h2>
              <p className="text-xs text-dark-400">University, degree status, and contact links</p>
            </div>
          </div>
          {!editingPersonalInfo ? (
            <button
              onClick={() => setEditingPersonalInfo(true)}
              id="profile-edit-personal-btn"
              className="btn-secondary flex items-center gap-2 text-xs !py-2 !px-3.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Info</span>
            </button>
          ) : (
            <button
              onClick={() => setEditingPersonalInfo(false)}
              id="profile-cancel-personal-btn"
              className="p-2 text-dark-400 hover:text-white rounded-lg hover:bg-dark-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {editingPersonalInfo ? (
          <form onSubmit={handleSavePersonalInfo} className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">
                  University / College
                </label>
                <input
                  type="text"
                  id="profile-input-university"
                  value={personalForm.university}
                  onChange={(e) =>
                    setPersonalForm({ ...personalForm, university: e.target.value })
                  }
                  placeholder="e.g. Stanford University"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">
                  Degree
                </label>
                <input
                  type="text"
                  id="profile-input-degree"
                  value={personalForm.degree}
                  onChange={(e) => setPersonalForm({ ...personalForm, degree: e.target.value })}
                  placeholder="e.g. Bachelor of Science"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">
                  Field of Study
                </label>
                <input
                  type="text"
                  id="profile-input-field"
                  value={personalForm.field_of_study}
                  onChange={(e) =>
                    setPersonalForm({ ...personalForm, field_of_study: e.target.value })
                  }
                  placeholder="e.g. Computer Science"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">
                  Graduation Year
                </label>
                <input
                  type="number"
                  id="profile-input-grad-year"
                  value={personalForm.graduation_year}
                  onChange={(e) =>
                    setPersonalForm({ ...personalForm, graduation_year: e.target.value })
                  }
                  placeholder="2026"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">
                  GPA (out of 4.0 or equivalent)
                </label>
                <input
                  type="text"
                  id="profile-input-gpa"
                  value={personalForm.gpa}
                  onChange={(e) => setPersonalForm({ ...personalForm, gpa: e.target.value })}
                  placeholder="e.g. 3.8"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">
                  Location / City
                </label>
                <input
                  type="text"
                  id="profile-input-location"
                  value={personalForm.location}
                  onChange={(e) => setPersonalForm({ ...personalForm, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="profile-input-phone"
                  value={personalForm.phone}
                  onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  id="profile-input-linkedin"
                  value={personalForm.linkedin_url}
                  onChange={(e) =>
                    setPersonalForm({ ...personalForm, linkedin_url: e.target.value })
                  }
                  placeholder="https://linkedin.com/in/username"
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  id="profile-input-github"
                  value={personalForm.github_url}
                  onChange={(e) =>
                    setPersonalForm({ ...personalForm, github_url: e.target.value })
                  }
                  placeholder="https://github.com/username"
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">
                  Professional Bio
                </label>
                <textarea
                  id="profile-input-bio"
                  rows="3"
                  value={personalForm.bio}
                  onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })}
                  placeholder="Tell recruiters about your passions, key projects, and career aspirations..."
                  className="input-field resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setEditingPersonalInfo(false)}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="profile-save-personal-btn"
                className="btn-primary text-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-xs text-dark-400 uppercase tracking-wider block">University</span>
              <p className="font-semibold text-white mt-1">
                {personalForm.university || <span className="text-dark-500 italic">Not set</span>}
              </p>
            </div>
            <div>
              <span className="text-xs text-dark-400 uppercase tracking-wider block">Degree & Major</span>
              <p className="font-semibold text-white mt-1">
                {personalForm.degree ? `${personalForm.degree} in ${personalForm.field_of_study || ''}` : <span className="text-dark-500 italic">Not set</span>}
              </p>
            </div>
            <div>
              <span className="text-xs text-dark-400 uppercase tracking-wider block">Graduation & GPA</span>
              <p className="font-semibold text-white mt-1">
                {personalForm.graduation_year || '—'} {personalForm.gpa ? `(GPA: ${personalForm.gpa})` : ''}
              </p>
            </div>
            <div>
              <span className="text-xs text-dark-400 uppercase tracking-wider block">Location</span>
              <p className="font-medium text-dark-200 mt-1">
                {personalForm.location || <span className="text-dark-500 italic">Not set</span>}
              </p>
            </div>
            <div>
              <span className="text-xs text-dark-400 uppercase tracking-wider block">Contact Phone</span>
              <p className="font-medium text-dark-200 mt-1">
                {personalForm.phone || <span className="text-dark-500 italic">Not set</span>}
              </p>
            </div>
            <div className="flex items-center gap-4 mt-1">
              {personalForm.linkedin_url && (
                <a
                  href={personalForm.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 font-semibold"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {personalForm.github_url && (
                <a
                  href={personalForm.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            {personalForm.bio && (
              <div className="md:col-span-3 pt-2">
                <span className="text-xs text-dark-400 uppercase tracking-wider block">Bio</span>
                <p className="text-dark-300 mt-1 text-sm leading-relaxed">{personalForm.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. EDUCATION SECTION */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-dark-700/80 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-secondary-500/10 text-secondary-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Education History</h2>
              <p className="text-xs text-dark-400">Add university degrees and academic achievements</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddEdu(!showAddEdu)}
            id="profile-toggle-add-education-btn"
            className="btn-secondary flex items-center gap-2 text-xs !py-2 !px-3.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Education</span>
          </button>
        </div>

        {/* Inline Add Education Form */}
        {showAddEdu && (
          <form
            onSubmit={handleAddEducation}
            className="mb-6 p-5 rounded-xl bg-dark-900/80 border border-dark-700 space-y-4 animate-fade-in"
          >
            <h3 className="text-sm font-bold text-white">New Academic Qualification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-dark-300 uppercase mb-1">Institution</label>
                <input
                  type="text"
                  id="edu-input-institution"
                  required
                  placeholder="e.g. University of California, Berkeley"
                  value={eduForm.institution}
                  onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-300 uppercase mb-1">Degree</label>
                <input
                  type="text"
                  id="edu-input-degree"
                  required
                  placeholder="e.g. B.S. in Computer Science"
                  value={eduForm.degree}
                  onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-300 uppercase mb-1">Field of Study</label>
                <input
                  type="text"
                  id="edu-input-field"
                  placeholder="e.g. Software Engineering"
                  value={eduForm.field_of_study}
                  onChange={(e) => setEduForm({ ...eduForm, field_of_study: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-300 uppercase mb-1">Dates / Year</label>
                <input
                  type="text"
                  id="edu-input-dates"
                  placeholder="2022 - 2026"
                  value={eduForm.start_date}
                  onChange={(e) => setEduForm({ ...eduForm, start_date: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddEdu(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="edu-submit-btn"
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Education</span>
              </button>
            </div>
          </form>
        )}

        {/* Education List */}
        {profileData?.education && profileData.education.length > 0 ? (
          <div className="space-y-3">
            {profileData.education.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-dark-800/40 border border-dark-700/60 flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-white text-base">{item.institution}</h3>
                  <p className="text-sm text-dark-300">
                    {item.degree} {item.field_of_study ? `• ${item.field_of_study}` : ''}
                  </p>
                  <p className="text-xs text-dark-400 mt-1">
                    {item.start_date ? `${item.start_date} - ${item.end_date || 'Present'}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteEducation(item.id)}
                  id={`edu-delete-btn-${item.id}`}
                  className="p-2 text-dark-400 hover:text-red-400 rounded-lg hover:bg-dark-700/60 transition-colors"
                  title="Delete education"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-dark-400 text-sm">
            No education entries yet. Click "Add Education" to list your university background.
          </div>
        )}
      </div>

      {/* 3. SKILLS SECTION */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-dark-700/80 mb-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Skills & Competency Portfolio</h2>
              <p className="text-xs text-dark-400">
                Rated 1-5 stars. Core inputs for the AI vector job matching engine.
              </p>
            </div>
          </div>
          {skillsChanged && (
            <button
              onClick={handleSaveAllSkills}
              id="profile-save-skills-btn"
              className="btn-success flex items-center gap-2 text-xs !py-2 !px-4 animate-bounce-slow"
            >
              <Save className="w-4 h-4" />
              <span>Save Skills Changes</span>
            </button>
          )}
        </div>

        {/* Add Skill Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 p-4 rounded-xl bg-dark-900/60 border border-dark-700/60">
          <input
            type="text"
            id="skills-add-input"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Skill name (e.g. React, Python, PostgreSQL)..."
            className="input-field flex-1 text-sm !py-2.5"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill();
              }
            }}
          />

          <select
            id="skills-category-select"
            value={newSkillCategory}
            onChange={(e) => setNewSkillCategory(e.target.value)}
            className="input-field sm:w-40 text-sm !py-2.5"
          >
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Database">Database</option>
            <option value="DevOps">Cloud / DevOps</option>
            <option value="AI / ML">AI / ML</option>
            <option value="Other">Other</option>
          </select>

          <div className="flex items-center gap-1 px-3 py-2 bg-dark-800 rounded-xl border border-dark-700">
            <span className="text-xs text-dark-400 mr-1">Level:</span>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setNewSkillProficiency(lvl)}
                className={`p-1 rounded ${
                  lvl <= newSkillProficiency ? 'text-amber-400' : 'text-dark-600'
                }`}
                title={`Level ${lvl}`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </button>
            ))}
          </div>

          <button
            type="button"
            id="skills-add-btn"
            onClick={handleAddSkill}
            className="btn-primary flex items-center gap-1.5 text-xs !py-2.5 !px-4 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        {/* Tag-based Skills Display */}
        {skillsList.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {skillsList.map((skill, idx) => {
              const name = getSkillName(skill);
              const level = getSkillLevel(skill);
              const category = typeof skill === 'object' && skill?.category ? skill.category : null;

              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-dark-800/80 border border-dark-700/80 hover:border-primary-500/40 text-sm transition-all"
                >
                  <span className="font-semibold text-white">{name}</span>
                  {category && (
                    <span className="text-[10px] uppercase font-bold text-dark-400 px-1.5 py-0.5 rounded bg-dark-900">
                      {category}
                    </span>
                  )}
                  {/* Rating dots */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`w-1.5 h-1.5 rounded-full ${
                          star <= level ? 'bg-primary-400' : 'bg-dark-600'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => handleRemoveSkill(name)}
                    id={`skill-remove-btn-${idx}`}
                    className="text-dark-400 hover:text-red-400 p-0.5 ml-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-dark-400 text-sm">
            No skills added yet. Type your skills above or upload your resume below to extract them automatically.
          </div>
        )}
      </div>

      {/* 4. PROJECTS SECTION */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-dark-700/80 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Portfolio Projects</h2>
              <p className="text-xs text-dark-400">Showcase open source, hackathons, and coursework</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddProject(!showAddProject)}
            id="profile-toggle-add-project-btn"
            className="btn-secondary flex items-center gap-2 text-xs !py-2 !px-3.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        </div>

        {/* Add Project Form */}
        {showAddProject && (
          <form
            onSubmit={handleAddProject}
            className="mb-6 p-5 rounded-xl bg-dark-900/80 border border-dark-700 space-y-4 animate-fade-in"
          >
            <h3 className="text-sm font-bold text-white">Add Showcase Project</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-dark-300 uppercase mb-1">Project Title</label>
                <input
                  type="text"
                  id="project-input-title"
                  required
                  placeholder="e.g. AI Career Matcher"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-300 uppercase mb-1">Demo / Repo Link</label>
                <input
                  type="url"
                  id="project-input-url"
                  placeholder="https://github.com/username/project"
                  value={projectForm.url}
                  onChange={(e) => setProjectForm({ ...projectForm, url: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-dark-300 uppercase mb-1">
                  Technologies Used (comma separated)
                </label>
                <input
                  type="text"
                  id="project-input-technologies"
                  placeholder="React, Python, FastAPI, Docker, Tailwind"
                  value={projectForm.technologies}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, technologies: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-dark-300 uppercase mb-1">Description</label>
                <textarea
                  id="project-input-desc"
                  required
                  rows="3"
                  placeholder="Explain the problem solved, architecture choices, and metrics achieved..."
                  value={projectForm.description}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, description: e.target.value })
                  }
                  className="input-field resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddProject(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="project-submit-btn"
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Project</span>
              </button>
            </div>
          </form>
        )}

        {/* Project Cards */}
        {profileData?.projects && profileData.projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileData.projects.map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-xl bg-dark-800/40 border border-dark-700/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-bold text-white text-base truncate">{proj.title}</h3>
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      id={`project-delete-btn-${proj.id}`}
                      className="text-dark-400 hover:text-red-400 p-1"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-dark-300 mb-3 leading-relaxed">{proj.description}</p>
                </div>

                <div>
                  {proj.technologies && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(typeof proj.technologies === 'string'
                        ? proj.technologies.split(',')
                        : proj.technologies
                      ).map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-dark-700 text-dark-300 text-xs"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  {proj.url && (
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-primary-400 hover:underline flex items-center gap-1"
                    >
                      <span>Explore Repository</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-dark-400 text-sm">
            No projects added yet. Click "Add Project" to highlight your portfolio works.
          </div>
        )}
      </div>

      {/* 5. RESUME UPLOAD SECTION */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-dark-700/80 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">PDF Resume & AI Parsing</h2>
              <p className="text-xs text-dark-400">
                Upload your latest PDF CV to extract tech stack keywords via NLP
              </p>
            </div>
          </div>
          {profileData?.resume_url && (
            <span className="badge-success text-xs">Resume Uploaded</span>
          )}
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleResumeFileSelect(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          id="resume-dropzone-area"
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-primary-500 bg-primary-500/10'
              : 'border-dark-700 hover:border-primary-500/50 bg-dark-900/40 hover:bg-dark-900/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            id="resume-file-input"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleResumeFileSelect(e.target.files[0]);
              }
            }}
          />

          <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-white">
            {resumeFile ? resumeFile.name : 'Select or drop your PDF resume here'}
          </h3>
          <p className="text-xs text-dark-400 mt-1">
            Accepts .PDF documents up to 10MB. Text is parsed securely by our backend engine.
          </p>

          {resumeFile && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                id="resume-parse-upload-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResumeUpload();
                }}
                disabled={isUploadingResume}
                className="btn-primary text-xs flex items-center gap-2"
              >
                {isUploadingResume ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Upload & Extract Skills</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Current resume filename indicator */}
        {(profileData?.resume_filename || profileData?.resume_path) && (
          <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-dark-800/60 border border-dark-700/60 text-xs">
            <span className="text-dark-300">Active Resume File:</span>
            <span className="font-mono text-primary-300 font-semibold truncate max-w-xs">
              {profileData.resume_filename || profileData.resume_path.split(/[\\/]/).pop()}
            </span>
          </div>
        )}

        {/* Extracted Skills Preview Box */}
        {extractedSkills.length > 0 && (
          <div className="mt-6 p-5 rounded-2xl bg-primary-950/30 border border-primary-500/40 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-400" />
                <h4 className="text-sm font-bold text-white">
                  Extracted Skills from Resume ({extractedSkills.length})
                </h4>
              </div>
              <button
                onClick={handleAdoptExtractedSkills}
                id="resume-adopt-skills-btn"
                className="btn-primary text-xs !py-1.5 !px-3"
              >
                Auto-Add All To Profile
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {extractedSkills.map((skill, i) => {
                const skillName = typeof skill === 'string' ? skill : (skill.name || skill.skill_name || '');
                const category = typeof skill === 'object' && skill.category ? skill.category : null;
                return (
                  <span
                    key={i}
                    className="badge-primary text-xs font-semibold px-2.5 py-1 inline-flex items-center gap-1.5"
                  >
                    <span>{skillName}</span>
                    {category && (
                      <span className="text-[10px] text-primary-300 opacity-75">({category})</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
