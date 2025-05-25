import initialData from './initialData';
import { generateId, simulateDelay } from './utils';

class Store {
  constructor() {
    this.data = initialData;
    this.STORAGE_KEY = 'mockBackendData';
    this.loadFromLocalStorage();
  }

  // ======================== Persistence ========================
  saveToLocalStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
  }

  loadFromLocalStorage() {
    const savedData = localStorage.getItem(this.STORAGE_KEY);
    if (savedData) {
      this.data = JSON.parse(savedData);
    }
  }

  async exportToFile() {
    const dataStr = JSON.stringify(this.data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `mockBackend_${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          this.data = JSON.parse(e.target.result);
          this.saveToLocalStorage();
          resolve();
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.readAsText(file);
    });
  }

  resetToInitial() {
    this.data = initialData;
    this.saveToLocalStorage();
    return simulateDelay();
  }

  // ======================== Users ========================
  async registerUser(userData) {
    await simulateDelay();
    
    if (this.data.users.some(u => u.email === userData.email)) {
      throw new Error('User already exists');
    }

    const newUser = {
      ...userData,
      id: generateId('user'),
      role: 'user',
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.saveToLocalStorage();
    return newUser;
  }
  
  async login(email, password) {
  await simulateDelay();
  const user = this.data.users.find(u => 
    u.email === email && u.password === password
  );
  
  if (!user) throw new Error('Invalid credentials');
  if (user.role === 'manager' && !user.isApproved) {
    throw new Error('Manager account pending approval');
  }

  const session = {
    token: generateId('session'),
    userId: user.id,
    createdAt: new Date().toISOString()
  };
  
  this.data.sessions.push(session);
  this.saveToLocalStorage();
  return { token: session.token, user };
}

async getCurrentUser() {
  const token = localStorage.getItem('sessionToken');
  if (!token) throw new Error('Not authenticated');
  
  const session = this.data.sessions.find(s => s.token === token);
  if (!session) throw new Error('Invalid session');
  
  const user = this.data.users.find(u => u.id === session.userId);
  if (!user) throw new Error('User not found');
  
  return user;
}

logout() {
  localStorage.removeItem('sessionToken');
}

  // ======================== Companies ========================
  async submitCompanyApplication(application) {
    await simulateDelay();
    
    const newApplication = {
      ...application,
      id: generateId('compApp'),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.data.applications.push(newApplication);
    this.saveToLocalStorage();
    return newApplication;
  }

  // ======================== Reviews ========================
  async createReview(reviewData) {
    await simulateDelay();
    
    const existingReview = this.data.reviews.find(
      r => r.companyId === reviewData.companyId && 
           r.userId === reviewData.userId
    );

    if (existingReview) {
      throw new Error('User already reviewed this company');
    }

    const newReview = {
      ...reviewData,
      id: generateId('review'),
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      replies: []
    };

    this.data.reviews.push(newReview);
    this.saveToLocalStorage();
    return newReview;
  }
}

export const store = new Store();