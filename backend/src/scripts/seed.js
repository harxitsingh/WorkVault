import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import { Deal } from '../models/Deal.js';
import { Transaction } from '../models/Transaction.js';
import { Dispute } from '../models/Dispute.js';
import { Review } from '../models/Review.js';
import { Milestone } from '../models/Milestone.js';
import { Notification } from '../models/Notification.js';

export const seedDatabase = async () => {
  try {
    console.log(`Connecting to MongoDB at: ${config.mongoUri}...`);
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB. Clearing existing collections...');

    // Clear existing collections safely
    await Promise.all([
      User.deleteMany({}),
      Service.deleteMany({}),
      Deal.deleteMany({}),
      Transaction.deleteMany({}),
      Dispute.deleteMany({}),
      Review.deleteMany({}),
      Milestone.deleteMany({}),
      Notification.deleteMany({})
    ]);

    const hashedPassword = bcrypt.hashSync('password123', 10);

    console.log('Seeding Users (1 Admin, 3 Clients, 5 Freelancers)...');

    // 1. Admin
    const admin = await User.create({
      name: 'Rajesh Sharma (Admin)',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'Head of Trust, Safety & Operations at WorkVault India.',
      skills: ['Platform Operations', 'Dispute Resolution', 'Risk Assessment', 'Escrow Management'],
      rating: 5.0,
      completedProjects: 0
    });

    // 2. Clients
    const client1 = await User.create({
      name: 'Aditya Sharma',
      email: 'client@example.com',
      password: hashedPassword,
      role: 'client',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'SaaS founder & Angel investor building fintech solutions in Bengaluru.',
      skills: ['Product Strategy', 'Fintech', 'Agile Leadership'],
      rating: 4.9,
      completedProjects: 12
    });

    const client2 = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@client.com',
      password: hashedPassword,
      role: 'client',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'D2C eCommerce brand owner looking for stellar branding & web development.',
      skills: ['Brand Marketing', 'E-commerce', 'Operations'],
      rating: 4.8,
      completedProjects: 6
    });

    const client3 = await User.create({
      name: 'Rohit Verma',
      email: 'rohit.verma@client.com',
      password: hashedPassword,
      role: 'client',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'Digital health startup COO hiring experienced mobile & backend devs.',
      skills: ['HealthTech', 'Operations', 'Vendor Management'],
      rating: 5.0,
      completedProjects: 4
    });

    // 3. Freelancers
    const fl1 = await User.create({
      name: 'Vikram Singh',
      email: 'freelancer@example.com',
      password: hashedPassword,
      role: 'freelancer',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'Senior Full-Stack Engineer with 7+ years expertise in MERN, Next.js, and Cloud Architecture.',
      skills: ['React', 'Node.js', 'Next.js', 'MongoDB', 'AWS', 'TypeScript'],
      rating: 4.9,
      completedProjects: 38
    });

    const fl2 = await User.create({
      name: 'Ananya Reddy',
      email: 'ananya.reddy@freelancer.com',
      password: hashedPassword,
      role: 'freelancer',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'Award-winning UI/UX Designer specialized in mobile interfaces and design systems.',
      skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Mobile Wireframing', 'Prototyping'],
      rating: 4.9,
      completedProjects: 29
    });

    const fl3 = await User.create({
      name: 'Karthik Nair',
      email: 'karthik.nair@freelancer.com',
      password: hashedPassword,
      role: 'freelancer',
      profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'Cross-platform Mobile Specialist developing high-performance React Native & Flutter apps.',
      skills: ['React Native', 'Flutter', 'iOS & Android', 'Firebase', 'Redux'],
      rating: 4.8,
      completedProjects: 22
    });

    const fl4 = await User.create({
      name: 'Sneha Gupta',
      email: 'sneha.gupta@freelancer.com',
      password: hashedPassword,
      role: 'freelancer',
      profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'Performance Marketer & SEO Consultant generating millions in organic pipeline.',
      skills: ['Technical SEO', 'Google Ads', 'Content Strategy', 'Analytics', 'Conversion Rate Optimization'],
      rating: 4.9,
      completedProjects: 31
    });

    const fl5 = await User.create({
      name: 'Arjun Mehta',
      email: 'arjun.mehta@freelancer.com',
      password: hashedPassword,
      role: 'freelancer',
      profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'Brand Identity Designer & Motion Graphics artist crafting memorable visual identities.',
      skills: ['Brand Identity', 'Adobe Illustrator', 'Logo Design', 'After Effects', 'Video Editing'],
      rating: 4.7,
      completedProjects: 19
    });

    console.log('Seeding 18+ realistic services with high-quality accessible images...');

    const servicesData = [
      // 1. Web Development - Vikram Singh
      {
        title: 'Full-Stack MERN Web Application Development',
        description: 'Complete web application built with React, Node.js, Express, and MongoDB. Includes responsive UI, clean API architecture, authentication, and database indexing.',
        category: 'Web Development',
        price: 35000,
        deliveryDays: 14,
        deliveryTime: '14 days',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
        freelancer: fl1._id,
        rating: 4.9,
        reviewsCount: 16,
        reviewCount: 16,
        isActive: true,
        tags: ['React', 'Node.js', 'Express', 'MongoDB', 'MERN'],
        includes: ['Responsive Design', 'REST API', 'Auth System', 'Source Code', 'Deployment']
      },
      {
        title: 'High-Performance Next.js & TypeScript Website',
        description: 'Production-ready Next.js 14 SSR/SSG website with Tailwind CSS, SEO optimization, and lightning-fast Lighthouse scores.',
        category: 'Web Development',
        price: 42000,
        deliveryDays: 10,
        deliveryTime: '10 days',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        freelancer: fl1._id,
        rating: 4.8,
        reviewsCount: 11,
        reviewCount: 11,
        isActive: true,
        tags: ['Next.js', 'TypeScript', 'Tailwind', 'SSR', 'SEO'],
        includes: ['Server Components', 'Mobile First', 'SEO Meta Tags', 'Speed Optimization']
      },
      {
        title: 'Custom REST & GraphQL API Architecture',
        description: 'Scalable backend API development with Node.js, automated testing, rate-limiting, and comprehensive Swagger documentation.',
        category: 'Web Development',
        price: 28000,
        deliveryDays: 7,
        deliveryTime: '7 days',
        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
        freelancer: fl1._id,
        rating: 5.0,
        reviewsCount: 8,
        reviewCount: 8,
        isActive: true,
        tags: ['Node.js', 'API', 'GraphQL', 'Express', 'JWT'],
        includes: ['Clean Architecture', 'API Docs', 'Unit Tests', 'Docker Setup']
      },

      // 2. UI/UX Design - Ananya Reddy
      {
        title: 'Modern Mobile App UI/UX Design (iOS & Android)',
        description: 'User-centric, pixel-perfect mobile interface design in Figma. Includes research, wireframing, component libraries, and interactive prototypes.',
        category: 'UI/UX Design',
        price: 25000,
        deliveryDays: 7,
        deliveryTime: '7 days',
        image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
        freelancer: fl2._id,
        rating: 4.9,
        reviewsCount: 22,
        reviewCount: 22,
        isActive: true,
        tags: ['Figma', 'Mobile UI', 'UX Design', 'Prototyping'],
        includes: ['Wireframes', 'Interactive Prototype', 'Component Library', 'Dev Handoff']
      },
      {
        title: 'SaaS Dashboard UI/UX & Design System',
        description: 'Comprehensive web application and admin dashboard design with responsive layouts, dark mode, charts, and reusable Figma design tokens.',
        category: 'UI/UX Design',
        price: 32000,
        deliveryDays: 12,
        deliveryTime: '12 days',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
        freelancer: fl2._id,
        rating: 5.0,
        reviewsCount: 14,
        reviewCount: 14,
        isActive: true,
        tags: ['Dashboard', 'SaaS', 'Figma', 'Design System'],
        includes: ['Dark & Light Modes', 'Data Tables', 'Chart Visuals', 'Full Asset Export']
      },
      {
        title: 'Landing Page UX Audit & Redesign for Conversions',
        description: 'Deep UX evaluation of your current conversion funnels followed by a high-converting, visually breathtaking landing page revamp.',
        category: 'UI/UX Design',
        price: 18000,
        deliveryDays: 5,
        deliveryTime: '5 days',
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
        freelancer: fl2._id,
        rating: 4.8,
        reviewsCount: 9,
        reviewCount: 9,
        isActive: true,
        tags: ['CRO', 'Landing Page', 'UX Audit', 'Figma'],
        includes: ['Heuristic Evaluation', 'High-Fidelity Mockup', 'A/B Test Suggestions']
      },

      // 3. Mobile App Development - Karthik Nair
      {
        title: 'Cross-Platform React Native Mobile App',
        description: 'Native-feel iOS and Android mobile app built with React Native. Includes push notifications, offline storage, API integration, and app store readiness.',
        category: 'Mobile App Development',
        price: 45000,
        deliveryDays: 20,
        deliveryTime: '20 days',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
        freelancer: fl3._id,
        rating: 4.9,
        reviewsCount: 19,
        reviewCount: 19,
        isActive: true,
        tags: ['React Native', 'Mobile App', 'iOS', 'Android', 'Redux'],
        includes: ['iOS & Android Builds', 'Store Submission Help', 'API Wiring', 'Source Code']
      },
      {
        title: 'Flutter eCommerce & Delivery Mobile Application',
        description: 'Complete shopping and catalog app built with Flutter. Seamless cart, razorpay checkout, live order tracking, and beautiful animations.',
        category: 'Mobile App Development',
        price: 52000,
        deliveryDays: 25,
        deliveryTime: '25 days',
        image: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=800&q=80',
        freelancer: fl3._id,
        rating: 4.7,
        reviewsCount: 12,
        reviewCount: 12,
        isActive: true,
        tags: ['Flutter', 'Dart', 'E-commerce', 'Payment Gateway'],
        includes: ['State Management', 'Payment Integration', 'Admin Panel API', 'Testing']
      },
      {
        title: 'Mobile App Bug Fixing & Performance Tuning',
        description: 'Audit and resolve memory leaks, slow app startup, crash bugs, and update deprecated dependencies across React Native or Flutter.',
        category: 'Mobile App Development',
        price: 15000,
        deliveryDays: 3,
        deliveryTime: '3 days',
        image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80',
        freelancer: fl3._id,
        rating: 4.8,
        reviewsCount: 7,
        reviewCount: 7,
        isActive: true,
        tags: ['Bug Fix', 'Optimization', 'Performance', 'Troubleshooting'],
        includes: ['Performance Profiling', 'Crash Analytics Fix', 'Bundle Size Reduction']
      },

      // 4. Digital Marketing & SEO - Sneha Gupta
      {
        title: 'Comprehensive Technical SEO & Organic Growth Strategy',
        description: 'Complete audit and execution of on-page, off-page, and technical SEO to bring your website to Google Page 1.',
        category: 'SEO',
        price: 22000,
        deliveryDays: 14,
        deliveryTime: '14 days',
        image: 'https://images.unsplash.com/photo-1571721795195-a2ca2d3370a9?auto=format&fit=crop&w=800&q=80',
        freelancer: fl4._id,
        rating: 4.9,
        reviewsCount: 25,
        reviewCount: 25,
        isActive: true,
        tags: ['SEO', 'Google Ranking', 'Technical SEO', 'Keyword Research'],
        includes: ['Keyword Mapping', 'Meta Tag Optimization', 'Speed Audit', 'Monthly Report']
      },
      {
        title: 'Google & Meta Ads High-ROI Performance Campaign',
        description: 'Setup and optimization of Google Search, Display, and Meta (Facebook/Instagram) ad funnels focused on low CPA and high ROAS.',
        category: 'Digital Marketing',
        price: 26000,
        deliveryDays: 10,
        deliveryTime: '10 days',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        freelancer: fl4._id,
        rating: 4.8,
        reviewsCount: 18,
        reviewCount: 18,
        isActive: true,
        tags: ['PPC', 'Google Ads', 'Meta Ads', 'Lead Generation'],
        includes: ['Audience Targeting', 'Ad Copywriting', 'Conversion Pixel Setup', 'A/B Testing']
      },
      {
        title: 'Social Media Growth Management & Content Calendar',
        description: '30-day comprehensive organic social media strategy for LinkedIn and Instagram with tailored graphics and community engagement.',
        category: 'Digital Marketing',
        price: 20000,
        deliveryDays: 30,
        deliveryTime: '30 days',
        image: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&w=800&q=80',
        freelancer: fl4._id,
        rating: 5.0,
        reviewsCount: 13,
        reviewCount: 13,
        isActive: true,
        tags: ['Social Media', 'LinkedIn', 'Instagram', 'Content Calendar'],
        includes: ['20 Custom Posts', 'Hashtag Strategy', 'Engagement Routine', 'Analytics']
      },

      // 5. Graphic Design & Logo - Arjun Mehta
      {
        title: 'Premium Brand Identity & Minimalist Logo Design',
        description: 'Timeless logo creation and complete brand guidelines manual: color palettes, typography rules, business cards, and social media kits.',
        category: 'Logo Design',
        price: 18000,
        deliveryDays: 6,
        deliveryTime: '6 days',
        image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
        freelancer: fl5._id,
        rating: 4.9,
        reviewsCount: 28,
        reviewCount: 28,
        isActive: true,
        tags: ['Logo Design', 'Branding', 'Vector', 'Typography'],
        includes: ['3 Initial Concepts', 'Vector Files (AI, SVG, EPS)', 'Brand Book', 'Social Kit']
      },
      {
        title: 'Custom Vector Illustrations & Digital Assets',
        description: 'Unique custom illustrations for web banners, mobile apps, editorial publications, and SaaS onboarding tours.',
        category: 'Graphic Design',
        price: 14000,
        deliveryDays: 5,
        deliveryTime: '5 days',
        image: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&w=800&q=80',
        freelancer: fl5._id,
        rating: 4.8,
        reviewsCount: 15,
        reviewCount: 15,
        isActive: true,
        tags: ['Illustration', 'Vector Art', 'Graphic Design', 'Adobe Illustrator'],
        includes: ['High-Res PNG/SVG', 'Commercial Rights', 'Infinite Scalability']
      },
      {
        title: 'Professional Corporate Video Editing & Motion Graphics',
        description: 'Dynamic video post-production for YouTube, ads, and product demos. Includes sound design, color grading, subtitles, and animated lower-thirds.',
        category: 'Video Editing',
        price: 24000,
        deliveryDays: 7,
        deliveryTime: '7 days',
        image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
        freelancer: fl5._id,
        rating: 4.7,
        reviewsCount: 11,
        reviewCount: 11,
        isActive: true,
        tags: ['Video Editing', 'Premiere Pro', 'After Effects', 'Color Grading'],
        includes: ['4K Render', 'Audio Mixing', 'Motion Graphics', 'Subtitle Sync']
      },

      // 6. Additional diverse services
      {
        title: 'Technical Content Writing & SEO Blog Posts',
        description: 'Well-researched, high-authority technical articles and blogs on software engineering, cloud computing, and AI tools.',
        category: 'Content Writing',
        price: 12000,
        deliveryDays: 4,
        deliveryTime: '4 days',
        image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
        freelancer: fl4._id,
        rating: 4.9,
        reviewsCount: 20,
        reviewCount: 20,
        isActive: true,
        tags: ['Content Writing', 'Technical Writing', 'Blogging', 'SEO Copywriting'],
        includes: ['3 In-Depth Articles', 'Keyword Integration', 'Plagiarism Check', 'Infographics']
      },
      {
        title: 'High-Converting Sales Copywriting & Email Sequences',
        description: 'Persuasive landing page copy, cold outreach emails, and drip campaigns engineered to drive clicks and conversions.',
        category: 'Content Writing',
        price: 16000,
        deliveryDays: 5,
        deliveryTime: '5 days',
        image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=800&q=80',
        freelancer: fl4._id,
        rating: 4.8,
        reviewsCount: 14,
        reviewCount: 14,
        isActive: true,
        tags: ['Copywriting', 'Email Sequences', 'Sales Copy', 'Conversion'],
        includes: ['5-Part Drip Sequence', 'Subject Line A/B Testing', 'Call to Action Strategy']
      },
      {
        title: 'Cinematic Product Commercial & Explainer Video Production',
        description: 'Turn your product features into a visually stunning, narrative-driven 60-second video demo with 3D product renders.',
        category: 'Video Editing',
        price: 38000,
        deliveryDays: 14,
        deliveryTime: '14 days',
        image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80',
        freelancer: fl5._id,
        rating: 5.0,
        reviewsCount: 8,
        reviewCount: 8,
        isActive: true,
        tags: ['Explainer Video', 'Product Demo', '3D Motion', 'Commercial'],
        includes: ['Scriptwriting', 'Voiceover Synchronization', 'Full 4K Master', 'Social Cuts']
      }
    ];

    const seededServices = await Service.insertMany(servicesData);
    console.log(`Seeded ${seededServices.length} realistic services.`);

    // 4. Seed Deals
    console.log('Seeding Deals...');
    const deal1 = await Deal.create({
      title: 'React Admin Dashboard with Charts',
      description: 'Building custom SaaS dashboard with dark mode and role-based permissions.',
      service: seededServices[0]._id,
      client: client1._id,
      freelancer: fl1._id,
      amount: 35000,
      requirements: 'Need live MongoDB charts and CSV export capabilities.',
      status: 'IN_PROGRESS',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    const deal2 = await Deal.create({
      title: 'Mobile App Wireframes and High-Fidelity Prototype',
      description: 'Full Figma UX design for healthcare mobile app.',
      service: seededServices[3]._id,
      client: client3._id,
      freelancer: fl2._id,
      amount: 25000,
      requirements: 'Must comply with medical appointment booking flow.',
      status: 'APPROVED',
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      submission: {
        message: 'All Figma artboards and interactive link ready.',
        files: ['healthcare_app_figma_v2.fig'],
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    });

    const deal3 = await Deal.create({
      title: 'D2C eCommerce Brand Identity & Logo Kit',
      description: 'Logo mark, packaging guidelines, and typography.',
      service: seededServices[12]._id,
      client: client2._id,
      freelancer: fl5._id,
      amount: 18000,
      requirements: 'Earthy modern organic palette.',
      status: 'DISPUTED',
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    });

    const deal4 = await Deal.create({
      title: 'Technical SEO Optimization for SaaS Website',
      description: 'Full schema markup, site speed audit, and sitemap fixes.',
      service: seededServices[9]._id,
      client: client1._id,
      freelancer: fl4._id,
      amount: 22000,
      requirements: 'Fix indexing issues in Google Search Console.',
      status: 'RELEASED',
      deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
    });

    // 4.5. Seed Milestones
    console.log('Seeding Milestones...');
    const m1_1 = await Milestone.create({
      deal: deal1._id,
      title: 'Database Schema & Architecture',
      description: 'MongoDB schemas, indexes, and initial REST routes setup.',
      amount: 15000,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      order: 1,
      status: 'RELEASED',
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      releasedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    const m1_2 = await Milestone.create({
      deal: deal1._id,
      title: 'React Dashboard UI & Live Charts',
      description: 'Frontend components with responsive charts and role switcher.',
      amount: 20000,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      order: 2,
      status: 'FUNDED',
      stripePaymentIntentId: 'pi_test_m1_2_seed'
    });

    const m2_1 = await Milestone.create({
      deal: deal2._id,
      title: 'Wireframes & Interactive Prototype',
      description: 'Healthcare booking appointment flow in Figma.',
      amount: 25000,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      order: 1,
      status: 'SUBMITTED',
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      submission: {
        message: 'All Figma artboards and interactive link ready.',
        files: [{ fileName: 'healthcare_app_figma_v2.fig', fileUrl: '/uploads/sample_spec.pdf', size: 1048576, mimeType: 'application/pdf' }],
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'SUBMITTED'
      }
    });

    const m3_1 = await Milestone.create({
      deal: deal3._id,
      title: 'Brand Identity, Packaging Guidelines & Logo Mark',
      description: 'Complete brand book with packaging dieline mockups.',
      amount: 18000,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      order: 1,
      status: 'DISPUTED'
    });

    const m4_1 = await Milestone.create({
      deal: deal4._id,
      title: 'Technical Audit & Schema Fixes',
      description: 'Fixed all broken meta tags and sitemap structure.',
      amount: 22000,
      dueDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      order: 1,
      status: 'RELEASED',
      submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      releasedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
    });

    // 5. Seed Transactions
    console.log('Seeding Transactions...');
    const tx1 = await Transaction.create({
      deal: deal1._id,
      milestone: m1_2._id,
      client: client1._id,
      freelancer: fl1._id,
      user: client1._id,
      amount: 20000,
      type: 'PAYMENT_FUNDED',
      status: 'HELD',
      referenceId: 'PAY_ESCROW_902184',
      description: 'Escrow funded for React Dashboard UI & Live Charts'
    });

    const tx2 = await Transaction.create({
      deal: deal2._id,
      milestone: m2_1._id,
      client: client3._id,
      freelancer: fl2._id,
      user: client3._id,
      amount: 25000,
      type: 'PAYMENT_FUNDED',
      status: 'HELD',
      referenceId: 'PAY_ESCROW_710924',
      description: 'Escrow funded for Wireframes & Interactive Prototype'
    });

    const tx3 = await Transaction.create({
      deal: deal3._id,
      milestone: m3_1._id,
      client: client2._id,
      freelancer: fl5._id,
      user: client2._id,
      amount: 18000,
      type: 'PAYMENT_FUNDED',
      status: 'HELD',
      referenceId: 'PAY_ESCROW_338910',
      description: 'Escrow held under dispute for Brand Identity'
    });

    const tx4 = await Transaction.create({
      deal: deal4._id,
      milestone: m4_1._id,
      client: client1._id,
      freelancer: fl4._id,
      user: fl4._id,
      amount: 19800,
      fee: 2200,
      type: 'PAYMENT_RELEASED',
      status: 'RELEASED',
      referenceId: 'PAY_REL_110928',
      description: 'Funds released for Technical Audit & Schema Fixes'
    });

    // 6. Seed Dispute
    console.log('Seeding Dispute...');
    const dispute1 = await Dispute.create({
      deal: deal3._id,
      milestone: m3_1._id,
      raisedBy: client2._id,
      againstUser: fl5._id,
      reason: 'Freelancer missed agreed revision milestone without notice',
      description: 'The packaging cut mockups were due 3 days ago. The freelancer has not responded to messages.',
      status: 'OPEN',
      evidence: [
        {
          url: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&w=600&q=80',
          fileName: 'chat_history_export.png',
          mimeType: 'image/png',
          note: 'Screenshot of unanswered messages from client'
        }
      ]
    });
    m3_1.dispute = dispute1._id;
    await m3_1.save();

    // 7. Seed Reviews
    console.log('Seeding Reviews...');
    const rev1 = await Review.create({
      service: seededServices[9]._id,
      deal: deal4._id,
      client: client1._id,
      freelancer: fl4._id,
      rating: 5,
      comment: 'Sneha delivered beyond expectations! Our organic impressions jumped 45% in 2 weeks.'
    });

    const rev2 = await Review.create({
      service: seededServices[0]._id,
      client: client2._id,
      freelancer: fl1._id,
      rating: 5,
      comment: 'Vikram is an exceptional engineer. Clean code, great communication, and fast turnaround.'
    });

    console.log('\n==========================================');
    console.log('🎉 WorkVault Database Seed Complete!');
    console.log(`- 1 Admin: ${admin.email}`);
    console.log(`- 3 Clients: ${client1.email}, ${client2.email}, ${client3.email}`);
    console.log(`- 5 Freelancers: ${fl1.email}, ${fl2.email}, ${fl3.email}, ${fl4.email}, ${fl5.email}`);
    console.log(`- ${seededServices.length} Services created with working Unsplash images`);
    console.log(`- 4 Deals created (IN_PROGRESS, APPROVED, DISPUTED, RELEASED)`);
    console.log(`- 4 Transactions created`);
    console.log(`- 1 Dispute created (ID: ${dispute1._id})`);
    console.log(`- 2 Reviews created`);
    console.log('All passwords: password123');
    console.log('==========================================\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// If run directly via node src/scripts/seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => {
      console.log('Database seeding finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal seed failure:', err);
      process.exit(1);
    });
}
