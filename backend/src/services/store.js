import bcrypt from 'bcryptjs';

// Pre-hash password 'password123' for seed users
const defaultHashedPassword = bcrypt.hashSync('password123', 10);

export const store = {
  users: [
    {
      id: 'usr_client_1',
      name: 'Aditya Sharma',
      email: 'client@example.com',
      password: defaultHashedPassword,
      role: 'client',
      avatar: 'https://i.pravatar.cc/150?u=1',
      bio: 'Tech entrepreneur hiring freelance talent.',
      skills: ['Product Management', 'Strategy'],
      rating: 4.9,
      completedProjects: 8,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'usr_freelancer_1',
      name: 'Vikram Singh',
      email: 'freelancer@example.com',
      password: defaultHashedPassword,
      role: 'freelancer',
      avatar: 'https://i.pravatar.cc/150?u=2',
      bio: 'Senior Full-Stack Developer specializing in React, Node, and Mobile Apps.',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
      rating: 4.9,
      completedProjects: 24,
      createdAt: '2024-01-10T10:00:00Z'
    },
    {
      id: 'usr_admin_1',
      name: 'WorkVault Admin',
      email: 'admin@example.com',
      password: defaultHashedPassword,
      role: 'admin',
      avatar: 'https://i.pravatar.cc/150?u=3',
      bio: 'Platform administrator for WorkVault.',
      skills: ['Platform Operations', 'Dispute Resolution'],
      rating: 5.0,
      completedProjects: 0,
      createdAt: '2024-01-01T10:00:00Z'
    }
  ],

  services: [
    {
      id: 'svc_1',
      title: 'Professional React Web Application Development',
      description: 'I will build a fast, responsive, and scalable React web application tailored to your business needs.',
      freelancerId: 'usr_freelancer_1',
      freelancerName: 'Vikram Singh',
      freelancerAvatar: 'https://i.pravatar.cc/150?u=2',
      category: 'Web Development',
      price: 35000,
      deliveryTime: '14 days',
      rating: 4.9,
      reviewCount: 15,
      image: null,
      tags: ['React', 'JavaScript', 'Frontend', 'Web App'],
      includes: ['Responsive Design', 'Source Code', 'Deployment Setup'],
      requirements: ['Detailed project requirements', 'Design assets'],
      status: 'active',
      createdAt: '2024-02-10T10:00:00Z'
    },
    {
      id: 'svc_2',
      title: 'Modern UI/UX Design for Mobile Apps',
      description: 'Stunning and intuitive user interfaces designed specifically for iOS and Android platforms.',
      freelancerId: 'usr_freelancer_1',
      freelancerName: 'Vikram Singh',
      freelancerAvatar: 'https://i.pravatar.cc/150?u=2',
      category: 'UI/UX Design',
      price: 25000,
      deliveryTime: '7 days',
      rating: 4.8,
      reviewCount: 22,
      image: null,
      tags: ['Figma', 'Mobile App', 'UI Design'],
      includes: ['Wireframes', 'Interactive Prototype', 'Source Files'],
      requirements: ['App concept/idea', 'Target audience details'],
      status: 'active',
      createdAt: '2024-03-15T11:30:00Z'
    }
  ],

  deals: [
    {
      id: 'dl_1',
      title: 'React Dashboard Development',
      description: 'Custom React admin dashboard with chart visualizations and export tools.',
      serviceId: 'svc_1',
      clientId: 'usr_client_1',
      clientName: 'Aditya Sharma',
      freelancerId: 'usr_freelancer_1',
      freelancerName: 'Vikram Singh',
      amount: 35000,
      status: 'IN_PROGRESS', // CREATED -> FUNDED -> IN_PROGRESS -> SUBMITTED -> APPROVED -> RELEASED
      deadline: '2026-10-15T00:00:00Z',
      submission: null,
      createdAt: '2026-09-20T10:00:00Z',
      updatedAt: '2026-09-21T10:00:00Z'
    }
  ],

  transactions: [
    {
      id: 'tx_1',
      dealId: 'dl_1',
      clientId: 'usr_client_1',
      freelancerId: 'usr_freelancer_1',
      amount: 35000,
      status: 'HELD', // PENDING -> HELD -> RELEASED / REFUNDED
      createdAt: '2026-09-20T10:30:00Z',
      updatedAt: '2026-09-20T10:30:00Z'
    }
  ],

  disputes: [
    {
      id: 'dsp_1',
      dealId: 'dl_1',
      openedBy: 'usr_client_1',
      openedByName: 'Aditya Sharma',
      reason: 'Delayed delivery without notification',
      description: 'The freelancer has not provided the mid-way demo as promised.',
      status: 'OPEN', // OPEN -> UNDER_REVIEW -> RESOLVED -> CLOSED
      resolution: null,
      resolvedBy: null,
      createdAt: '2026-09-25T14:00:00Z',
      updatedAt: '2026-09-25T14:00:00Z'
    }
  ],

  reviews: [
    {
      id: 'rev_1',
      dealId: 'dl_0_completed',
      reviewerId: 'usr_client_1',
      reviewerName: 'Aditya Sharma',
      revieweeId: 'usr_freelancer_1',
      rating: 5,
      comment: 'Excellent work! Delivered on time and exceeded expectations.',
      createdAt: '2026-08-10T12:00:00Z'
    }
  ]
};
