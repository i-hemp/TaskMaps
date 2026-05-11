import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const useProjects = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchProjects = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const createProject = async (projectData) => {
    const res = await api.post('/projects', projectData);
    setProjects(prev => [...prev, res.data]);
    return res.data;
  };

  const updateProject = async (id, projectData) => {
    const res = await api.put(`/projects/${id}`, projectData);
    setProjects(prev => prev.map(p => p.id === id ? res.data : p));
    return res.data;
  };

  const deleteProject = async (id) => {
    await api.delete(`/projects/${id}`);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ProjectContext.Provider value={{ projects, loading, fetchProjects, createProject, updateProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  );
};
