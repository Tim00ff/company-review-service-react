// src/mockBackend/initialData.js
export default {
  users: [
    {
      id: 'user_admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      isApproved: true,
      createdAt: '2023-01-01T00:00:00Z'
    },
    {
      id: 'user_1',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
      isApproved: true,
      createdAt: '2023-01-02T00:00:00Z'
    },
    {
      id: 'user_manager_pending',
      email: 'manager1@company.com',
      password: 'manager123',
      role: 'manager',
      isApproved: false,
      createdAt: '2023-01-03T00:00:00Z'
    },
    {
      id: 'user_manager_approved',
      email: 'manager2@company.com',
      password: 'manager123',
      role: 'manager',
      isApproved: true,
      companyId: 'comp_1',
      createdAt: '2023-01-04T00:00:00Z'
    }
  ],
  companies: [
    {
      id: 'comp_1',
      name: 'Tech Solutions Inc.',
      category: 'IT Services',
      description: 'Leading tech service provider',
      rating: 4.8,
      approvedAt: '2023-01-05T00:00:00Z'
    }
  ],
  managerApplications: [
    {
      id: 'mapp_1',
      email: 'pending@manager.com',
      password: 'manager123',
      role: 'manager',
      managerName: 'John Doe',
      companyName: 'Tech Corp',
      status: 'pending',
      appliedAt: '2023-01-01',
      isApproved: false
    }
  ],
  services: [
    {
      id: 'service_1',
      companyId: 'comp_1',
      sections: [
        { title: 'Web Development', content: 'Full-stack development services' },
        { title: 'Technologies', content: 'React, Node.js, PostgreSQL' }
      ],
      images: [
        'https://via.placeholder.com/600x400/FF7F50/FFFFFF?text=Web+Dev',
        'https://via.placeholder.com/600x400/6495ED/FFFFFF?text=Tech+Stack'
      ],
      tags: ['web', 'development', 'react', 'node'],
      stats: {
        views: 150,
        likes: 45,
        shares: 12,
        ratings: { 1: 0, 2: 1, 3: 2, 4: 10, 5: 32 }
      },
      comments: [
        
      ],
      averageRating: 0,
      createdAt: '2023-01-10T00:00:00Z'
    },
    {
      id: 'service_2',
      companyId: 'comp_1',
      sections: [
        { title: 'Mobile Apps', content: 'Cross-platform mobile development' }
      ],
      images: [
        'https://via.placeholder.com/600x400/32CD32/FFFFFF?text=Mobile+Apps'
      ],
      tags: ['mobile', 'flutter', 'react-native'],
      stats: {
        views: 80,
        likes: 25,
        shares: 5,
        ratings: { 1: 1, 2: 0, 3: 3, 4: 15, 5: 10 }
      },
      comments: [],
      averageRating: 4.1,
      createdAt: '2023-01-11T00:00:00Z'
    }
  ],
  applications: [],
  reviews: [],
  ratings: [],
  sessions: []
};