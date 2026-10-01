const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('cms_access_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const isMultipart = options.body instanceof FormData;
  const headers = {
    ...getAuthHeaders(isMultipart),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
      // Unauthorized: clear token and notify
      localStorage.removeItem('cms_access_token');
      localStorage.removeItem('cms_user');
      window.dispatchEvent(new Event('cms_auth_expired'));
    }

    if (!res.ok) {
      throw new Error(data.error || data.message || `HTTP Error ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error(`[CMS API Error] ${endpoint}:`, error);
    throw error;
  }
}

export const cmsApi = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),
  changePassword: (data) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
  
  // Health
  getHealth: () => request('/health'),

  // About
  getAbout: () => request('/about'),
  updateAbout: (data) => request('/about', { method: 'PUT', body: JSON.stringify(data) }),

  // Skills
  getSkills: () => request('/skills'),
  createSkill: (data) => request('/skills', { method: 'POST', body: JSON.stringify(data) }),
  updateSkill: (id, data) => request(`/skills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSkill: (id) => request(`/skills/${id}`, { method: 'DELETE' }),

  // Projects
  getProjects: () => request('/projects'),
  createProject: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  // Blogs
  getBlogs: () => request('/blogs'),
  createBlog: (data) => request('/blogs', { method: 'POST', body: JSON.stringify(data) }),
  updateBlog: (id, data) => request(`/blogs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBlog: (id) => request(`/blogs/${id}`, { method: 'DELETE' }),

  // Experiences
  getExperiences: () => request('/experience'),
  createExperience: (data) => request('/experience', { method: 'POST', body: JSON.stringify(data) }),
  updateExperience: (id, data) => request(`/experience/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExperience: (id) => request(`/experience/${id}`, { method: 'DELETE' }),

  // Testimonials
  getTestimonials: () => request('/testimonials'),
  createTestimonial: (data) => request('/testimonials', { method: 'POST', body: JSON.stringify(data) }),
  updateTestimonial: (id, data) => request(`/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTestimonial: (id) => request(`/testimonials/${id}`, { method: 'DELETE' }),

  // Services
  getServices: () => request('/services'),
  createService: (data) => request('/services', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id, data) => request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteService: (id) => request(`/services/${id}`, { method: 'DELETE' }),

  // Messages (Contact Form)
  getMessages: () => request('/contact/messages'),
  markMessageRead: (id) => request(`/contact/messages/${id}/read`, { method: 'PATCH' }),
  deleteMessage: (id) => request(`/contact/messages/${id}`, { method: 'DELETE' }),

  // Media & Uploads
  getMedia: () => request('/upload/media'),
  uploadImage: (formData) => request('/upload/image', { method: 'POST', body: formData }),
  deleteMedia: (id) => request(`/upload/media/${id}`, { method: 'DELETE' })
};
