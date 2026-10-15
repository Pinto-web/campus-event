const db = require('./db');

const initialEvents = [
  {
    title: 'AI & Full-Stack Innovation Hackathon 2026',
    description: 'Join campus tech enthusiasts for a 24-hour hackathon building cutting-edge web & AI applications using Gemini API and React. Prizes for best design, innovation, and social impact!',
    category: 'Hackathon',
    department: 'Computer Science',
    date: '2026-09-15',
    time: '09:00 AM - 05:00 PM',
    location: 'Innovation Hub, Building C - Lab 402',
    speaker: 'Dr. Aris Thorne',
    speakerRole: 'AI Research Director & Tech Mentor',
    capacity: 60,
    registeredCount: 42,
    status: 'Published',
    bannerGradient: 'from-blue-600 via-indigo-600 to-purple-700',
    tags: ['AI', 'React', 'Hackathon', 'Coding', 'Prizes'],
    agenda: [
      { time: '09:00 AM', title: 'Check-in & Team Formation' },
      { time: '10:00 AM', title: 'Keynote & Prompting / API Masterclass' },
      { time: '11:00 AM', title: 'Hacking Begins' },
      { time: '01:00 PM', title: 'Networking Lunch' },
      { time: '04:00 PM', title: 'Project Demos & Judging' },
      { time: '04:45 PM', title: 'Award Ceremony' }
    ]
  },
  {
    title: 'Venture Capital & Student Startup Pitch Summit',
    description: 'Learn how to transform your campus project into a funded startup. Featuring guest investor panels, elevator pitch sessions, and feedback from Silicon Valley alumni.',
    category: 'Seminar',
    department: 'Business & Management',
    date: '2026-09-18',
    time: '02:00 PM - 05:30 PM',
    location: 'Grand Business Auditorium, Hall B',
    speaker: 'Elena Rostova',
    speakerRole: 'Managing Partner @ Apex Ventures',
    capacity: 120,
    registeredCount: 88,
    status: 'Published',
    bannerGradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    tags: ['Startup', 'Venture Capital', 'Entrepreneurship', 'Pitching'],
    agenda: [
      { time: '02:00 PM', title: 'Opening Remarks by Dean of Business' },
      { time: '02:30 PM', title: 'Panel: Funding Student Ideas in 2026' },
      { time: '03:45 PM', title: 'Live Pitch Battle (5 Teams)' },
      { time: '05:00 PM', title: 'Investor Meet & Greet' }
    ]
  },
  {
    title: 'Modern UI/UX Design System Masterclass',
    description: 'Hands-on workshop covering CSS layout algorithms, typography systems, dark mode design tokens, micro-interactions, and accessibility standards.',
    category: 'Workshop',
    department: 'Arts & Humanities',
    date: '2026-09-12',
    time: '11:00 AM - 01:30 PM',
    location: 'Digital Media Studio, Design Center',
    speaker: 'Marcus Vance',
    speakerRole: 'Principal Product Designer',
    capacity: 35,
    registeredCount: 35,
    status: 'Sold Out',
    bannerGradient: 'from-rose-600 via-pink-600 to-purple-600',
    tags: ['UI/UX', 'Figma', 'CSS', 'Accessibility', 'Design'],
    agenda: [
      { time: '11:00 AM', title: 'Design Foundations & Contrast Math' },
      { time: '11:45 AM', title: 'Building Fluid Layout Tokens' },
      { time: '12:30 PM', title: 'Interactive Prototype Review' }
    ]
  },
  {
    title: 'Next-Gen Robotics & Autonomous Systems Demo',
    description: 'Live field demonstration of quadrupeds, autonomous drones, and ROS2 navigation pipelines built by student engineering research groups.',
    category: 'Workshop',
    department: 'Engineering',
    date: '2026-09-22',
    time: '10:00 AM - 01:00 PM',
    location: 'Engineering Quadrangle Outdoor Arena',
    speaker: 'Prof. Hiroshi Tanaka',
    speakerRole: 'Head of Robotics Research Lab',
    capacity: 100,
    registeredCount: 54,
    status: 'Published',
    bannerGradient: 'from-amber-500 via-orange-600 to-red-600',
    tags: ['Robotics', 'ROS2', 'Drones', 'Engineering', 'Hardware'],
    agenda: [
      { time: '10:00 AM', title: 'Drone Navigation Flight Show' },
      { time: '11:15 AM', title: 'Quadruped Sensor & Lidar Showcase' },
      { time: '12:30 PM', title: 'Student Lab Tour & Recruitment' }
    ]
  },
  {
    title: 'Annual Campus Cultural Festival & Music Night',
    description: 'Celebrate diversity with international food stalls, acoustic band performances, traditional dance showcases, and interactive art installations.',
    category: 'Cultural',
    department: 'Student Life',
    date: '2026-09-25',
    time: '05:00 PM - 10:00 PM',
    location: 'Central Lawn & Amphitheater',
    speaker: 'Student Life Council',
    speakerRole: 'Event Operations Team',
    capacity: 300,
    registeredCount: 210,
    status: 'Published',
    bannerGradient: 'from-fuchsia-600 via-purple-600 to-indigo-700',
    tags: ['Music', 'Food', 'Culture', 'Dance', 'Festival'],
    agenda: [
      { time: '05:00 PM', title: 'Food Street & Global Booths Open' },
      { time: '06:30 PM', title: 'Acoustic Stage Showcase' },
      { time: '08:00 PM', title: 'Headliner Campus Band Performance' }
    ]
  },
  {
    title: 'Cybersecurity & Ethical Hacking Bootcamp',
    description: 'Learn capture-the-flag (CTF) techniques, vulnerability analysis, web security fundamentals, and network defense strategies.',
    category: 'Workshop',
    department: 'Computer Science',
    date: '2026-09-28',
    time: '01:00 PM - 04:30 PM',
    location: 'Cyber Range Security Lab 204',
    speaker: 'Samantha Chen',
    speakerRole: 'Lead Security Analyst',
    capacity: 40,
    registeredCount: 29,
    status: 'Published',
    bannerGradient: 'from-cyan-600 via-blue-700 to-slate-900',
    tags: ['Cybersecurity', 'CTF', 'Hacking', 'Web Security'],
    agenda: [
      { time: '01:00 PM', title: 'Threat Vectors & OWASP Top 10' },
      { time: '02:15 PM', title: 'Hands-on CTF Challenge Session' },
      { time: '04:00 PM', title: 'Leaderboard & Security Careers Q&A' }
    ]
  },
  {
    title: 'Inter-College Esports Tournament & Gaming Expo',
    description: 'Compete in Valorant and Rocket League tournaments or try latest VR indie games created by campus game development club members.',
    category: 'Sports',
    department: 'Student Life',
    date: '2026-10-02',
    time: '12:00 PM - 07:00 PM',
    location: 'Student Union Game Arena & Lounge',
    speaker: 'Campus Gaming Society',
    speakerRole: 'Tournament Directors',
    capacity: 150,
    registeredCount: 95,
    status: 'Published',
    bannerGradient: 'from-violet-600 via-purple-600 to-pink-600',
    tags: ['Esports', 'Gaming', 'VR', 'Tournament', 'Community'],
    agenda: [
      { time: '12:00 PM', title: 'Tournament Qualifiers' },
      { time: '03:30 PM', title: 'VR Showcase & Arcade Free Play' },
      { time: '05:30 PM', title: 'Grand Finals & Trophy Ceremony' }
    ]
  },
  {
    title: 'Quantum Computing & Clean Energy Research Forum',
    description: 'Keynote lectures on quantum algorithms, solid-state batteries, and sustainable energy grid modeling by visiting faculty.',
    category: 'Seminar',
    department: 'Science',
    date: '2026-10-05',
    time: '10:30 AM - 01:00 PM',
    location: 'Science Lecture Hall A',
    speaker: 'Dr. Robert Oppenheim',
    speakerRole: 'Professor of Applied Physics',
    capacity: 80,
    registeredCount: 38,
    status: 'Published',
    bannerGradient: 'from-teal-600 via-emerald-600 to-blue-700',
    tags: ['Quantum', 'Physics', 'Clean Energy', 'Science', 'Research'],
    agenda: [
      { time: '10:30 AM', title: 'Quantum Qubit Architectures' },
      { time: '11:45 AM', title: 'Energy Transition Models' },
      { time: '12:30 PM', title: 'Panel Q&A' }
    ]
  }
];

