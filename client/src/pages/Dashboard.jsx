import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../api/axios';
import { LogOut, LayoutDashboard, Settings, Users, FolderKanban, Plus, X, Bell, Clock, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';
import { CardSkeleton, StatSkeleton } from '../components/Skeleton';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { projects, createProject, loading: projectsLoading } = useProjects();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [stats, setStats] = useState({ projectsCount: 0, overdueCount: 0, myTasksCount: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const project = await createProject(newProject);
      toast.success('Project created successfully!');
      setIsModalOpen(false);
      setNewProject({ name: '', description: '' });
      navigate(`/project/${project.id}`);
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  return (
    <div className="flex h-screen bg-[#050811] text-slate-200">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 p-8 flex flex-col gap-10 bg-[#0f172a]/30 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-indigo-500/30">
            T
          </div>
          <span className="font-bold text-2xl tracking-tight">TaskMaps</span>
        </div>

        <nav className="flex-1 flex flex-col gap-3">
          <NavItem icon={<LayoutDashboard size={22} />} label="Dashboard" to="/" active />
          <NavItem icon={<FolderKanban size={22} />} label="Projects" to="/" />
          <NavItem icon={<Users size={22} />} label="Team" to="/team" />
          <NavItem icon={<Settings size={22} />} label="Settings" to="/settings" />
        </nav>

        <div className="pt-8 border-t border-white/5">
          <button 
            onClick={logout}
            className="flex items-center gap-3 text-slate-400 hover:text-white transition-all duration-300 w-full group !bg-transparent outline-none border-none cursor-pointer"
          >
            <div className="p-2 rounded-lg group-hover:bg-red-500/10 group-hover:text-red-400 transition-all">
              <LogOut size={20} />
            </div>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-12 bg-gradient-to-br from-transparent to-indigo-500/5">
        <header className="flex justify-between items-start mb-12">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-2 tracking-tight">Welcome back, {user?.name}</h1>
            <p className="text-slate-400 text-lg">Here's an overview of your active workspace.</p>
          </div>
          
          <div className="flex-1 max-w-xl mx-12 relative group hidden xl:block animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search tasks, projects, members... (Ctrl+K)" 
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm text-slate-200 outline-none focus:bg-white/10 focus:border-indigo-500/50 transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 relative group outline-none"
              >
                <Bell size={24} className="group-hover:rotate-12 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full text-[10px] flex items-center justify-center font-bold border-2 border-[#050811] shadow-lg">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-4 w-96 glass-card !p-0 z-50 border-white/10 overflow-hidden shadow-2xl animate-fade-in">
                  <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="font-bold text-lg">Notifications</h3>
                    <button onClick={markAllRead} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-full transition-all outline-none border-none cursor-pointer">Mark all read</button>
                  </div>
                  <div className="max-h-[450px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-600">
                          <Bell size={32} />
                        </div>
                        <p className="text-slate-500 font-medium">All caught up!</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => markAsRead(n.id)}
                          className={`p-5 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-all ${!n.read ? 'bg-indigo-500/5 border-l-4 border-l-indigo-500' : ''}`}
                        >
                          <p className="text-sm text-slate-200 leading-snug mb-2">{n.message}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString()} &bull; {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <Plus size={20} />
              New Project
            </button>
            <div className="flex items-center gap-4 bg-white/5 p-2 pr-6 rounded-2xl border border-white/5">
              <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
                {user?.name?.charAt(0)}
              </div>
              <div className="text-left">
                <p className="font-bold text-sm tracking-tight">{user?.name}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">Free Plan</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {loading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <StatCard title="Active Projects" value={stats.projectsCount} icon={<FolderKanban size={24} className="text-indigo-400" />} />
              <StatCard title="My Pending Tasks" value={stats.myTasksCount} icon={<LayoutDashboard size={24} className="text-emerald-400" />} />
              <StatCard title="Overdue Tasks" value={stats.overdueCount} icon={<Clock size={24} className="text-rose-400" />} color="rose" />
            </>
          )}
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Recent Projects</h2>
          <button className="text-indigo-400 font-bold text-sm hover:text-indigo-300 transition-colors uppercase tracking-widest bg-transparent border-none cursor-pointer outline-none">View all projects</button>
        </div>

        {projectsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState 
            icon={FolderKanban}
            title="No projects found"
            message="Start by creating your first project to organize your team's workflow and tasks."
            actionText="Create New Project"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects
              .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((project, index) => (
              <div 
                key={project.id} 
                onClick={() => navigate(`/project/${project.id}`)}
                className="glass-card hover:ring-2 hover:ring-indigo-500/50 transition-all cursor-pointer group flex flex-col h-full animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                    <FolderKanban size={24} />
                  </div>
                  <span className={`badge ${project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                    {project.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-400 transition-colors line-clamp-1">{project.name}</h3>
                <p className="text-slate-400 text-sm mb-8 line-clamp-2 leading-relaxed flex-1">{project.description || 'No description provided.'}</p>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex -space-x-3">
                    {project.members?.slice(0, 4).map((member) => (
                      <div key={member.id} className="w-10 h-10 rounded-full bg-indigo-600 border-4 border-[#0f172a] flex items-center justify-center text-xs font-bold shadow-xl overflow-hidden" title={member.name}>
                        {member.name.charAt(0)}
                      </div>
                    ))}
                    {project.members?.length > 4 && (
                      <div className="w-10 h-10 rounded-full bg-slate-800 border-4 border-[#0f172a] flex items-center justify-center text-[10px] font-bold text-slate-400">
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                    <Users size={14} />
                    <span>{project.members?.length || 0} Members</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card w-full max-w-xl border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <Plus size={24} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Create New Project</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white outline-none border-none cursor-pointer">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Project Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter project name..."
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                  required
                  minLength={3}
                  maxLength={60}
                />
              </div>
              <div className="mb-10">
                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Description</label>
                <textarea
                  className="input-field min-h-[120px] resize-none"
                  placeholder="Add a brief description of the project..."
                  value={newProject.description}
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                />
              </div>
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:bg-white/5 transition-all border border-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary border-none">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, to = "#", active = false }) => (
  <Link to={to} className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${active ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 shadow-lg shadow-indigo-600/5' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
    <div className={`p-2 rounded-xl transition-all ${active ? 'bg-indigo-600/20 shadow-inner' : 'group-hover:bg-white/5'}`}>
      {icon}
    </div>
    <span className="font-bold tracking-tight">{label}</span>
  </Link>
);

const StatCard = ({ title, value, icon, color = "indigo" }) => (
  <div className="glass-card !p-8 flex items-center justify-between group overflow-hidden relative">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700`}></div>
    <div className="relative z-10">
      <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mb-2">{title}</p>
      <p className="text-4xl font-bold tracking-tight">{value}</p>
    </div>
    <div className={`p-4 bg-${color}-500/10 rounded-2xl text-${color}-400 group-hover:rotate-12 transition-transform duration-300 relative z-10`}>
      {icon}
    </div>
  </div>
);

export default Dashboard;
