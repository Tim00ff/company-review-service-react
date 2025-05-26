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
  async registerUser(userData) {
  await simulateDelay();
  
  if (this.data.users.some(u => u.email === userData.email)) {
    throw new Error('User already exists');
  }

  const newUser = {
    id: generateId('user'),
    email: userData.email,
    password: userData.password,
    role: userData.role,
    isApproved: userData.role !== 'manager',
    createdAt: new Date().toISOString()
  };

  if (userData.role === 'manager') {
    this.data.managerApplications.push({
      ...newUser,
      managerName: userData.managerName,
      companyName: userData.companyName,
      status: 'pending',
      appliedAt: new Date().toISOString()
    });
  } else {
    this.data.users.push(newUser);
  }

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


  async getService(id) {
  await simulateDelay();
  const service = this.data.services.find(s => s.id === id);
  return service ? { ...service } : null;
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
	  averageRating: 0,
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
// ======================== Comment Methods ========================
async addComment(serviceId, userId, text, authorRating) {
  const service = this.data.services.find(s => s.id === serviceId);
  if (!service) throw new Error('Service not found');

  const comment = {
    id: generateId('comment'),
    serviceId,
    userId,
    text,
    authorRating: Number(authorRating),
    likes: [],
    dislikes: [],
    replies: [],
    createdAt: new Date().toISOString()
  };

  service.comments = [comment, ...(service.comments || [])];
  this.setServiceAverageRating(serviceId);
  this.saveToStorage();
  return comment;
}

async rateComment(commentId, userId, stars) {
  const comment = this.getComment(commentId);
  if (!comment) throw new Error('Comment not found');
  if (stars < 1 || stars > 5) throw new Error('Invalid rating');

  comment.userRatings[userId] = stars;
  this.updateCommentAverageRating(commentId);
  this.setServiceAverageRating(comment.serviceId);
  this.saveToStorage();
  return comment;
}

async toggleCommentLike(commentId, userId) {
  const comment = this.getComment(commentId);
  if (!comment) throw new Error('Comment not found');

  if (comment.dislikes.includes(userId)) {
    comment.dislikes = comment.dislikes.filter(id => id !== userId);
  }

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

  comment.likes = comment.likes || [];
  comment.dislikes = comment.dislikes || [];

  const likeIndex = comment.likes.indexOf(userId);
  if (likeIndex !== -1) {
    comment.likes.splice(likeIndex, 1);
  }

  const dislikeIndex = comment.dislikes.indexOf(userId);
  if (dislikeIndex === -1) {
    comment.dislikes.push(userId);
  } else {
    comment.dislikes.splice(dislikeIndex, 1);
  }

  this.saveToStorage();
  return comment;
}
// ======================== Replies ========================

async addReply(commentId, userId, text) {
  let targetComment;
  for (const service of this.data.services) {
    targetComment = service.comments?.find(c => c.id === commentId);
    if (targetComment) break;
  }

  if (!targetComment) throw new Error('Comment not found');

  const reply = {
    id: generateId('reply'),
    commentId,
    userId,
    text,
    createdAt: new Date().toISOString()
  };
  targetComment.replies = [...(targetComment.replies || []), reply];
  this.saveToStorage();
  return reply;
}

async toggleReplyLike(replyId, userId) {
  const reply = this.getReply(replyId);
  if (!reply) throw new Error('Reply not found');

  reply.likes = reply.likes || [];
  const index = reply.likes.indexOf(userId);
  
  if (index === -1) {
    reply.likes.push(userId);
  } else {
    reply.likes.splice(index, 1);
  }
  
  this.saveToStorage();
  return reply;
}

async toggleReplyDislike(replyId, userId) {
  const reply = this.getReply(replyId);
  if (!reply) throw new Error('Reply not found');

  reply.dislikes = reply.dislikes || [];
  const index = reply.dislikes.indexOf(userId);
  
  if (index === -1) {
    reply.dislikes.push(userId);
  } else {
    reply.dislikes.splice(index, 1);
  }
  
  this.saveToStorage();
  return reply;
}

getReply(replyId) {
  for (const service of this.data.services) {
    for (const comment of service.comments || []) {
      const reply = comment.replies?.find(r => r.id === replyId);
      if (reply) return reply;
    }
  }
  return null;
}
// ======================== Helpers ========================
getComment(commentId) {
  for (const service of this.data.services) {
    const comment = service.comments?.find(c => c.id === commentId);
    if (comment) {
      return {
        ...comment,
        replies: comment.replies || []
      };
    }
  }
  return null;
}

setServiceAverageRating(serviceId) {
  const service = this.data.services.find(s => s.id === serviceId);
  if (!service) return;

  const ratings = service.comments
    .filter(c => c.authorRating > 0)
    .map(c => c.authorRating);

  service.averageRating = ratings.length > 0 
    ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
    : 0;

  this.saveToStorage();
}


  // ======================== Helper Methods ========================
  updateCompanyRating(companyId) {
    const companyReviews = this.data.reviews.filter(r => r.companyId === companyId);
    const totalRating = companyReviews.reduce((sum, r) => sum + r.rating, 0);
    const company = this.data.companies.find(c => c.id === companyId);
    if (company) company.rating = totalRating / companyReviews.length || 0;
  }
  
  getServiceAverageRating(serviceId) {
    const service = this.data.services.find(s => s.id === serviceId);
    if (!service?.comments?.length) return 0;
    
    const total = service.comments.reduce(
      (sum, comment) => sum + (comment.rating || 0), 
      0
    );
    return total / service.comments.length;
  }

  // ======================== Moderation Methods ========================
   async getManagerApplications() {
    await simulateDelay();
    return this.data.managerApplications.filter(app => app.status === 'pending');
  }

  async approveManager(applicationId) {
    const application = this.data.managerApplications.find(app => app.id === applicationId);
    if (!application) throw new Error('Application not found');

    // Создаем компанию
    const company = {
      id: generateId('comp'),
      name: application.companyName,
      managerId: application.id,
      approvedAt: new Date().toISOString()
    };

    // Обновляем пользователя
    const manager = {
      ...application,
      isApproved: true,
      companyId: company.id
    };

    this.data.users.push(manager);
    this.data.companies.push(company);
    this.data.managerApplications = this.data.managerApplications.filter(app => app.id !== applicationId);
    
    this.saveToStorage();
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