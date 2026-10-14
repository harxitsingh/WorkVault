const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join('d:', 'freelance', 'workvault');

const files = [
  {
    path: 'src/data/users.js',
    content: `export const users = [
  {
    id: 'usr_1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    role: 'client',
    avatar: null,
    bio: 'Tech entrepreneur looking for top talent to build amazing products.',
    location: 'Bangalore',
    joinedDate: '2023-01-15T10:00:00Z',
    status: 'active',
    phone: '+91 9876543210'
  },
  {
    id: 'usr_2',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    role: 'client',
    avatar: null,
    bio: 'Marketing director at a fast-growing startup.',
    location: 'Mumbai',
    joinedDate: '2023-02-20T11:30:00Z',
    status: 'active',
    phone: '+91 9876543211'
  },
  {
    id: 'usr_3',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@example.com',
    role: 'client',
    avatar: null,
    bio: 'Small business owner expanding digital footprint.',
    location: 'Delhi',
    joinedDate: '2023-03-05T09:15:00Z',
    status: 'active',
    phone: '+91 9876543212'
  },
  {
    id: 'usr_4',
    name: 'Sneha Gupta',
    email: 'sneha.gupta@example.com',
    role: 'client',
    avatar: null,
    bio: 'E-commerce store manager.',
    location: 'Pune',
    joinedDate: '2023-04-10T14:45:00Z',
    status: 'active',
    phone: '+91 9876543213'
  },
  {
    id: 'usr_5',
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    role: 'freelancer',
    avatar: null,
    bio: 'Expert React developer with 5+ years of experience building scalable web applications.',
    skills: ['React', 'Node.js', 'JavaScript', 'Tailwind CSS'],
    location: 'Hyderabad',
    joinedDate: '2022-11-12T08:20:00Z',
    rating: 4.8,
    reviewCount: 24,
    completedProjects: 30,
    status: 'active',
    phone: '+91 9876543214'
  },
  {
    id: 'usr_6',
    name: 'Ananya Reddy',
    email: 'ananya.reddy@example.com',
    role: 'freelancer',
    avatar: null,
    bio: 'Creative UI/UX designer specializing in mobile apps and modern web interfaces.',
    skills: ['Figma', 'UI Design', 'UX Research', 'Adobe XD'],
    location: 'Chennai',
    joinedDate: '2023-01-25T16:10:00Z',
    rating: 4.9,
    reviewCount: 45,
    completedProjects: 52,
    status: 'active',
    phone: '+91 9876543215'
  },
  {
    id: 'usr_7',
    name: 'Karthik Nair',
    email: 'karthik.nair@example.com',
    role: 'freelancer',
    avatar: null,
    bio: 'Full-stack developer with a passion for building robust e-commerce solutions.',
    skills: ['MERN Stack', 'Next.js', 'MongoDB', 'AWS'],
    location: 'Kochi',
    joinedDate: '2023-05-02T12:00:00Z',
    rating: 4.7,
    reviewCount: 18,
    completedProjects: 20,
    status: 'active',
    phone: '+91 9876543216'
  },
  {
    id: 'usr_8',
    name: 'Deepika Joshi',
    email: 'deepika.joshi@example.com',
    role: 'freelancer',
    avatar: null,
    bio: 'Professional content writer creating SEO-optimized blog posts and articles.',
    skills: ['Content Writing', 'SEO', 'Copywriting', 'WordPress'],
    location: 'Ahmedabad',
    joinedDate: '2022-09-18T09:30:00Z',
    rating: 4.6,
    reviewCount: 32,
    completedProjects: 40,
    status: 'active',
    phone: '+91 9876543217'
  },
  {
    id: 'usr_9',
    name: 'Arjun Verma',
    email: 'arjun.verma@example.com',
    role: 'freelancer',
    avatar: null,
    bio: 'Video editor and motion graphics artist crafting engaging visual stories.',
    skills: ['Premiere Pro', 'After Effects', 'Video Editing', 'Motion Graphics'],
    location: 'Mumbai',
    joinedDate: '2023-06-15T10:45:00Z',
    rating: 4.5,
    reviewCount: 15,
    completedProjects: 18,
    status: 'active',
    phone: '+91 9876543218'
  },
  {
    id: 'usr_10',
    name: 'Meera Iyer',
    email: 'meera.iyer@example.com',
    role: 'freelancer',
    avatar: null,
    bio: 'Data analyst helping businesses make data-driven decisions.',
    skills: ['Python', 'SQL', 'Tableau', 'Data Analysis'],
    location: 'Bangalore',
    joinedDate: '2023-07-20T14:20:00Z',
    rating: 5.0,
    reviewCount: 10,
    completedProjects: 12,
    status: 'active',
    phone: '+91 9876543219'
  },
  {
    id: 'usr_11',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@example.com',
    role: 'admin',
    avatar: null,
    bio: 'Platform administrator overseeing operations and resolving disputes.',
    location: 'Delhi',
    joinedDate: '2022-01-10T09:00:00Z',
    status: 'active',
    phone: '+91 9876543220'
  },
  {
    id: 'usr_12',
    name: 'Pooja Deshmukh',
    email: 'pooja.deshmukh@example.com',
    role: 'admin',
    avatar: null,
    bio: 'Community manager and support lead.',
    location: 'Pune',
    joinedDate: '2022-03-15T10:30:00Z',
    status: 'active',
    phone: '+91 9876543221'
  }
];

export default users;
`
  },
  {
    path: 'src/data/services.js',
    content: `export const services = [
  {
    id: 'svc_1',
    title: 'Professional React Web Application Development',
    description: 'I will build a fast, responsive, and scalable React web application tailored to your business needs.',
    longDescription: 'With over 5 years of experience in frontend development, I specialize in building complex, high-performance web applications using React.js. Whether you need a simple dashboard or a full-scale enterprise application, I ensure clean code, optimal performance, and a seamless user experience.',
    freelancerId: 'usr_5',
    freelancerName: 'Vikram Singh',
    freelancerAvatar: null,
    category: 'Web Development',
    price: 35000,
    deliveryTime: '14 days',
    rating: 4.8,
    reviewCount: 15,
    image: null,
    tags: ['React', 'JavaScript', 'Frontend', 'Web App'],
    includes: ['Responsive Design', 'Source Code', 'Deployment Setup', '3 Revisions'],
    requirements: ['Detailed project requirements', 'Design assets (if any)', 'API documentation (if integrating backend)'],
    faq: [
      { question: 'Do you provide backend services?', answer: 'This service is focused on frontend. Backend integration is included if APIs are provided.' }
    ],
    status: 'active',
    createdAt: '2023-02-10T10:00:00Z'
  },
  {
    id: 'svc_2',
    title: 'Modern UI/UX Design for Mobile Apps',
    description: 'Stunning and intuitive user interfaces designed specifically for iOS and Android platforms.',
    longDescription: 'I create user-centric designs that not only look beautiful but also provide an intuitive user journey. My process includes wireframing, prototyping, and high-fidelity mockups using Figma. I focus on modern design trends, accessibility, and smooth user interactions to make your app stand out.',
    freelancerId: 'usr_6',
    freelancerName: 'Ananya Reddy',
    freelancerAvatar: null,
    category: 'UI/UX Design',
    price: 25000,
    deliveryTime: '7 days',
    rating: 4.9,
    reviewCount: 22,
    image: null,
    tags: ['Figma', 'Mobile App', 'UI Design', 'Prototyping'],
    includes: ['Wireframes', 'Interactive Prototype', 'Source Files', 'Design System'],
    requirements: ['App concept/idea', 'Target audience details', 'Brand guidelines (colors, logos)'],
    faq: [
      { question: 'Do you develop the app as well?', answer: 'No, this service is strictly for UI/UX design. I provide the assets for your developers.' }
    ],
    status: 'active',
    createdAt: '2023-03-15T11:30:00Z'
  },
  {
    id: 'svc_3',
    title: 'Full-Stack E-commerce Website Development',
    description: 'Complete e-commerce solution with product management, cart, and payment gateway integration.',
    longDescription: 'Get a fully functional e-commerce store built from scratch using modern web technologies. I handle everything from database design to frontend implementation, ensuring a secure and seamless shopping experience for your customers. Includes Razorpay/Stripe integration.',
    freelancerId: 'usr_7',
    freelancerName: 'Karthik Nair',
    freelancerAvatar: null,
    category: 'Web Development',
    price: 50000,
    deliveryTime: '21 days',
    rating: 4.7,
    reviewCount: 12,
    image: null,
    tags: ['E-commerce', 'MERN Stack', 'Payment Gateway', 'Full-stack'],
    includes: ['Admin Panel', 'Payment Integration', 'Responsive UI', '1 Month Support'],
    requirements: ['Product catalog details', 'Preferred payment gateway', 'Domain & Hosting access'],
    faq: [
      { question: 'Which payment gateways do you support?', answer: 'I typically integrate Razorpay, Stripe, or PayPal based on your preference.' }
    ],
    status: 'active',
    createdAt: '2023-05-20T09:15:00Z'
  },
  {
    id: 'svc_4',
    title: 'SEO-Optimized Content Writing for Blogs',
    description: 'High-quality, engaging, and SEO-friendly articles to drive traffic to your website.',
    longDescription: 'Content is king, and I write words that rank and convert. With expertise in various niches, I provide well-researched, original, and keyword-optimized blog posts. Each article is crafted to engage your readers while satisfying search engine algorithms.',
    freelancerId: 'usr_8',
    freelancerName: 'Deepika Joshi',
    freelancerAvatar: null,
    category: 'Content Writing',
    price: 5000,
    deliveryTime: '3 days',
    rating: 4.6,
    reviewCount: 30,
    image: null,
    tags: ['Blog Post', 'SEO', 'Article Writing', 'Content Strategy'],
    includes: ['Keyword Research', 'Plagiarism Check', 'Grammarly Premium Checked', '2 Revisions'],
    requirements: ['Topic or niche', 'Target keywords (optional)', 'Brand voice guidelines'],
    faq: [
      { question: 'How many words is included?', answer: 'This package includes one article of up to 1000 words.' }
    ],
    status: 'active',
    createdAt: '2023-01-05T14:45:00Z'
  },
  {
    id: 'svc_5',
    title: 'Video Editing & Motion Graphics',
    description: 'Professional video editing and engaging motion graphics for YouTube, ads, and social media.',
    longDescription: 'Bring your footage to life! I offer comprehensive video editing services including color grading, audio mixing, text animations, and dynamic transitions. Whether it is a YouTube vlog, a corporate presentation, or a snappy Instagram Reel, I make your videos visually captivating.',
    freelancerId: 'usr_9',
    freelancerName: 'Arjun Verma',
    freelancerAvatar: null,
    category: 'Video Editing',
    price: 12000,
    deliveryTime: '5 days',
    rating: 4.5,
    reviewCount: 14,
    image: null,
    tags: ['Premiere Pro', 'YouTube', 'Motion Graphics', 'Color Grading'],
    includes: ['Video Editing', 'Color Correction', 'Audio Mixing', 'Motion Titles'],
    requirements: ['Raw footage', 'Script/Storyboard', 'Music preferences'],
    faq: [
      { question: 'Can you source stock footage?', answer: 'Yes, I can include royalty-free stock footage if needed for an additional cost.' }
    ],
    status: 'active',
    createdAt: '2023-06-25T16:20:00Z'
  },
  {
    id: 'svc_6',
    title: 'Data Analytics Dashboard Development',
    description: 'Interactive data dashboards to visualize your business metrics and KPIs clearly.',
    longDescription: 'Transform raw data into actionable insights. I build interactive and visually appealing dashboards using Tableau or PowerBI, connecting to your data sources. Track KPIs, monitor trends, and make informed business decisions with custom analytics solutions.',
    freelancerId: 'usr_10',
    freelancerName: 'Meera Iyer',
    freelancerAvatar: null,
    category: 'Digital Marketing', 
    price: 15000,
    deliveryTime: '7 days',
    rating: 5.0,
    reviewCount: 9,
    image: null,
    tags: ['Data Visualization', 'Tableau', 'Analytics', 'Dashboard'],
    includes: ['Data Cleaning', 'Dashboard Creation', 'Interactive Filters', 'Documentation'],
    requirements: ['Access to data sources', 'List of key metrics (KPIs)', 'Preferred tool (Tableau/PowerBI)'],
    faq: [
      { question: 'Do you clean the data first?', answer: 'Yes, basic data cleaning and structuring is included in the package.' }
    ],
    status: 'active',
    createdAt: '2023-08-10T10:30:00Z'
  },
  {
    id: 'svc_7',
    title: 'Custom Logo & Brand Identity Design',
    description: 'Unique and memorable logo design along with comprehensive brand identity guidelines.',
    longDescription: 'A strong brand starts with a great logo. I design unique, versatile logos that represent your company values. The brand identity package includes typography, color palettes, and stationary design to ensure consistency across all your brand touchpoints.',
    freelancerId: 'usr_6',
    freelancerName: 'Ananya Reddy',
    freelancerAvatar: null,
    category: 'Graphic Design',
    price: 15000,
    deliveryTime: '5 days',
    rating: 4.9,
    reviewCount: 18,
    image: null,
    tags: ['Logo Design', 'Branding', 'Illustrator', 'Identity'],
    includes: ['3 Logo Concepts', 'Source Files', 'Brand Guidelines PDF', 'Social Media Kit'],
    requirements: ['Company name & slogan', 'Information about your business/industry', 'Preferred style or references'],
    faq: [
      { question: 'Do I get the vector files?', answer: 'Yes, final deliverables include AI, EPS, SVG, PNG, and JPG files.' }
    ],
    status: 'active',
    createdAt: '2023-04-12T11:00:00Z'
  },
  {
    id: 'svc_8',
    title: 'Mobile App Development with React Native',
    description: 'Cross-platform mobile application development for iOS and Android using React Native.',
    longDescription: 'Get your app on both App Store and Google Play with a single codebase. I develop robust, high-performance mobile applications using React Native. From API integration to complex state management, I deliver production-ready apps tailored to your requirements.',
    freelancerId: 'usr_5',
    freelancerName: 'Vikram Singh',
    freelancerAvatar: null,
    category: 'Mobile Development',
    price: 35000,
    deliveryTime: '14 days',
    rating: 4.8,
    reviewCount: 8,
    image: null,
    tags: ['React Native', 'iOS', 'Android', 'Mobile App'],
    includes: ['Cross-platform App', 'API Integration', 'UI Implementation', 'Store Submission Assistance'],
    requirements: ['UI Designs (Figma/XD)', 'API endpoints documentation', 'App functional requirements'],
    faq: [
      { question: 'Will the app work on older devices?', answer: 'The app will support iOS 11+ and Android 6.0+.' }
    ],
    status: 'active',
    createdAt: '2023-07-05T09:45:00Z'
  },
  {
    id: 'svc_9',
    title: 'WordPress Website Development & Customization',
    description: 'Custom WordPress website design, development, and theme customization.',
    longDescription: 'Need a professional business website or a personal blog? I build fully responsive, fast-loading, and SEO-friendly WordPress websites. Whether it is customizing an existing theme or building one from scratch using Elementor, I ensure your site looks great and is easy to manage.',
    freelancerId: 'usr_7',
    freelancerName: 'Karthik Nair',
    freelancerAvatar: null,
    category: 'Web Development',
    price: 15000,
    deliveryTime: '7 days',
    rating: 4.6,
    reviewCount: 25,
    image: null,
    tags: ['WordPress', 'Elementor', 'Web Design', 'CMS'],
    includes: ['Theme Installation', 'Plugin Setup', 'Responsive Design', 'Speed Optimization'],
    requirements: ['Domain & Hosting details', 'Content (text & images)', 'Reference websites'],
    faq: [
      { question: 'Can I update the content myself later?', answer: 'Yes, WordPress has an easy-to-use dashboard, and I will guide you on how to make updates.' }
    ],
    status: 'active',
    createdAt: '2023-02-28T14:15:00Z'
  },
  {
    id: 'svc_10',
    title: 'Social Media Marketing Strategy',
    description: 'Comprehensive social media strategy to boost your online presence and engagement.',
    longDescription: 'Grow your audience and increase brand awareness. I create data-driven social media strategies tailored to your target audience. This includes content planning, hashtag research, competitor analysis, and an actionable calendar for platforms like Instagram, LinkedIn, and Twitter.',
    freelancerId: 'usr_8',
    freelancerName: 'Deepika Joshi',
    freelancerAvatar: null,
    category: 'Digital Marketing',
    price: 8000,
    deliveryTime: '5 days',
    rating: 4.7,
    reviewCount: 19,
    image: null,
    tags: ['Social Media', 'Marketing Strategy', 'Content Planning', 'Instagram'],
    includes: ['Platform Audit', '30-Day Content Calendar', 'Hashtag Strategy', 'Action Plan PDF'],
    requirements: ['Links to current social profiles', 'Business goals', 'Details about target audience'],
    faq: [
      { question: 'Do you also create the posts?', answer: 'This service is for the strategy and calendar. Content creation is offered as an extra.' }
    ],
    status: 'active',
    createdAt: '2023-09-12T10:00:00Z'
  },
  {
    id: 'svc_11',
    title: 'Backend API Development with Node.js',
    description: 'Secure, scalable, and well-documented RESTful APIs using Node.js and Express.',
    longDescription: 'I build robust backend systems to power your web or mobile applications. Specializing in Node.js, Express, and MongoDB/PostgreSQL, I ensure secure authentication, efficient database queries, and clear API documentation using Swagger.',
    freelancerId: 'usr_7',
    freelancerName: 'Karthik Nair',
    freelancerAvatar: null,
    category: 'Web Development',
    price: 25000,
    deliveryTime: '10 days',
    rating: 4.8,
    reviewCount: 11,
    image: null,
    tags: ['Node.js', 'API', 'Backend', 'Express'],
    includes: ['REST API Setup', 'Database Integration', 'Authentication (JWT)', 'API Documentation'],
    requirements: ['Data models/schema requirements', 'List of required endpoints', 'Hosting environment details'],
    faq: [
      { question: 'Which database do you recommend?', answer: 'It depends on your data structure, but I frequently work with MongoDB and PostgreSQL.' }
    ],
    status: 'active',
    createdAt: '2023-10-01T09:30:00Z'
  },
  {
    id: 'svc_12',
    title: 'Product Packaging & Label Design',
    description: 'Eye-catching product packaging and label designs that stand out on the shelf.',
    longDescription: 'Make a great first impression with professional packaging design. I create print-ready, high-quality packaging and labels for cosmetics, food products, supplements, and more. Designs are customized to fit your brand identity and comply with standard printing requirements.',
    freelancerId: 'usr_6',
    freelancerName: 'Ananya Reddy',
    freelancerAvatar: null,
    category: 'Graphic Design',
    price: 12000,
    deliveryTime: '5 days',
    rating: 4.9,
    reviewCount: 14,
    image: null,
    tags: ['Packaging', 'Label Design', 'Print Design', 'Illustrator'],
    includes: ['Print-Ready Files', '3D Mockup', 'Source Files', 'Die-line Setup'],
    requirements: ['Exact dimensions', 'All text/copy to include', 'Logo and brand colors'],
    faq: [
      { question: 'Do you provide the physical packaging?', answer: 'No, I provide the digital design files for you to send to your printer.' }
    ],
    status: 'active',
    createdAt: '2023-11-15T14:20:00Z'
  },
  {
    id: 'svc_13',
    title: 'Short Form Video Editing (Reels/TikTok)',
    description: 'Engaging, fast-paced edits for Instagram Reels, TikTok, and YouTube Shorts.',
    longDescription: 'Capture attention in the first 3 seconds! I specialize in editing short-form content with dynamic captions, sound effects, B-roll, and trendy transitions to maximize viewer retention and engagement on social media platforms.',
    freelancerId: 'usr_9',
    freelancerName: 'Arjun Verma',
    freelancerAvatar: null,
    category: 'Video Editing',
    price: 5000,
    deliveryTime: '3 days',
    rating: 4.6,
    reviewCount: 28,
    image: null,
    tags: ['Reels', 'TikTok', 'Shorts', 'Video Editing'],
    includes: ['Editing (up to 3 videos)', 'Subtitles/Captions', 'Sound Design', 'Color Grading'],
    requirements: ['Raw video clips', 'Reference videos/style preference', 'Specific audio if any'],
    faq: [
      { question: 'How long should the raw footage be?', answer: 'Ideally under 5 minutes of total raw footage per short video.' }
    ],
    status: 'active',
    createdAt: '2023-08-22T11:15:00Z'
  },
  {
    id: 'svc_14',
    title: 'Website Copywriting & Landing Pages',
    description: 'Persuasive website copy that converts visitors into customers.',
    longDescription: 'Your website words matter. I write compelling, conversion-focused copy for landing pages, About Us sections, and service descriptions. My writing highlights your unique value proposition, addresses customer pain points, and includes clear calls to action.',
    freelancerId: 'usr_8',
    freelancerName: 'Deepika Joshi',
    freelancerAvatar: null,
    category: 'Content Writing',
    price: 8000,
    deliveryTime: '4 days',
    rating: 4.8,
    reviewCount: 16,
    image: null,
    tags: ['Copywriting', 'Landing Page', 'Sales Copy', 'Web Content'],
    includes: ['Landing Page Copy', 'Competitor Research', 'SEO Meta Tags', '2 Revisions'],
    requirements: ['Target audience details', 'Product/Service details', 'Goal of the page'],
    faq: [
      { question: 'Do you design the page too?', answer: 'No, this service is for the text copy only, delivered in a Word/Google document.' }
    ],
    status: 'active',
    createdAt: '2023-05-18T13:40:00Z'
  },
  {
    id: 'svc_15',
    title: 'Python Scripting & Automation',
    description: 'Custom Python scripts to automate your repetitive tasks and web scraping.',
    longDescription: 'Save hours of manual work with custom automation. I write efficient Python scripts for data extraction, web scraping, file manipulation, and API interactions. Code is clean, well-commented, and optimized for performance.',
    freelancerId: 'usr_10',
    freelancerName: 'Meera Iyer',
    freelancerAvatar: null,
    category: 'Web Development',
    price: 12000,
    deliveryTime: '5 days',
    rating: 5.0,
    reviewCount: 7,
    image: null,
    tags: ['Python', 'Automation', 'Web Scraping', 'Scripting'],
    includes: ['Source Code', 'Setup Instructions', 'Error Handling', '1 Week Support'],
    requirements: ['Clear description of the task', 'Target websites (for scraping)', 'Required output format'],
    faq: [
      { question: 'Will you help me run the script?', answer: 'Yes, I provide a detailed README and can guide you through the setup on your machine.' }
    ],
    status: 'active',
    createdAt: '2023-12-05T09:10:00Z'
  },
  {
    id: 'svc_16',
    title: 'UI/UX Audit & Redesign',
    description: 'Expert review of your existing app/website to improve user experience and interface design.',
    longDescription: 'Is your app suffering from high bounce rates or poor user feedback? I conduct a comprehensive heuristic evaluation of your product, identify usability issues, and provide actionable redesign solutions to enhance the overall user experience and visual appeal.',
    freelancerId: 'usr_6',
    freelancerName: 'Ananya Reddy',
    freelancerAvatar: null,
    category: 'UI/UX Design',
    price: 18000,
    deliveryTime: '7 days',
    rating: 4.8,
    reviewCount: 10,
    image: null,
    tags: ['UX Audit', 'Redesign', 'Usability', 'Figma'],
    includes: ['UX Audit Report', 'Wireframes for improvements', 'High-fidelity redesigns (3 screens)'],
    requirements: ['Link to existing product', 'Analytics data (optional)', 'Specific pain points identified'],
    faq: [
      { question: 'How many screens are redesigned?', answer: 'The base package includes redesigns for 3 key screens/pages.' }
    ],
    status: 'active',
    createdAt: '2024-01-10T15:25:00Z'
  },
  {
    id: 'svc_17',
    title: 'Search Engine Optimization (SEO) Audit',
    description: 'Comprehensive SEO technical and on-page audit to improve your website rankings.',
    longDescription: 'Find out why your website is not ranking higher. I perform a deep-dive SEO audit covering technical aspects, site speed, backlink profile, and on-page elements. You receive a detailed report with a prioritized action plan to improve visibility on Google.',
    freelancerId: 'usr_8',
    freelancerName: 'Deepika Joshi',
    freelancerAvatar: null,
    category: 'Digital Marketing',
    price: 15000,
    deliveryTime: '5 days',
    rating: 4.7,
    reviewCount: 21,
    image: null,
    tags: ['SEO', 'Audit', 'Digital Marketing', 'Ranking'],
    includes: ['Technical SEO Audit', 'Keyword Analysis', 'Competitor Insights', 'Actionable PDF Report'],
    requirements: ['Website URL', 'Google Search Console access (preferred)', 'List of main competitors'],
    faq: [
      { question: 'Will you implement the changes?', answer: 'This is an audit service. Implementation can be discussed as a separate project.' }
    ],
    status: 'active',
    createdAt: '2023-11-20T10:50:00Z'
  },
  {
    id: 'svc_18',
    title: 'Custom Explainer Video Production',
    description: 'Animated 2D explainer videos to clearly communicate your product or service.',
    longDescription: 'Explain your business simply and engagingly. I create custom 2D animated explainer videos from script to final render. Perfect for landing pages, presentations, and social media ads to boost conversion rates and user understanding.',
    freelancerId: 'usr_9',
    freelancerName: 'Arjun Verma',
    freelancerAvatar: null,
    category: 'Video Editing',
    price: 25000,
    deliveryTime: '14 days',
    rating: 4.9,
    reviewCount: 13,
    image: null,
    tags: ['Animation', 'Explainer Video', 'After Effects', '2D'],
    includes: ['Script Writing', 'Voiceover', 'Custom Animation', 'Background Music'],
    requirements: ['Product/Service details', 'Target audience', 'Key message to convey'],
    faq: [
      { question: 'Is voiceover included?', answer: 'Yes, a professional AI voiceover is included. Human voiceover is available as an extra.' }
    ],
    status: 'active',
    createdAt: '2024-02-05T12:30:00Z'
  }
];

export default services;
`
  },
  {
    path: 'src/data/deals.js',
    content: `export const deals = [
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
`
  },
  {
    path: 'src/data/transactions.js',
    content: `export const transactions = [
  {
    id: 'txn_1',
    dealId: 'deal_1',
    clientId: 'usr_1',
    clientName: 'Aarav Sharma',
    freelancerId: 'usr_5',
    freelancerName: 'Vikram Singh',
    amount: 35000,
    platformFee: 3500,
    netAmount: 31500,
    status: 'released',
    type: 'release',
    createdAt: '2023-04-24T09:45:00Z',
    serviceTitle: 'Professional React Web Application Development'
  },
  {
    id: 'txn_2',
    dealId: 'deal_1',
    clientId: 'usr_1',
    clientName: 'Aarav Sharma',
    freelancerId: 'usr_5',
    freelancerName: 'Vikram Singh',
    amount: 35000,
    platformFee: 0,
    netAmount: 35000,
    status: 'held',
    type: 'payment',
    createdAt: '2023-04-10T10:15:00Z',
    serviceTitle: 'Professional React Web Application Development'
  },
  {
    id: 'txn_3',
    dealId: 'deal_5',
    clientId: 'usr_1',
    clientName: 'Aarav Sharma',
    freelancerId: 'usr_9',
    freelancerName: 'Arjun Verma',
    amount: 12000,
    platformFee: 1200,
    netAmount: 10800,
    status: 'released',
    type: 'release',
    createdAt: '2023-08-20T09:10:00Z',
    serviceTitle: 'Video Editing & Motion Graphics'
  },
  {
    id: 'txn_4',
    dealId: 'deal_5',
    clientId: 'usr_1',
    clientName: 'Aarav Sharma',
    freelancerId: 'usr_9',
    freelancerName: 'Arjun Verma',
    amount: 12000,
    platformFee: 0,
    netAmount: 12000,
    status: 'held',
    type: 'payment',
    createdAt: '2023-08-15T14:35:00Z',
    serviceTitle: 'Video Editing & Motion Graphics'
  },
  {
    id: 'txn_5',
    dealId: 'deal_9',
    clientId: 'usr_4',
    clientName: 'Sneha Gupta',
    freelancerId: 'usr_10',
    freelancerName: 'Meera Iyer',
    amount: 15000,
    platformFee: 1500,
    netAmount: 13500,
    status: 'released',
    type: 'release',
    createdAt: '2023-09-22T10:00:00Z',
    serviceTitle: 'Data Analytics Dashboard Development'
  },
  {
    id: 'txn_6',
    dealId: 'deal_10',
    clientId: 'usr_3',
    clientName: 'Rohan Mehta',
    freelancerId: 'usr_7',
    freelancerName: 'Karthik Nair',
    amount: 15000,
    platformFee: 1500,
    netAmount: 13500,
    status: 'released',
    type: 'release',
    createdAt: '2023-06-14T11:20:00Z',
    serviceTitle: 'WordPress Website Development & Customization'
  },
  {
    id: 'txn_7',
    dealId: 'deal_2',
    clientId: 'usr_2',
    clientName: 'Priya Patel',
    freelancerId: 'usr_6',
    freelancerName: 'Ananya Reddy',
    amount: 25000,
    platformFee: 0,
    netAmount: 25000,
    status: 'held',
    type: 'payment',
    createdAt: '2023-10-15T14:20:00Z',
    serviceTitle: 'Modern UI/UX Design for Mobile Apps'
  },
  {
    id: 'txn_8',
    dealId: 'deal_3',
    clientId: 'usr_3',
    clientName: 'Rohan Mehta',
    freelancerId: 'usr_8',
    freelancerName: 'Deepika Joshi',
    amount: 5000,
    platformFee: 0,
    netAmount: 5000,
    status: 'held',
    type: 'payment',
    createdAt: '2023-10-20T09:45:00Z',
    serviceTitle: 'SEO-Optimized Content Writing for Blogs'
  },
  {
    id: 'txn_9',
    dealId: 'deal_4',
    clientId: 'usr_4',
    clientName: 'Sneha Gupta',
    freelancerId: 'usr_7',
    freelancerName: 'Karthik Nair',
    amount: 50000,
    platformFee: 0,
    netAmount: 50000,
    status: 'held',
    type: 'payment',
    createdAt: '2023-09-01T11:30:00Z',
    serviceTitle: 'Full-Stack E-commerce Website Development'
  },
  {
    id: 'txn_10',
    dealId: 'deal_8',
    clientId: 'usr_1',
    clientName: 'Aarav Sharma',
    freelancerId: 'usr_5',
    freelancerName: 'Vikram Singh',
    amount: 35000,
    platformFee: 0,
    netAmount: 35000,
    status: 'held',
    type: 'payment',
    createdAt: '2023-10-18T15:30:00Z',
    serviceTitle: 'Mobile App Development with React Native'
  }
];

export default transactions;
`
  },
  {
    path: 'src/data/disputes.js',
    content: `export const disputes = [
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
`
  }
];

files.forEach(file => {
  const fullPath = path.join(ROOT_DIR, file.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, file.content, 'utf8');
});

console.log('Batch 1 done');
