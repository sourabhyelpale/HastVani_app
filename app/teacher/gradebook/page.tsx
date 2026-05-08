'use client';

import { useEffect, useState } from 'react';
import { classApi, assignmentApi } from '@/lib/api';
import { ROLES } from '@/lib/config';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleGuard from '@/components/auth/RoleGuard';
import CustomHeader from '@/components/CustomHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';

interface ClassItem {
  _id: string;
  className: string;
}

interface AssignmentItem {
  _id: string;
  assignName: string;
  marks: number;
  dueDate: string;
  isPublished: boolean;
}

interface Submission {
  _id: string;
  student: { _id: string; firstName: string; lastName: string; email: string };
  totalScore: number | null;
  status: 'submitted' | 'graded' | 'late' | 'pending';
  submittedAt: string | null;
  feedback: string;
}

export default function GradebookPage() {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
        <Gradebook />
      </RoleGuard>
    </ProtectedRoute>
  );
}

function Gradebook() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState<{ score: string; feedback: string }>({ score: '', feedback: '' });
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load classes on mount
  useEffect(() => {
    classApi.getAll()
      .then((r) => {
        const list: ClassItem[] = r.data.data?.classes || r.data.data || [];
        setClasses(list);
        if (list.length > 0) setSelectedClass(list[0]._id);
      })
      .catch(() => setError('Failed to load classes'))
      .finally(() => setLoadingClasses(false));
  }, []);

  // Load assignments when class changes
  useEffect(() => {
    if (!selectedClass) return;
    setLoadingAssignments(true);
    setAssignments([]);
    setSelectedAssignment('');
    setSubmissions([]);
    assignmentApi.getByClass(selectedClass)
      .then((r) => {
        const list: AssignmentItem[] = r.data.data?.assignments || r.data.data || [];
        setAssignments(list);
        if (list.length > 0) setSelectedAssignment(list[0]._id);
      })
      .catch(() => setError('Failed to load assignments'))
      .finally(() => setLoadingAssignments(false));
  }, [selectedClass]);

  // Load submissions when assignment changes
  useEffect(() => {
    if (!selectedAssignment) return;
    setLoadingSubmissions(true);
    setSubmissions([]);
    assignmentApi.getSubmissions(selectedAssignment)
      .then((r) => {
        setSubmissions(r.data.data?.submissions || r.data.data || []);
      })
      .catch(() => setError('Failed to load submissions'))
      .finally(() => setLoadingSubmissions(false));
  }, [selectedAssignment]);

  const currentAssignment = assignments.find((a) => a._id === selectedAssignment);
  const graded = submissions.filter((s) => s.status === 'graded').length;
  const submitted = submissions.filter((s) => s.status === 'submitted' || s.status === 'late').length;

  const startGrading = (sub: Submission) => {
    setGradingId(sub._id);
    setGradeInput({ score: sub.totalScore?.toString() ?? '', feedback: sub.feedback ?? '' });
    setSaveStatus('idle');
  };

  const cancelGrading = () => {
    setGradingId(null);
    setSaveStatus('idle');
  };

  const saveGrade = async (submissionId: string) => {
    if (!selectedAssignment) return;
    const scoreNum = parseFloat(gradeInput.score);
    if (isNaN(scoreNum) || scoreNum < 0 || (currentAssignment && scoreNum > currentAssignment.marks)) {
      setError(`Score must be between 0 and ${currentAssignment?.marks ?? 100}`);
      return;
    }
    setSaveStatus('saving');
    try {
      await assignmentApi.gradeSubmission(selectedAssignment, submissionId, {
        score: scoreNum,
        feedback: gradeInput.feedback,
      });
      setSubmissions((prev) =>
        prev.map((s) =>
          s._id === submissionId
            ? { ...s, totalScore: scoreNum, status: 'graded', feedback: gradeInput.feedback }
            : s
        )
      );
      setSaveStatus('saved');
      setTimeout(() => {
        setGradingId(null);
        setSaveStatus('idle');
      }, 800);
    } catch {
      setSaveStatus('error');
      setError('Failed to save grade');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pb-24">
      <CustomHeader title="Gradebook" showBack />

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Selectors */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              {/* Class selector */}
              <div className="flex-1 min-w-48">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Class</label>
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    disabled={loadingClasses}
                    className="w-full appearance-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-50"
                  >
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>{c.className}</option>
                    ))}
                    {classes.length === 0 && <option>No classes</option>}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Assignment selector */}
              <div className="flex-1 min-w-48">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Assignment</label>
                <div className="relative">
                  <select
                    value={selectedAssignment}
                    onChange={(e) => setSelectedAssignment(e.target.value)}
                    disabled={loadingAssignments || assignments.length === 0}
                    className="w-full appearance-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-50"
                  >
                    {assignments.map((a) => (
                      <option key={a._id} value={a._id}>{a.assignName}</option>
                    ))}
                    {assignments.length === 0 && <option>No assignments</option>}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm">
            <AlertCircle size={16} /> {error}
            <button onClick={() => setError('')} className="ml-auto text-xs underline">Dismiss</button>
          </div>
        )}

        {/* Assignment summary */}
        {currentAssignment && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard label="Total Submissions" value={submissions.length} icon={<Users size={16} />} />
            <SummaryCard label="Graded" value={graded} icon={<CheckCircle size={16} />} color="green" />
            <SummaryCard label="Pending" value={submitted} icon={<Clock size={16} />} color="amber" />
            <SummaryCard
              label="Max Marks"
              value={currentAssignment.marks}
              icon={<CheckCircle size={16} />}
              color="blue"
            />
          </div>
        )}

        {/* Submissions table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users size={18} className="text-primary-500" />
              Submissions
              {currentAssignment && (
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                  — {currentAssignment.assignName} (max {currentAssignment.marks} pts)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSubmissions ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14" />)}
              </div>
            ) : submissions.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 py-10">
                {selectedAssignment ? 'No submissions yet' : 'Select an assignment to view submissions'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                      <th className="text-left py-2 font-medium">Student</th>
                      <th className="text-center py-2 font-medium">Status</th>
                      <th className="text-center py-2 font-medium">Submitted</th>
                      <th className="text-center py-2 font-medium">Score</th>
                      <th className="text-center py-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <>
                        <tr
                          key={sub._id}
                          className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="py-3">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {sub.student.firstName} {sub.student.lastName}
                            </p>
                            <p className="text-xs text-gray-400">{sub.student.email}</p>
                          </td>
                          <td className="text-center py-3">
                            <StatusBadge status={sub.status} />
                          </td>
                          <td className="text-center py-3 text-gray-500 dark:text-gray-400 text-xs">
                            {sub.submittedAt
                              ? new Date(sub.submittedAt).toLocaleDateString()
                              : '—'}
                          </td>
                          <td className="text-center py-3 font-semibold">
                            {sub.totalScore !== null && sub.totalScore !== undefined
                              ? <span className={sub.totalScore / (currentAssignment?.marks || 100) >= 0.5 ? 'text-green-600 dark:text-green-400' : 'text-orange-500'}>
                                  {sub.totalScore}/{currentAssignment?.marks ?? '?'}
                                </span>
                              : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="text-center py-3">
                            {sub.status !== 'pending' && (
                              <button
                                onClick={() => gradingId === sub._id ? cancelGrading() : startGrading(sub)}
                                className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
                              >
                                {gradingId === sub._id ? 'Cancel' : sub.status === 'graded' ? 'Edit' : 'Grade'}
                              </button>
                            )}
                          </td>
                        </tr>

                        {/* Inline grading row */}
                        {gradingId === sub._id && (
                          <tr key={`grade-${sub._id}`} className="bg-primary-50 dark:bg-primary-900/10">
                            <td colSpan={5} className="px-4 py-3">
                              <div className="flex flex-wrap gap-3 items-end">
                                <div>
                                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                                    Score (max {currentAssignment?.marks ?? 100})
                                  </label>
                                  <input
                                    type="number"
                                    min={0}
                                    max={currentAssignment?.marks ?? 100}
                                    value={gradeInput.score}
                                    onChange={(e) => setGradeInput((p) => ({ ...p, score: e.target.value }))}
                                    className="w-24 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400"
                                  />
                                </div>
                                <div className="flex-1 min-w-48">
                                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                                    Feedback (optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={gradeInput.feedback}
                                    onChange={(e) => setGradeInput((p) => ({ ...p, feedback: e.target.value }))}
                                    placeholder="Add feedback for student..."
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400"
                                  />
                                </div>
                                <button
                                  onClick={() => saveGrade(sub._id)}
                                  disabled={saveStatus === 'saving'}
                                  className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                                >
                                  {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved!' : 'Save Grade'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({ label, value, icon, color = 'gray' }: {
  label: string; value: number; icon: React.ReactNode;
  color?: 'gray' | 'green' | 'amber' | 'blue';
}) {
  const colors = {
    gray: 'text-gray-500 dark:text-gray-400',
    green: 'text-green-600 dark:text-green-400',
    amber: 'text-amber-600 dark:text-amber-400',
    blue: 'text-blue-600 dark:text-blue-400',
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3">
      <div className={colors[color]}>{icon}</div>
      <div>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Submission['status'] }) {
  const map: Record<Submission['status'], { label: string; variant: 'default' | 'success' | 'warning' | 'outline' }> = {
    graded: { label: 'Graded', variant: 'success' },
    submitted: { label: 'Submitted', variant: 'default' },
    late: { label: 'Late', variant: 'warning' },
    pending: { label: 'Not submitted', variant: 'outline' },
  };
  const { label, variant } = map[status] ?? map.pending;
  return <Badge variant={variant} className="text-xs">{label}</Badge>;
}
