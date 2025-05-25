// src/mockBackend/Store.js
import initialData from './initialData';
import { generateId, simulateDelay } from './utils';

class Store {
  constructor() {
    this.STORAGE_KEY = 'ReviewAppStore';
    this.autoSave = true;
    this.data = this.loadFromStorage() || initialData;
  }

  // ======================== Persistence ========================
  saveToStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
  }

  loadFromStorage() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  async exportToJSON() {
    const dataStr = JSON.stringify(this.data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `reviewapp_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          this.data = JSON.parse(e.target.result);
          this.saveToStorage();
          resolve();
        } catch (error) {
          reject('Invalid JSON format');
        }
      };
      reader.readAsText(file);
    });
  }

  resetToInitial() {
    this.data = initialData;
    this.saveToStorage();
  }

  // ======================== User Methods ========================
  async registerUser({ email, password, role = 'user' }) {
    await simulateDelay();
    
    if (this.data.users.some(u => u.email === email)) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: generateId('user'),
      email,
      password,
      role,
      isApproved: role === 'manager' ? false : true,
      companyId: null,
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.saveToStorage();
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
    this.saveToStorage();
    return { token: session.token, user };
  }

  async getCurrentUser() {
    const token = localStorage.getItem('sessionToken');
    if (!token) return null;

    const session = this.data.sessions.find(s => s.token === token);
    if (!session) return null;

    return this.data.users.find(u => u.id === session.userId) || null;
  }

  logout() {
    localStorage.removeItem('sessionToken');
    return true;
  }

  // ======================== Company Methods ========================
  async submitCompanyApplication(application) {
    await simulateDelay();
    
    const newApplication = {
      ...application,
      id: generateId('compApp'),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.data.applications.push(newApplication);
    this.saveToStorage();
    return newApplication;
  }

  async approveCompany(applicationId) {
    await simulateDelay();
    
    const application = this.data.applications.find(a => a.id === applicationId);
    if (!application) throw new Error('Application not found');

    const company = {
      ...application,
      id: generateId('company'),
      rating: 0,
      reviews: [],
      approvedAt: new Date().toISOString()
    };

    // Link manager to company
    const manager = this.data.users.find(u => u.id === application.managerId);
    if (manager) manager.companyId = company.id;

    this.data.companies.push(company);
    this.data.applications = this.data.applications.filter(a => a.id !== applicationId);
    this.saveToStorage();
    return company;
  }

  async updateCompanyInfo(companyId, updates) {
    await simulateDelay();
    
    const company = this.data.companies.find(c => c.id === companyId);
    if (!company) throw new Error('Company not found');

    Object.assign(company, updates);
    this.saveToStorage();
    return company;
  }
  // ======================== Service Methods =======================
    async createServicePost(serviceData) {
    await simulateDelay();
    
    const newService = {
      id: generateId('service'),
      sections: serviceData.sections,
      images: serviceData.images,
      tags: serviceData.tags.toLowerCase().split(' ').filter(t => t),
      stats: {
        views: 0,
        likes: 0,
        shares: 0,
        ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        totalRating: 0
      },
      createdAt: new Date().toISOString(),
      companyId: serviceData.companyId
    };

    this.data.services.push(newService);
    this.saveToStorage();
    return newService;
  }

async searchServices(keywords = '') {
  await simulateDelay();
  const services = this.data.services || [];
  if (!keywords.trim()) {
    return services.sort((a, b) => 
      this.calculateRelevanceScore(b) - this.calculateRelevanceScore(a)
    );
  }
  const searchTerms = keywords
    .toLowerCase()
    .split(' ')
    .filter(term => term.trim().length > 0);
  if (searchTerms.length === 0) {
    return [];
  }

  return services
    .filter(service => {
      const tagMatches = searchTerms.some(term => 
        service.tags.includes(term)
      );
      
      const contentMatches = searchTerms.some(term =>
        service.sections.some(section => 
          section.content.toLowerCase().includes(term)
        )
      );
      
      return tagMatches || contentMatches;
    })
    .sort((a, b) => 
      this.calculateRelevanceScore(b) - this.calculateRelevanceScore(a)
    );
}

  calculateRelevanceScore(service) {
    const ageScore = (new Date() - new Date(service.createdAt)) / (1000 * 3600 * 24);
    const ratingScore = service.stats.totalRating * 10;
    const interactionScore = (service.stats.views * 0.1) + (service.stats.likes * 0.3) + (service.stats.shares * 0.5);
    
    return (interactionScore + ratingScore) / ageScore;
  }

 async incrementViews(serviceId, userId) {
    const service = this.data.services.find(s => s.id === serviceId);
    if (!service) return;

    const now = Date.now();
    service.views = service.views || {};

    if (!service.views[userId] || (now - service.views[userId] > 300000)) {
      service.stats.views++;
      service.views[userId] = now;
      this.saveToStorage();
    }
  }

  async toggleLike(serviceId, userId) {
    const service = this.data.services.find(s => s.id === serviceId);
    if (!service) throw new Error('Service not found');

    service.likes = service.likes || [];
    const index = service.likes.indexOf(userId);

    if (index === -1) {
      service.likes.push(userId);
      service.stats.likes++;
    } else {
      service.likes.splice(index, 1);
      service.stats.likes--;
    }
    this.saveToStorage();
  }

  async rateService(serviceId, userId, stars) {
    const service = this.data.services.find(s => s.id === serviceId);
    if (!service) throw new Error('Service not found');

    service.ratings = service.ratings || {};
    if (service.ratings[userId]) throw new Error('You already rated this service');

    service.ratings[userId] = stars;
    
    // Update average rating
    const ratings = Object.values(service.ratings);
    service.stats.totalRating = 
      ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    
    this.saveToStorage();
  }

  async addComment(serviceId, userId, text) {
    const service = this.data.services.find(s => s.id === serviceId);
    if (!service) throw new Error('Service not found');

    service.comments = service.comments || [];
    const comment = {
      id: generateId('comment'),
      userId,
      text,
      createdAt: new Date().toISOString()
    };

    service.comments.unshift(comment);
    this.saveToStorage();
    return comment;
  }

  async getService(id) {
    await simulateDelay();
    return this.data.services.find(s => s.id === id);
  }

  // ======================== Review Methods ========================
  async createReview({ userId, companyId, rating, text }) {
    await simulateDelay();
    
    if (this.data.reviews.some(r => 
      r.userId === userId && r.companyId === companyId
    )) {
      throw new Error('You already reviewed this company');
    }

    const newReview = {
      id: generateId('review'),
      userId,
      companyId,
      rating,
      text,
      likes: 0,
      dislikes: 0,
      replies: [],
      createdAt: new Date().toISOString()
    };

    this.data.reviews.push(newReview);
    this.updateCompanyRating(companyId);
    this.saveToStorage();
    return newReview;
  }

  async addReplyToReview(reviewId, { userId, text }) {
    await simulateDelay();
    
    const review = this.data.reviews.find(r => r.id === reviewId);
    if (!review) throw new Error('Review not found');

    const user = this.data.users.find(u => u.id === userId);
    if (user?.companyId !== review.companyId) {
      throw new Error('Only company manager can reply');
    }

    const reply = {
      id: generateId('reply'),
      userId,
      text,
      createdAt: new Date().toISOString()
    };

    review.replies.push(reply);
    this.saveToStorage();
    return reply;
  }

  async rateReview(reviewId, userId, isLike) {
    await simulateDelay();
    
    const review = this.data.reviews.find(r => r.id === reviewId);
    if (!review) throw new Error('Review not found');

    const existingRating = this.data.ratings.find(r => 
      r.reviewId === reviewId && r.userId === userId
    );

    if (existingRating) {
      throw new Error('You already rated this review');
    }

    this.data.ratings.push({
      id: generateId('rating'),
      reviewId,
      userId,
      isLike
    });

    isLike ? review.likes++ : review.dislikes++;
    this.saveToStorage();
    return review;
  }


 async toggleCommentLike(commentId, userId) {
    const comment = this.data.services
      .flatMap(s => s.comments || [])
      .find(c => c.id === commentId);

    if (!comment) throw new Error('Comment not found');

    if (comment.dislikes?.includes(userId)) {
      comment.dislikes = comment.dislikes.filter(id => id !== userId);
    }

    comment.likes = comment.likes || [];
    const index = comment.likes.indexOf(userId);
    
    if (index === -1) {
      comment.likes.push(userId);
    } else {
      comment.likes.splice(index, 1);
    }
    
    this.saveToStorage();
    return comment;
  }

  async toggleCommentDislike(commentId, userId) {
    const comment = this.data.services
      .flatMap(s => s.comments || [])
      .find(c => c.id === commentId);

    if (!comment) throw new Error('Comment not found');
    
    if (comment.likes?.includes(userId)) {
      comment.likes = comment.likes.filter(id => id !== userId);
    }
    
    comment.dislikes = comment.dislikes || [];
    const index = comment.dislikes.indexOf(userId);
    
    if (index === -1) {
      comment.dislikes.push(userId);
    } else {
      comment.dislikes.splice(index, 1);
    }
    
    this.saveToStorage();
    return comment;
  }

  // ======================== Helper Methods ========================
  updateCompanyRating(companyId) {
    const companyReviews = this.data.reviews.filter(r => r.companyId === companyId);
    const totalRating = companyReviews.reduce((sum, r) => sum + r.rating, 0);
    const company = this.data.companies.find(c => c.id === companyId);
    if (company) company.rating = totalRating / companyReviews.length || 0;
  }

  // ======================== Moderation Methods ========================
  async getPendingApplications() {
    await simulateDelay();
    return this.data.applications.filter(a => a.status === 'pending');
  }

  async flagReview(reviewId, reason) {
    await simulateDelay();
    
    const review = this.data.reviews.find(r => r.id === reviewId);
    if (!review) throw new Error('Review not found');

    review.isFlagged = true;
    review.flagReason = reason;
    this.saveToStorage();
    return review;
  }
}

export const store = new Store();