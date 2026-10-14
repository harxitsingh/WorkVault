export const deals = [
  {
    id: 'deal_1',
    serviceId: 'svc_1',
    serviceTitle: 'Professional React Web Application Development',
    clientId: 'usr_1',
    clientName: 'Aarav Sharma',
    freelancerId: 'usr_5',
    freelancerName: 'Vikram Singh',
    amount: 35000,
    status: 'completed',
    createdAt: '2023-04-10T10:00:00Z',
    deliveryDate: '2023-04-22T15:30:00Z',
    requirements: 'Need a dashboard to manage users and view analytics charts. Must be responsive.',
    deliveryMessage: 'Here is the final delivery including the source code and deployment instructions. Let me know if you need any revisions.',
    deliveryFiles: [
      { name: 'source-code.zip', size: '4.5 MB', type: 'application/zip' },
      { name: 'setup-guide.pdf', size: '1.2 MB', type: 'application/pdf' }
    ],
    timeline: [
      { status: 'pending', date: '2023-04-10T10:00:00Z', description: 'Deal created and pending client payment' },
      { status: 'held', date: '2023-04-10T10:15:00Z', description: 'Payment secured in escrow' },
      { status: 'in_progress', date: '2023-04-10T10:30:00Z', description: 'Freelancer started working' },
      { status: 'submitted', date: '2023-04-22T15:30:00Z', description: 'Freelancer submitted work for review' },
      { status: 'completed', date: '2023-04-24T09:45:00Z', description: 'Client approved delivery. Funds released.' }
    ]
  },
  {
    id: 'deal_2',
    serviceId: 'svc_2',
    serviceTitle: 'Modern UI/UX Design for Mobile Apps',
    clientId: 'usr_2',
    clientName: 'Priya Patel',
    freelancerId: 'usr_6',
    freelancerName: 'Ananya Reddy',
    amount: 25000,
    status: 'in_progress',
    createdAt: '2023-10-15T11:00:00Z',
    deliveryDate: null,
    requirements: 'Design for a fitness tracking app. 5 main screens including Home, Workout, Profile, Analytics, Settings.',
    deliveryMessage: null,
    deliveryFiles: [],
    timeline: [
      { status: 'pending', date: '2023-10-15T11:00:00Z', description: 'Deal created and pending client payment' },
      { status: 'held', date: '2023-10-15T14:20:00Z', description: 'Payment secured in escrow' },
      { status: 'in_progress', date: '2023-10-16T09:00:00Z', description: 'Freelancer started working' }
    ]
  },
  {
    id: 'deal_3',
    serviceId: 'svc_4',
    serviceTitle: 'SEO-Optimized Content Writing for Blogs',
    clientId: 'usr_3',
    clientName: 'Rohan Mehta',
    freelancerId: 'usr_8',
    freelancerName: 'Deepika Joshi',
    amount: 5000,
    status: 'submitted',
    createdAt: '2023-10-20T09:30:00Z',
    deliveryDate: '2023-10-22T16:45:00Z',
    requirements: '1000 word article on "Top 10 Digital Marketing Trends in 2024". Target keyword: digital marketing trends.',
    deliveryMessage: 'Hi Rohan, I have attached the article. I have ensured all keywords are included naturally.',
    deliveryFiles: [
      { name: 'digital-marketing-trends.docx', size: '25 KB', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
    ],
    timeline: [
      { status: 'pending', date: '2023-10-20T09:30:00Z', description: 'Deal created and pending client payment' },
      { status: 'held', date: '2023-10-20T09:45:00Z', description: 'Payment secured in escrow' },
      { status: 'in_progress', date: '2023-10-20T10:00:00Z', description: 'Freelancer started working' },
      { status: 'submitted', date: '2023-10-22T16:45:00Z', description: 'Freelancer submitted work for review' }
    ]
  },
  {
    id: 'deal_4',
    serviceId: 'svc_3',
    serviceTitle: 'Full-Stack E-commerce Website Development',
    clientId: 'usr_4',
    clientName: 'Sneha Gupta',
    freelancerId: 'usr_7',
    freelancerName: 'Karthik Nair',
    amount: 50000,
    status: 'disputed',
    createdAt: '2023-09-01T10:00:00Z',
    deliveryDate: '2023-09-22T14:00:00Z',
    requirements: 'Complete clothing e-commerce store with inventory management.',
    deliveryMessage: 'Here is the deployed link and admin credentials.',
    deliveryFiles: [],
    timeline: [
      { status: 'pending', date: '2023-09-01T10:00:00Z', description: 'Deal created and pending client payment' },
      { status: 'held', date: '2023-09-01T11:30:00Z', description: 'Payment secured in escrow' },
      { status: 'in_progress', date: '2023-09-02T09:00:00Z', description: 'Freelancer started working' },
      { status: 'submitted', date: '2023-09-22T14:00:00Z', description: 'Freelancer submitted work for review' },
      { status: 'disputed', date: '2023-09-24T10:15:00Z', description: 'Client raised a dispute. Admin notified.' }
    ]
  },
  {
    id: 'deal_5',
    serviceId: 'svc_5',
    serviceTitle: 'Video Editing & Motion Graphics',
    clientId: 'usr_1',
    clientName: 'Aarav Sharma',
    freelancerId: 'usr_9',
    freelancerName: 'Arjun Verma',
    amount: 12000,
    status: 'completed',
    createdAt: '2023-08-15T14:20:00Z',
    deliveryDate: '2023-08-19T11:30:00Z',
    requirements: 'Edit 3 minute promo video for new app launch. Include text overlays.',
    deliveryMessage: 'Final render attached in 4K resolution. Hope you like it!',
    deliveryFiles: [
      { name: 'app-promo-final.mp4', size: '250 MB', type: 'video/mp4' }
    ],
    timeline: [
      { status: 'pending', date: '2023-08-15T14:20:00Z', description: 'Deal created and pending client payment' },
      { status: 'held', date: '2023-08-15T14:35:00Z', description: 'Payment secured in escrow' },
      { status: 'in_progress', date: '2023-08-15T15:00:00Z', description: 'Freelancer started working' },
      { status: 'submitted', date: '2023-08-19T11:30:00Z', description: 'Freelancer submitted work for review' },
      { status: 'completed', date: '2023-08-20T09:10:00Z', description: 'Client approved delivery. Funds released.' }
    ]
  },
  {
    id: 'deal_6',
    serviceId: 'svc_10',
    serviceTitle: 'Social Media Marketing Strategy',
    clientId: 'usr_2',
    clientName: 'Priya Patel',
    freelancerId: 'usr_8',
    freelancerName: 'Deepika Joshi',
    amount: 8000,
    status: 'held',
    createdAt: '2023-10-25T09:00:00Z',
    deliveryDate: null,
    requirements: 'Strategy for launching organic skincare brand on Instagram.',
    deliveryMessage: null,
    deliveryFiles: [],
    timeline: [
      { status: 'pending', date: '2023-10-25T09:00:00Z', description: 'Deal created and pending client payment' },
      { status: 'held', date: '2023-10-25T09:15:00Z', description: 'Payment secured in escrow. Awaiting freelancer to accept.' }
    ]
  },
  {
    id: 'deal_7',
    serviceId: 'svc_7',
    serviceTitle: 'Custom Logo & Brand Identity Design',
    clientId: 'usr_3',
    clientName: 'Rohan Mehta',
    freelancerId: 'usr_6',
    freelancerName: 'Ananya Reddy',
    amount: 15000,
    status: 'cancelled',
    createdAt: '2023-07-10T10:30:00Z',
    deliveryDate: null,
    requirements: 'Logo for a new coffee shop.',
    deliveryMessage: null,
    deliveryFiles: [],
    timeline: [
      { status: 'pending', date: '2023-07-10T10:30:00Z', description: 'Deal created and pending client payment' },
      { status: 'cancelled', date: '2023-07-12T09:00:00Z', description: 'Deal cancelled as client did not fund escrow' }
    ]
  },
  {
    id: 'deal_8',
    serviceId: 'svc_8',
    serviceTitle: 'Mobile App Development with React Native',
    clientId: 'usr_1',
    clientName: 'Aarav Sharma',
    freelancerId: 'usr_5',
    freelancerName: 'Vikram Singh',
    amount: 35000,
    status: 'in_progress',
    createdAt: '2023-10-18T14:00:00Z',
    deliveryDate: null,
    requirements: 'Develop the frontend for the delivery app based on provided Figma files.',
    deliveryMessage: null,
    deliveryFiles: [],
    timeline: [
      { status: 'pending', date: '2023-10-18T14:00:00Z', description: 'Deal created and pending client payment' },
      { status: 'held', date: '2023-10-18T15:30:00Z', description: 'Payment secured in escrow' },
      { status: 'in_progress', date: '2023-10-19T09:30:00Z', description: 'Freelancer started working' }
    ]
  },
  {
    id: 'deal_9',
    serviceId: 'svc_6',
    serviceTitle: 'Data Analytics Dashboard Development',
    clientId: 'usr_4',
    clientName: 'Sneha Gupta',
    freelancerId: 'usr_10',
    freelancerName: 'Meera Iyer',
    amount: 15000,
    status: 'completed',
    createdAt: '2023-09-15T11:20:00Z',
    deliveryDate: '2023-09-20T16:15:00Z',
    requirements: 'Tableau dashboard for Q3 sales data analysis.',
    deliveryMessage: 'The dashboard has been published to your Tableau server. Documentation attached.',
    deliveryFiles: [
      { name: 'dashboard-guide.pdf', size: '2.1 MB', type: 'application/pdf' }
    ],
    timeline: [
      { status: 'pending', date: '2023-09-15T11:20:00Z', description: 'Deal created and pending client payment' },
      { status: 'held', date: '2023-09-15T12:00:00Z', description: 'Payment secured in escrow' },
      { status: 'in_progress', date: '2023-09-15T13:30:00Z', description: 'Freelancer started working' },
      { status: 'submitted', date: '2023-09-20T16:15:00Z', description: 'Freelancer submitted work for review' },
      { status: 'completed', date: '2023-09-22T10:00:00Z', description: 'Client approved delivery. Funds released.' }
    ]
  },
  {
    id: 'deal_10',
    serviceId: 'svc_9',
    serviceTitle: 'WordPress Website Development & Customization',
    clientId: 'usr_3',
    clientName: 'Rohan Mehta',
    freelancerId: 'usr_7',
    freelancerName: 'Karthik Nair',
    amount: 15000,
    status: 'completed',
    createdAt: '2023-06-05T09:00:00Z',
    deliveryDate: '2023-06-12T14:30:00Z',
    requirements: 'Portfolio website setup using provided premium theme.',
    deliveryMessage: 'Site is live! Admin credentials are in the attached text file.',
    deliveryFiles: [
      { name: 'credentials.txt', size: '1 KB', type: 'text/plain' }
    ],
    timeline: [
      { status: 'pending', date: '2023-06-05T09:00:00Z', description: 'Deal created and pending client payment' },
      { status: 'held', date: '2023-06-05T10:15:00Z', description: 'Payment secured in escrow' },
      { status: 'in_progress', date: '2023-06-06T09:00:00Z', description: 'Freelancer started working' },
      { status: 'submitted', date: '2023-06-12T14:30:00Z', description: 'Freelancer submitted work for review' },
      { status: 'completed', date: '2023-06-14T11:20:00Z', description: 'Client approved delivery. Funds released.' }
    ]
  },
  {
    id: 'deal_11',
    serviceId: 'svc_12',
    serviceTitle: 'Product Packaging & Label Design',
    clientId: 'usr_2',
    clientName: 'Priya Patel',
    freelancerId: 'usr_6',
    freelancerName: 'Ananya Reddy',
    amount: 12000,
    status: 'in_progress',
    createdAt: '2023-10-22T15:45:00Z',
    deliveryDate: null,
    requirements: 'Box design for organic tea product.',
    deliveryMessage: null,
    deliveryFiles: [],
    timeline: [
      { status: 'pending', date: '2023-10-22T15:45:00Z', description: 'Deal created and pending client payment' },
      { status: 'held', date: '2023-10-22T16:00:00Z', description: 'Payment secured in escrow' },
      { status: 'in_progress', date: '2023-10-23T10:00:00Z', description: 'Freelancer started working' }
    ]
  },
  {
    id: 'deal_12',
    serviceId: 'svc_13',
    serviceTitle: 'Short Form Video Editing (Reels/TikTok)',
    clientId: 'usr_4',
    clientName: 'Sneha Gupta',
    freelancerId: 'usr_9',
    freelancerName: 'Arjun Verma',
    amount: 5000,
    status: 'pending',
    createdAt: '2023-10-26T08:30:00Z',
    deliveryDate: null,
    requirements: 'Edit 3 short videos for our fashion boutique Instagram.',
    deliveryMessage: null,
    deliveryFiles: [],
    timeline: [
      { status: 'pending', date: '2023-10-26T08:30:00Z', description: 'Deal created and pending client payment' }
    ]
  }
];

export default deals;
