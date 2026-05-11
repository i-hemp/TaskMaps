import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Plus, MoreVertical, MessageSquare, Clock, User, ArrowLeft, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { TaskSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assigned_to: '',
    due_date: ''
  });

  const fetchProjectData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      toast.error('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${id}/tasks`, newTask);
      setTasks(prev => [res.data, ...prev]);
      toast.success('Task created successfully!');
      setIsTaskModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'medium', assigned_to: '', due_date: '' });
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const openTaskDetail = async (task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
    try {
      const res = await api.get(`/projects/${id}/tasks/${task.id}`);
      setSelectedTask(res.data);
      setComments(res.data.Comments || []);
    } catch (error) {
      toast.error('Failed to load task details');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/projects/${id}/tasks/${selectedTask.id}/comments`, {
        content: newComment
      });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/projects/${id}/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      if (selectedTask?.id === taskId) {
        setSelectedTask(prev => ({ ...prev, status: newStatus }));
      }
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050811] flex flex-col">
      <div className="h-24 border-b border-white/5 bg-[#0f172a]/40 animate-pulse"></div>
      <div className="flex-1 p-8 flex gap-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="w-96 flex-shrink-0 flex flex-col gap-6">
            <div className="h-6 w-32 bg-white/5 rounded-full animate-pulse"></div>
            <TaskSkeleton />
            <TaskSkeleton />
          </div>
        ))}
      </div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen bg-[#050811] flex items-center justify-center">
      <EmptyState 
        icon={User}
        title="Project not found"
        message="The project you're looking for doesn't exist or you don't have access to it."
        actionText="Back to Dashboard"
        onAction={() => window.location.href = '/'}
      />
    </div>
  );

  const columns = [
    { id: 'todo', title: 'To Do', color: 'slate' },
    { id: 'in_progress', title: 'In Progress', color: 'indigo' },
    { id: 'review', title: 'Review', color: 'amber' },
    { id: 'done', title: 'Done', color: 'emerald' }
  ];

  const getStatusColor = (color) => {
    const colors = {
      slate: 'bg-slate-500',
      indigo: 'bg-indigo-500',
      amber: 'bg-amber-500',
      emerald: 'bg-emerald-500'
    };
    return colors[color] || colors.slate;
  };

  return (
    <div className="min-h-screen bg-[#050811] flex flex-col text-slate-200">
      <header className="border-b border-white/5 p-8 flex justify-between items-center bg-[#0f172a]/40 backdrop-blur-2xl sticky top-0 z-20 shadow-2xl">
        <div className="flex items-center gap-6">
          <Link to="/" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group outline-none">
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold tracking-tight mb-1">{project.name}</h1>
            <div className="flex items-center gap-2">
              <span className="badge bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Active Workspace</span>
              <span className="text-slate-500 text-sm font-medium">&bull; Created by {project.creator?.name || 'You'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex -space-x-3">
            {project.members?.map(member => (
              <div key={member.id} className="w-10 h-10 rounded-full bg-indigo-600 border-4 border-[#0a0f1d] flex items-center justify-center text-xs font-bold shadow-xl overflow-hidden" title={member.name}>
                {member.name.charAt(0)}
              </div>
            ))}
          </div>
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="btn-primary"
          >
            <Plus size={20} />
            Add Task
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto p-8 bg-gradient-to-br from-transparent to-indigo-500/5">
        <div className="flex gap-8 min-h-full items-start">
          {columns.map(column => (
            <div key={column.id} className="w-96 flex-shrink-0 flex flex-col gap-6">
              <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(column.color)} shadow-[0_0_10px_rgba(99,102,241,0.5)]`}></div>
                  <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs">{column.title}</h3>
                  <span className="bg-white/5 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-500">
                    {tasks.filter(t => t.status === column.id).length}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4 min-h-[200px]">
                {tasks.filter(t => t.status === column.id).map((task, index) => (
                  <div 
                    key={task.id}
                    onClick={() => openTaskDetail(task)}
                    className="glass-card !p-6 cursor-pointer hover:ring-2 hover:ring-indigo-500/30 transition-all animate-fade-in group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={`badge ${
                        task.priority === 'urgent' ? 'bg-rose-500/10 text-rose-400' :
                        task.priority === 'high' ? 'bg-orange-500/10 text-orange-400' :
                        task.priority === 'medium' ? 'bg-indigo-500/10 text-indigo-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {task.priority}
                      </span>
                      <button className="text-slate-500 hover:text-white transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                    <h4 className="font-bold mb-4 group-hover:text-indigo-400 transition-colors leading-snug">{task.title}</h4>
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                        <Clock size={14} />
                        <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-[#0a0f1d] flex items-center justify-center text-[10px] font-bold shadow-lg" title={task.assignee?.name}>
                        {task.assignee?.name?.charAt(0) || '?'}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => {
                    setNewTask(prev => ({ ...prev, status: column.id }));
                    setIsTaskModalOpen(true);
                  }}
                  className="p-4 border-2 border-dashed border-white/5 rounded-2xl text-slate-500 hover:border-indigo-500/30 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all font-bold text-sm flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                  Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Task Modal and Detail Panel remain consistent with Dashboard styling */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card w-full max-w-xl border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <Plus size={24} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Create New Task</h2>
              </div>
              <button onClick={() => setIsTaskModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white outline-none border-none cursor-pointer">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Task Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter task title..."
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Priority</label>
                  <select 
                    className="input-field"
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="low" className="bg-[#0f172a]">Low</option>
                    <option value="medium" className="bg-[#0f172a]">Medium</option>
                    <option value="high" className="bg-[#0f172a]">High</option>
                    <option value="urgent" className="bg-[#0f172a]">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Due Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={newTask.due_date}
                    onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="mb-10">
                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Description</label>
                <textarea
                  className="input-field min-h-[120px] resize-none"
                  placeholder="What needs to be done?"
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsTaskModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:bg-white/5 transition-all border border-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary border-none">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Sidebar Panel */}
      {isDetailModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDetailModalOpen(false)}></div>
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            className="relative w-full max-w-2xl bg-[#0f172a] border-l border-white/10 h-full shadow-2xl flex flex-col"
          >
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0a0f1d]/50">
              <div className="flex items-center gap-4">
                <span className={`badge ${
                  selectedTask.priority === 'urgent' ? 'bg-rose-500/10 text-rose-400' :
                  selectedTask.priority === 'high' ? 'bg-orange-500/10 text-orange-400' :
                  'bg-indigo-500/10 text-indigo-400'
                }`}>
                  {selectedTask.priority}
                </span>
                <span className="text-slate-500">&bull;</span>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  <Clock size={14} />
                  <span>Due {selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : 'No date'}</span>
                </div>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white outline-none border-none cursor-pointer">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-12">
              <h2 className="text-4xl font-bold mb-8 tracking-tight leading-tight">{selectedTask.title}</h2>
              
              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Status</p>
                  <select 
                    value={selectedTask.status}
                    onChange={(e) => handleUpdateStatus(selectedTask.id, e.target.value)}
                    className="bg-transparent font-bold text-indigo-400 outline-none border-none cursor-pointer"
                  >
                    {columns.map(c => <option key={c.id} value={c.id} className="bg-[#0f172a]">{c.title}</option>)}
                  </select>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Assignee</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-[10px]">
                      {selectedTask.assignee?.name?.charAt(0) || '?'}
                    </div>
                    <span className="font-bold text-sm">{selectedTask.assignee?.name || 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Description</p>
                <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">{selectedTask.description || 'No description provided.'}</p>
              </div>

              <div className="border-t border-white/5 pt-12">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold tracking-tight flex items-center gap-3">
                    <MessageSquare size={20} className="text-indigo-400" />
                    Comments
                    <span className="bg-white/5 px-2 py-0.5 rounded-md text-[10px] text-slate-500">{comments.length}</span>
                  </h3>
                </div>

                <form onSubmit={handleAddComment} className="mb-10">
                  <textarea
                    className="input-field min-h-[100px] resize-none mb-4"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary px-6 py-3">Send Comment</button>
                  </div>
                </form>

                <div className="flex flex-col gap-6">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-4 group animate-fade-in">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-white/5">
                        {comment.User?.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 bg-white/5 p-6 rounded-3xl border border-white/5 group-hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-sm text-indigo-400">{comment.User?.name}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