async function seedData() {
  console.log('Seeding initial events and sample registrations...');
  await db.seedIfEmpty(initialEvents);

  // Seed sample registrations if empty
  const events = await db.events.find();
  if (events.length > 0) {
    const hackathon = events.find(e => e.title.includes('Hackathon'));
    if (hackathon) {
      const sampleStudents = [
        { name: 'Alex Rivera', email: 'alex.rivera@campus.edu', id: 'STU-8821', dept: 'Computer Science' },
        { name: 'Sophia Lin', email: 'sophia.lin@campus.edu', id: 'STU-9402', dept: 'Computer Science' },
        { name: 'Jordan Patel', email: 'jordan.patel@campus.edu', id: 'STU-7310', dept: 'Engineering' },
        { name: 'Emily Carter', email: 'emily.carter@campus.edu', id: 'STU-5524', dept: 'Business & Management' }
      ];

      for (const s of sampleStudents) {
        try {
          await db.registrations.create({
            eventId: hackathon.id,
            studentName: s.name,
            studentEmail: s.email,
            studentId: s.id,
            department: s.dept
          });
        } catch (e) {
          // Ignore duplicate seeding if exists
        }
      }
    }
  }

  console.log('Seeding complete successfully.');
}

if (require.main === module) {
  seedData();
}

module.exports = { seedData, initialEvents };
