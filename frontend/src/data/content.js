//
//  content.js
//  
//
//  Created by ethan frazier on 4/5/26.
//

export const CATEGORIES = ['All', 'Hunger Drives', 'Shelter', 'Volunteering', 'Donations', 'News'];

export const CATEGORY_DATA = [
  { name: 'Hunger Drives', icon: 'ðŸ½ï¸', count: 3, bg: '#FDECEA', color: '#C0392B' },
  { name: 'Shelter', icon: 'ðŸ ', count: 2, bg: '#FEF9E7', color: '#E67E22' },
  { name: 'Volunteering', icon: 'ðŸ¤', count: 2, bg: '#E8F8F5', color: '#27AE60' },
  { name: 'Donations', icon: 'ðŸ’›', count: 1, bg: '#EBF5FB', color: '#2980B9' },
  { name: 'News', icon: 'ðŸ“¢', count: 1, bg: '#F4ECF7', color: '#8E44AD' },
  { name: 'Resources', icon: 'ðŸ“‹', count: 1, bg: '#FDFEFE', color: '#717D7E' },
];

export const ARTICLES = [
  {
    id: 1,
    emoji: 'ðŸ½ï¸',
    title: 'Winter Hunger Drive 2026: How You Can Help Feed Tacoma Families',
    category: 'Hunger Drives',
    readTime: 5,
    date: 'Apr 1, 2026',
    author: 'Sarah Mitchell',
    authorRole: 'Director of Community Outreach',
    takeaways: [
      'The TRM food bank serves over 500 families every week during winter months.',
      'Non-perishable donations like canned goods, rice, and pasta are most needed.',
      'Drop-off locations are open Monday through Saturday, 8am to 6pm.',
    ],
    content: [
      {
        heading: 'The Need Is Greater Than Ever',
        body: 'This winter, Tacoma Rescue Mission is seeing record demand at our food bank. Rising food costs and housing instability have pushed more families than ever to seek assistance. Our staff and volunteers are working around the clock to ensure no one in our community goes hungry.',
      },
      {
        heading: 'What We Need Most',
        body: 'Our most urgent needs right now are canned proteins such as tuna, chicken, and beans, as well as peanut butter, pasta, rice, and shelf-stable milk. Hygiene items like soap, shampoo, and toothpaste are also critically needed. Monetary donations allow us to purchase exactly what is most needed at any given time.',
      },
      {
        heading: 'How to Donate',
        body: 'You can drop off food items at our main campus at 1315 Commerce St, Tacoma, or at any of our 12 community partner locations across Pierce County. Online monetary donations can be made through our website 24 hours a day. Every dollar donated provides approximately three meals for a neighbor in need.',
      },
      {
        heading: 'Organize a Drive at Your Workplace',
        body: 'One of the most impactful things you can do is organize a food drive at your workplace, school, or faith community. Our team will provide collection bins, promotional materials, and pickup coordination. Groups that collect 500 or more items receive a special recognition at our annual Harvest Dinner.',
      },
    ],
  },
  {
    id: 2,
    emoji: 'ðŸ ',
    title: 'Emergency Cold Weather Shelter: What to Know This Season',
    category: 'Shelter',
    readTime: 4,
    date: 'Mar 30, 2026',
    author: 'James Okafor',
    authorRole: 'Shelter Operations Manager',
    takeaways: [
      'TRM opens emergency cold weather shelter when temperatures drop below 32Â°F.',
      'We have 180 beds available for men, women, and families.',
      'Guests receive a hot meal, clean clothing, and access to case management.',
    ],
    content: [
      {
        heading: 'How Our Shelter Works',
        body: 'When Pierce County declares a cold weather emergency, Tacoma Rescue Mission activates extended shelter hours and capacity. Our shelter at 1315 Commerce St accepts walk-ins starting at 5pm daily. No ID or paperwork is required for emergency shelter â€” we simply ask guests to check in at the front desk.',
      },
      {
        heading: 'What Guests Receive',
        body: 'Every guest who stays in our shelter receives a warm meal upon arrival, access to showers and laundry facilities, clean clothing from our donation center, and a safe place to sleep. Our case managers are available every morning to help guests connect with housing resources, job training, and addiction recovery programs.',
      },
      {
        heading: 'How You Can Help',
        body: 'Volunteers are needed every evening to help serve meals, check in guests, and distribute supplies. We especially need overnight monitors on weekends. If you cannot volunteer in person, donations of new socks, gloves, and hand warmers are always welcome â€” these are among the most requested items by our guests.',
      },
    ],
  },
  {
    id: 3,
    emoji: 'ðŸ¤',
    title: 'Volunteer Orientation: Your First Day at TRM',
    category: 'Volunteering',
    readTime: 6,
    date: 'Mar 25, 2026',
    author: 'Maria Gonzalez',
    authorRole: 'Volunteer Coordinator',
    takeaways: [
      'All new volunteers must complete a one-hour orientation before their first shift.',
      'Volunteer shifts are available 7 days a week in the kitchen, shelter, and donation center.',
      'Groups of 10 or more should schedule in advance through our volunteer portal.',
    ],
    content: [
      {
        heading: 'Welcome to the TRM Family',
        body: "Volunteering at Tacoma Rescue Mission is one of the most meaningful things you can do for your community. Whether you're here for a single afternoon or want to commit to a weekly shift, we have a place for you. Our volunteers contributed over 42,000 hours of service last year â€” the equivalent of 21 full-time employees.",
      },
      {
        heading: 'What to Expect on Your First Day',
        body: 'Arrive 10 minutes early and check in at the volunteer desk near the main entrance. You will receive a brief tour, be introduced to your shift supervisor, and be assigned your station for the day. Most first-time volunteers are placed in the kitchen or the donation sort room, both of which require no prior experience.',
      },
      {
        heading: 'Safety and Guidelines',
        body: 'For the safety of our guests and staff, all volunteers must sign a code of conduct form and wear a volunteer badge at all times on campus. We ask that you do not share personal contact information with guests and that all concerns are directed to your shift supervisor. Our campus is a drug and alcohol-free environment.',
      },
    ],
  },
  {
    id: 4,
    emoji: 'ðŸ’›',
    title: 'Make Your Donation Go Further: Matching Gifts Program',
    category: 'Donations',
    readTime: 3,
    date: 'Mar 20, 2026',
    author: 'Pastor Tom Wheeler',
    authorRole: 'Executive Director',
    takeaways: [
      'Over 400 employers match donations made by their employees to TRM.',
      'A matched gift can double or even triple the impact of your contribution.',
      'Check with your HR department to see if your employer participates.',
    ],
    content: [
      {
        heading: 'What Is a Matching Gift?',
        body: "Many employers offer matching gift programs where they contribute an equal or greater amount to charities their employees support. If your employer matches donations, a $50 gift to TRM could become $100 or more â€” at no additional cost to you. It's one of the easiest ways to multiply your generosity.",
      },
      {
        heading: 'How to Check If You Qualify',
        body: 'Visit your employer\'s HR portal or contact your HR department directly to ask about charitable matching programs. You will typically need to submit a matching gift request form along with your donation receipt from TRM. Our tax ID number is 91-0600748, which you may need to provide on the form.',
      },
    ],
  },
  {
    id: 5,
    emoji: 'ðŸ“¢',
    title: 'TRM Celebrates 112 Years of Service to Tacoma',
    category: 'News',
    readTime: 4,
    date: 'Mar 15, 2026',
    author: 'Communications Team',
    authorRole: 'Tacoma Rescue Mission',
    takeaways: [
      'TRM was founded in 1912 and has served Tacoma for over a century.',
      'Last year TRM provided 320,000 meals and 95,000 nights of shelter.',
      'Our new resource center opens this spring, adding 40 new family shelter beds.',
    ],
    content: [
      {
        heading: 'A Century of Compassion',
        body: 'In 1912, a small group of community members gathered in downtown Tacoma with a simple mission: to feed the hungry and shelter the homeless. Over 112 years later, that mission has grown into one of the Pacific Northwest\'s most comprehensive social service organizations, serving thousands of individuals and families each year.',
      },
      {
        heading: 'By the Numbers: 2025',
        body: 'Last year Tacoma Rescue Mission provided 320,000 meals through our food bank and dining hall, 95,000 nights of emergency shelter, 1,200 individuals connected to permanent housing, and job placement assistance to over 400 program graduates. None of this is possible without the generosity of our community donors and the dedication of our 600-plus volunteers.',
      },
    ],
  },
  {
    id: 6,
    emoji: 'ðŸ“‹',
    title: 'Community Resource Guide: Services Available in Pierce County',
    category: 'Resources',
    readTime: 7,
    date: 'Mar 10, 2026',
    author: 'Case Management Team',
    authorRole: 'TRM Social Services',
    takeaways: [
      'TRM connects guests to housing, healthcare, employment, and addiction recovery services.',
      'Walk-in case management is available weekdays from 9am to 4pm.',
      'All services are free and confidential regardless of housing or immigration status.',
    ],
    content: [
      {
        heading: 'Housing Assistance',
        body: 'Our housing specialists work with guests to identify and apply for emergency and transitional housing programs throughout Pierce County. We partner with the Tacoma Housing Authority, Catholic Community Services, and over 30 other organizations to ensure every guest has a path forward. Average time from shelter entry to stable housing for program participants is 47 days.',
      },
      {
        heading: 'Healthcare and Mental Health',
        body: 'TRM hosts a free medical clinic on-site every Tuesday and Thursday in partnership with MultiCare Health System. Mental health counseling is available by appointment Monday through Friday. We also operate a licensed substance use disorder treatment program with both residential and outpatient tracks.',
      },
      {
        heading: 'Employment and Job Training',
        body: "Our WorkFirst program provides resume writing assistance, interview coaching, and connections to employer partners who are committed to hiring individuals with barriers to employment. Over 70% of WorkFirst graduates are employed within 90 days of completing the program. We also operate TRM's social enterprise businesses â€” a moving company and a cleaning service â€” which provide paid training and employment for program participants.",
      },
    ],
  },
];
