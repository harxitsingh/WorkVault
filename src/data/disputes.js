export const disputes = [
  {
    id: 'dsp_1',
    dealId: 'deal_4',
    dealTitle: 'Full-Stack E-commerce Website Development',
    clientId: 'usr_4',
    clientName: 'Sneha Gupta',
    freelancerId: 'usr_7',
    freelancerName: 'Karthik Nair',
    amount: 50000,
    reason: 'Incomplete delivery - missing key features',
    description: 'The delivered website is missing the inventory management system that was clearly specified in the requirements. The payment gateway is also throwing errors during checkout.',
    status: 'under_review',
    evidence: [
      { type: 'document', description: 'Original Requirements PDF', date: '2023-09-24T10:15:00Z' },
      { type: 'image', description: 'Screenshot of Checkout Error', date: '2023-09-24T10:16:00Z' }
    ],
    activity: [
      { action: 'opened', by: 'Client', date: '2023-09-24T10:15:00Z', message: 'Dispute opened by client.' },
      { action: 'response', by: 'Freelancer', date: '2023-09-25T09:30:00Z', message: 'I implemented basic inventory management. Full ERP integration was not in scope.' },
      { action: 'review_started', by: 'Admin', date: '2023-09-26T14:00:00Z', message: 'Admin is reviewing the case.' }
    ],
    createdAt: '2023-09-24T10:15:00Z',
    resolvedAt: null,
    resolution: null
  },
  {
    id: 'dsp_2',
    dealId: 'deal_x1',
    dealTitle: 'Custom Logo Design',
    clientId: 'usr_2',
    clientName: 'Priya Patel',
    freelancerId: 'usr_6',
    freelancerName: 'Ananya Reddy',
    amount: 15000,
    reason: 'Quality below expected standards',
    description: 'The provided logo concepts appear to be generic templates and do not reflect my brand guidelines at all.',
    status: 'resolved',
    evidence: [
      { type: 'image', description: 'Delivered Concepts', date: '2023-05-10T11:00:00Z' }
    ],
    activity: [
      { action: 'opened', by: 'Client', date: '2023-05-10T11:00:00Z', message: 'Dispute opened.' },
      { action: 'response', by: 'Freelancer', date: '2023-05-11T10:00:00Z', message: 'I offer 3 revisions which the client refused to use.' },
      { action: 'resolved', by: 'Admin', date: '2023-05-15T15:30:00Z', message: 'Case resolved. Partial refund issued.' }
    ],
    createdAt: '2023-05-10T11:00:00Z',
    resolvedAt: '2023-05-15T15:30:00Z',
    resolution: 'Refunded 50% to client (₹7,500), released 50% to freelancer (₹7,500) for initial effort.'
  },
  {
    id: 'dsp_3',
    dealId: 'deal_x2',
    dealTitle: 'WordPress Blog Setup',
    clientId: 'usr_3',
    clientName: 'Rohan Mehta',
    freelancerId: 'usr_7',
    freelancerName: 'Karthik Nair',
    amount: 10000,
    reason: 'Missed deadline without communication',
    description: 'It has been 5 days past the deadline and the freelancer has not responded to my messages.',
    status: 'refunded',
    evidence: [],
    activity: [
      { action: 'opened', by: 'Client', date: '2023-02-15T09:00:00Z', message: 'Dispute opened due to non-delivery.' },
      { action: 'resolved', by: 'Admin', date: '2023-02-20T10:00:00Z', message: 'Freelancer unresponsive. Full refund issued.' }
    ],
    createdAt: '2023-02-15T09:00:00Z',
    resolvedAt: '2023-02-20T10:00:00Z',
    resolution: 'Full refund to client (₹10,000).'
  },
  {
    id: 'dsp_4',
    dealId: 'deal_x3',
    dealTitle: 'Data Entry Project',
    clientId: 'usr_1',
    clientName: 'Aarav Sharma',
    freelancerId: 'usr_10',
    freelancerName: 'Meera Iyer',
    amount: 8000,
    reason: 'Work delivered does not match requirements',
    description: 'The data scraping script missed several key fields specified in the original requirements document.',
    status: 'open',
    evidence: [
      { type: 'document', description: 'Sample Output CSV', date: '2023-10-24T12:00:00Z' }
    ],
    activity: [
      { action: 'opened', by: 'Client', date: '2023-10-24T12:00:00Z', message: 'Dispute opened.' }
    ],
    createdAt: '2023-10-24T12:00:00Z',
    resolvedAt: null,
    resolution: null
  },
  {
    id: 'dsp_5',
    dealId: 'deal_x4',
    dealTitle: 'Social Media Management',
    clientId: 'usr_4',
    clientName: 'Sneha Gupta',
    freelancerId: 'usr_8',
    freelancerName: 'Deepika Joshi',
    amount: 12000,
    reason: 'Freelancer unresponsive after payment was held',
    description: 'No updates for a week after escrow was funded.',
    status: 'under_review',
    evidence: [],
    activity: [
      { action: 'opened', by: 'Client', date: '2023-10-22T14:30:00Z', message: 'Dispute opened.' },
      { action: 'review_started', by: 'Admin', date: '2023-10-25T11:00:00Z', message: 'Admin attempting to contact freelancer.' }
    ],
    createdAt: '2023-10-22T14:30:00Z',
    resolvedAt: null,
    resolution: null
  },
  {
    id: 'dsp_6',
    dealId: 'deal_x5',
    dealTitle: 'Video Animation',
    clientId: 'usr_3',
    clientName: 'Rohan Mehta',
    freelancerId: 'usr_9',
    freelancerName: 'Arjun Verma',
    amount: 20000,
    reason: 'Client refuses to release payment for completed work',
    description: 'I delivered the video exactly as requested, client asked for 5 free revisions outside scope, now refusing payment.',
    status: 'released',
    evidence: [
      { type: 'document', description: 'Chat Transcripts', date: '2023-08-05T09:00:00Z' }
    ],
    activity: [
      { action: 'opened', by: 'Freelancer', date: '2023-08-05T09:00:00Z', message: 'Dispute opened.' },
      { action: 'response', by: 'Client', date: '2023-08-06T10:00:00Z', message: 'The video is not what I envisioned.' },
      { action: 'resolved', by: 'Admin', date: '2023-08-10T14:00:00Z', message: 'Work matched original requirements. Funds released to freelancer.' }
    ],
    createdAt: '2023-08-05T09:00:00Z',
    resolvedAt: '2023-08-10T14:00:00Z',
    resolution: 'Full payment released to freelancer (₹20,000).'
  }
];

export default disputes;
