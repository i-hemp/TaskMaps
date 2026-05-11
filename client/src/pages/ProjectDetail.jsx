import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Plus, MoreVertical, MessageSquare, Clock, User, ArrowLeft, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen bg-[#050811] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
  if (!project) return <div className="p-20 text-center text-xl font-bold">Project not found</div>;

  const columns = [
    { id: 'todo', title: 'To Do', color: 'slate' },
    { id: 'in_progress', title: 'In Progress', color: 'indigo' },
    { id: 'review', title: 'Review', color: 'amber' },
    { id: 'done', title: 'Done', color: 'emerald' }
  ];

  return (
    <div className="min-h-screen bg-[#050811] flex flex-col text-slate-200">
      <header className="border-b border-white/5 p-8 flex justify-between items-center bg-[#0f172a]/40 backdrop-blur-2xl sticky top-0 z-20 shadow-2xl">
        <div className="flex items-center gap-6">
          <Link to="/" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group">
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
              <div key={member.id} className="w-10 h-10 rounded-xl bg-indigo-600 border-4 border-[#0a0f1d] flex items-center justify-center text-xs font-bold shadow-xl" title={member.name}>
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
                  <div className={`w-2 h-2 rounded-full bg-${column.color}-500 shadow-[0_0_10px_rgba(var(--${column.color}-rgb),0.5)]`}></div>
                  <h3 className="font-bold text-slate-400 uppercase tracking-[0.2em] text-xs">{column.title}</h3>
                  <span className="bg-white/5 text-slate-500 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/5">
                    {tasks.filter(t => t.status === column.id).length}
                  </span>
                </div>
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-600">
                  <Plus size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {tasks.filter(t => t.status === column.id).map((task, index) => (
                  <div 
                    key={task.id} 
                    onClick={() => openTaskDetail(task)}
                    className="glass-card !p-6 hover:ring-2 hover:ring-indigo-500/50 transition-all cursor-pointer group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={`badge ${getPriorityStyle(task.priority)}`}>
                        {task.priority}
                      </span>
                      <button className="text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                    <h4 className="font-bold text-lg mb-4 group-hover:text-indigo-400 transition-colors leading-snug">{task.title}</h4>
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare size={14} />
                          <span className="text-[10px] font-bold">{task.Comments?.length || 0}</span>
                        </div>
                        {task.due_date && (
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            <span className="text-[10px] font-bold">{new Date(task.due_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <select 
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                          className="bg-white/5 border-none text-[10px] font-bold text-slate-500 rounded-lg py-1 px-2 outline-none hover:bg-white/10 transition-colors cursor-pointer"
                          value={task.status}
                        >
                          {columns.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
                        </select>
                        {task.assignee ? (
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-[10px] font-bold shadow-lg" title={task.assignee.name}>
                            {task.assignee.name.charAt(0)}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-600 border border-white/5">
                            <User size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    setNewTask(prev => ({ ...prev, status: column.id }));
                    setIsTaskModalOpen(true);
                  }}
                  className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-slate-600 font-bold text-sm hover:border-indigo-500/30 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2 group"
                >
                  <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                  Add New Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Task Creation Modal */}
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
              <button onClick={() => setIsTaskModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Task Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="What needs to be done?"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Description</label>
                <textarea
                  className="input-field min-h-[120px] resize-none"
                  placeholder="Add details about this task..."
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Priority</label>
                  <select 
                    className="input-field cursor-pointer"
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Assignee</label>
                  <select 
                    className="input-field cursor-pointer"
                    value={newTask.assigned_to}
                    onChange={e => setNewTask({...newTask, assigned_to: e.target.value})}
                  >
                    <option value="">Unassigned</option>
                    {project.members?.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Due Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={newTask.due_date}
                    onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsTaskModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:bg-white/5 transition-all border border-white/5"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal (Side Panel) */}
      {isDetailModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-end z-50 animate-fade-in">
          <div onClick={() => setIsDetailModalOpen(false)} className="absolute inset-0 cursor-pointer"></div>
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            className="w-full max-w-2xl h-full bg-[#0f172a] border-l border-white/5 p-12 overflow-y-auto relative shadow-2xl"
          >
            <div className="flex justify-between items-center mb-10">
              <span className={`badge ${getPriorityStyle(selectedTask.priority)}`}>
                {selectedTask.priority}
              </span>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-slate-400 hover:text-white">
                <X size={28} />
              </button>
            </div>

            <h2 className="text-4xl font-bold mb-10 tracking-tight leading-tight">{selectedTask.title}</h2>
            
            <div className="grid grid-cols-2 gap-10 mb-12 bg-white/5 p-8 rounded-3xl border border-white/5">
              <div>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-3">Status</p>
                <select 
                  className="input-field !mb-0 cursor-pointer font-bold"
                  value={selectedTask.status}
                  onChange={(e) => handleUpdateStatus(selectedTask.id, e.target.value)}
                >
                  {columns.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
                </select>
              </div>
              <div>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-3">Assignee</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xl shadow-lg">
                    {selectedTask.assignee?.name?.charAt(0) || <User size={20} />}
                  </div>
                  <div>
                    <p className="font-bold">{selectedTask.assignee?.name || 'Unassigned'}</p>
                    <p className="text-xs text-slate-500 font-medium">Team Member</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-4">Task Description</p>
              <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">
                {selectedTask.description || 'No description provided for this task.'}
              </p>
            </div>

            <div className="border-t border-white/5 pt-12">
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <MessageSquare size={24} className="text-indigo-400" />
                Comments
                <span className="text-sm font-bold text-slate-500 bg-white/5 px-3 py-1 rounded-full">{comments.length}</span>
              </h3>

              <form onSubmit={handleAddComment} className="mb-12">
                <textarea
                  className="input-field min-h-[140px] resize-none !mb-4 !p-6"
                  placeholder="Leave a thought or update..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex justify-end">
                  <button type="submit" className="btn-primary">Post Comment</button>
                </div>
              </form>

              <div className="flex flex-col gap-8">
                {comments.length === 0 ? (
                  <div className="p-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p className="text-slate-500 font-medium italic text-lg">No comments yet. Start the conversation!</p>
                  </div>
                ) : (
                  comments.map((comment, index) => (
                    <div key={comment.id} className="flex gap-5 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 font-bold text-indigo-400 text-lg shadow-inner">
                        {comment.User?.name?.charAt(0)}
                      </div>
                      <div className="flex-1 bg-white/5 p-6 rounded-3xl rounded-tl-none border border-white/5">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-slate-200">{comment.User?.name}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const getPriorityStyle = (priority) => {
  switch (priority) {
    case 'urgent': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  }
};

export default ProjectDetail;
