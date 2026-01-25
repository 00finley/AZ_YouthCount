import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Resource categories with data
const RESOURCES = {
  crisis: {
    title: 'Crisis & Emergency',
    icon: 'emergency',
    color: 'red',
    description: 'If you or someone you know is in crisis, help is available 24/7.',
    resources: [
      {
        name: '988 Suicide & Crisis Lifeline',
        description: 'Free, confidential support for people in distress. Call or text 988.',
        phone: '988',
        note: 'Press 3 or text "Q" for LGBTQ+ affirming support',
        highlight: true,
      },
      {
        name: 'Arizona Crisis Line (Solari)',
        description: '24/7 crisis support from trained specialists. 75% of callers feel better after calling.',
        phone: '1-844-534-HOPE (4673)',
        website: 'https://crisis.solari-inc.org',
      },
      {
        name: 'Teen Lifeline',
        description: 'Peer counseling for teens by teens. Available 3-9 PM daily.',
        phone: '602-248-TEEN (8336)',
        note: 'Outside Maricopa: 800-248-TEEN',
      },
      {
        name: 'Tumbleweed 24-Hour Youth Hotline',
        description: 'Crisis support specifically for youth ages 12-24 experiencing homelessness.',
        phone: '602-841-5799',
      },
      {
        name: 'National Domestic Violence Hotline',
        description: 'Support for those experiencing domestic violence.',
        phone: '1-800-799-7233',
        website: 'https://www.thehotline.org',
      },
    ],
  },
  shelter: {
    title: 'Shelters & Housing',
    icon: 'home',
    color: 'blue',
    description: 'Safe places to stay and programs to help you find stable housing.',
    resources: [
      {
        name: 'Tumbleweed (UMOM)',
        description: "Arizona's only emergency shelter for young adults 18-25. Also serves youth 12-17.",
        phone: '602-841-5799',
        website: 'https://www.umom.org',
        address: 'Phoenix, AZ',
        highlight: true,
      },
      {
        name: 'The Greenhouse (LGBTQ+ Youth)',
        description: 'Specialized housing program supporting LGBTQ+ youth in their progress to self-sufficiency.',
        phone: '602-841-5799',
        website: 'https://www.umom.org',
      },
      {
        name: 'UMOM New Day Centers',
        description: 'Family shelter with comprehensive services including on-site medical care and childcare.',
        phone: '602-275-7852',
        website: 'https://www.umom.org',
      },
      {
        name: 'Central Arizona Shelter Services (CASS)',
        description: "Arizona's largest emergency shelter program for adults experiencing homelessness.",
        phone: '602-256-6945',
        website: 'https://www.cassaz.org',
      },
      {
        name: 'Phoenix Rescue Mission',
        description: 'Emergency shelter, meals, and life-transforming programs.',
        phone: '602-233-3000',
        website: 'https://phoenixrescuemission.org',
      },
      {
        name: '2-1-1 Arizona',
        description: 'Connect to local housing resources and assistance programs.',
        phone: '211',
        website: 'https://211arizona.org',
      },
    ],
  },
  food: {
    title: 'Food Assistance',
    icon: 'restaurant',
    color: 'green',
    description: 'Free food and meals available throughout the Phoenix area.',
    resources: [
      {
        name: "St. Mary's Food Bank",
        description: 'Distributes 45,000 emergency food boxes monthly at no cost. Serves families, elderly, and homeless.',
        phone: '602-242-3663',
        website: 'https://www.stmarysfoodbank.org',
        address: '2831 N. 31st Ave, Phoenix, AZ 85009',
        highlight: true,
      },
      {
        name: 'AZ Food Help',
        description: 'Find food banks, pantries, and meal programs near you.',
        website: 'https://azfoodhelp.org',
      },
      {
        name: 'SNAP Benefits (Food Stamps)',
        description: 'Apply for food assistance benefits through Arizona DES.',
        phone: '1-855-432-7587',
        website: 'https://des.az.gov/snap',
      },
      {
        name: 'WIC Program',
        description: 'Nutrition assistance for pregnant women, new mothers, and children under 5.',
        phone: '1-800-252-5942',
        website: 'https://www.azdhs.gov/prevention/azwic',
      },
    ],
  },
  mental: {
    title: 'Mental Health',
    icon: 'psychology',
    color: 'purple',
    description: 'Support for mental health, substance use, and emotional wellbeing.',
    resources: [
      {
        name: 'Solari Warm Line',
        description: 'Free peer support from people who understand mental health challenges. Non-crisis support.',
        phone: '602-347-1100',
        note: 'Available 11am-10:30pm daily',
        website: 'https://crisis.solari-inc.org',
      },
      {
        name: 'Community Bridges Inc.',
        description: 'Behavioral health and substance use treatment services.',
        phone: '480-831-7566',
        website: 'https://communitybridgesaz.org',
      },
      {
        name: 'EMPACT - Suicide Prevention Center',
        description: 'Mental health services and suicide prevention.',
        phone: '480-784-1500',
        website: 'https://www.lafrontera-empact.org',
      },
      {
        name: 'The Trevor Project (LGBTQ+ Youth)',
        description: 'Crisis intervention and suicide prevention for LGBTQ+ young people.',
        phone: '1-866-488-7386',
        note: 'Text START to 678-678',
        website: 'https://www.thetrevorproject.org',
      },
    ],
  },
  transportation: {
    title: 'Transportation',
    icon: 'directions_bus',
    color: 'cyan',
    description: 'Getting around Phoenix and Maricopa County.',
    resources: [
      {
        name: 'Valley Metro',
        description: 'Bus and light rail service throughout the Phoenix metro area.',
        phone: '602-253-5000',
        website: 'https://www.valleymetro.org',
      },
      {
        name: 'Reduced Fare Program',
        description: 'Discounted transit fares for people with disabilities, seniors 65+, and Medicare cardholders.',
        website: 'https://www.valleymetro.org/reduced-fare',
        note: 'Complete free training to receive a 1-year bus pass',
      },
      {
        name: 'Lyft Community Access',
        description: 'Some nonprofits offer free or discounted Lyft rides for appointments.',
        note: 'Ask your case manager about available programs',
      },
    ],
  },
  employment: {
    title: 'Employment & Training',
    icon: 'work',
    color: 'orange',
    description: 'Job training, employment services, and career development.',
    resources: [
      {
        name: "St. Mary's Food Bank Skills Center",
        description: 'Free job training in culinary arts and life skills. Average starting wage of graduates: $18.10/hr.',
        phone: '602-242-3663',
        website: 'https://www.stmarysfoodbank.org',
        address: '3003 W. Thomas Rd, Phoenix, AZ 85017',
        note: 'Info sessions every Wednesday at 10am',
        highlight: true,
      },
      {
        name: 'Arizona@Work',
        description: 'Free job search assistance, resume help, and career counseling.',
        website: 'https://arizonaatwork.com',
      },
      {
        name: 'Job Corps',
        description: 'Free education and job training for young people ages 16-24.',
        phone: '1-800-733-5627',
        website: 'https://www.jobcorps.gov',
      },
      {
        name: 'Goodwill Career Centers',
        description: 'Job training, placement services, and career development.',
        website: 'https://www.goodwillaz.org',
      },
    ],
  },
  college: {
    title: 'College Students',
    icon: 'school',
    color: 'indigo',
    description: 'Resources specifically for college students facing challenges.',
    resources: [
      {
        name: 'ASU REALYST',
        description: 'Research and advocacy focused on ending youth homelessness. Peer mentoring for students in foster care or experiencing housing instability.',
        website: 'https://publicservice.asu.edu/chcyd',
      },
      {
        name: 'ASU Basic Needs Resources',
        description: 'Food pantry, emergency funds, and support services for ASU students.',
        website: 'https://eoss.asu.edu/resources/basic-needs',
      },
      {
        name: 'Maricopa Community Colleges',
        description: 'Financial aid, emergency assistance, and student support services.',
        website: 'https://www.maricopa.edu',
      },
      {
        name: 'FAFSA (Financial Aid)',
        description: 'Apply for federal student aid including grants and loans.',
        website: 'https://studentaid.gov/h/apply-for-aid/fafsa',
        note: 'Unaccompanied homeless youth may qualify for independent student status',
      },
    ],
  },
  legal: {
    title: 'Legal & Documents',
    icon: 'gavel',
    color: 'slate',
    description: 'Help with IDs, legal issues, and vital documents.',
    resources: [
      {
        name: 'Community Legal Services',
        description: 'Free legal help for low-income individuals with civil matters.',
        phone: '602-258-3434',
        website: 'https://www.clsaz.org',
      },
      {
        name: 'Arizona MVD',
        description: 'Get an Arizona ID or driver license. Fee waivers may be available.',
        website: 'https://azmvdnow.gov',
      },
      {
        name: 'Vital Records (Birth Certificates)',
        description: 'Order birth certificates and other vital records.',
        website: 'https://www.azdhs.gov/vital-records',
      },
      {
        name: 'Social Security Office',
        description: 'Apply for a Social Security card or benefits.',
        phone: '1-800-772-1213',
        website: 'https://www.ssa.gov',
      },
    ],
  },
};

// Color classes for categories
const COLORS = {
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-500', button: 'bg-red-500' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500', button: 'bg-blue-500' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-500', button: 'bg-green-500' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500', button: 'bg-purple-500' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', icon: 'text-cyan-500', button: 'bg-cyan-500' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-500', button: 'bg-orange-500' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'text-indigo-500', button: 'bg-indigo-500' },
  slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: 'text-slate-500', button: 'bg-slate-500' },
};

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState('crisis');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = Object.entries(RESOURCES);
  const currentCategory = RESOURCES[activeCategory];
  const colors = COLORS[currentCategory.color];

  // Filter resources based on search
  const filteredResources = searchQuery.trim()
    ? Object.values(RESOURCES).flatMap(cat =>
        cat.resources.filter(r =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(r => ({ ...r, category: cat.title, color: cat.color }))
      )
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              Resource Guide
            </h1>
            <p className="text-xl text-white/80 max-w-2xl">
              Free resources for young adults (18-24) in the Phoenix/Maricopa County area.
              Help is available - you don't have to face this alone.
            </p>
          </motion.div>

          {/* Emergency Banner */}
          <motion.div
            className="mt-8 bg-red-500/20 border border-red-400/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-red-400 text-2xl">emergency</span>
              <div>
                <div className="font-bold">In Crisis?</div>
                <div className="text-white/80 text-sm">Call or text 988 for immediate support</div>
              </div>
            </div>
            <a
              href="tel:988"
              className="sm:ml-auto bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined">call</span>
              Call 988
            </a>
          </motion.div>

          {/* Search */}
          <div className="mt-8">
            <div className="relative max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all resources..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Results */}
        {filteredResources ? (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Search Results ({filteredResources.length})
            </h2>
            {filteredResources.length === 0 ? (
              <p className="text-gray-500">No resources found matching "{searchQuery}"</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredResources.map((resource, idx) => (
                  <ResourceCard key={idx} resource={resource} colors={COLORS[resource.color]} showCategory />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4 scrollbar-hide">
              {categories.map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                    activeCategory === key
                      ? `${COLORS[cat.color].button} text-white`
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                  {cat.title}
                </button>
              ))}
            </div>

            {/* Current Category */}
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className={`${colors.bg} ${colors.border} border rounded-xl p-6 mb-6`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`material-symbols-outlined text-2xl ${colors.icon}`}>
                    {currentCategory.icon}
                  </span>
                  <h2 className={`text-2xl font-black ${colors.text}`}>
                    {currentCategory.title}
                  </h2>
                </div>
                <p className="text-gray-600">{currentCategory.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {currentCategory.resources.map((resource, idx) => (
                  <ResourceCard key={idx} resource={resource} colors={colors} />
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* Footer Note */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Resources compiled for the Arizona 2026 Youth Count.
            <br />
            Information may change - always call ahead to verify services.
          </p>
          <p className="mt-2">
            Source:{' '}
            <a
              href="https://sites.google.com/asu.edu/youthguide/home"
              target="_blank"
              rel="noopener noreferrer"
              className="text-az-purple hover:underline"
            >
              ASU Youth Resource Guide (Maricopa County)
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Resource Card Component
function ResourceCard({ resource, colors, showCategory }) {
  return (
    <div className={`bg-white rounded-xl border p-4 ${resource.highlight ? 'ring-2 ring-az-purple ring-offset-2' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          {showCategory && (
            <span className={`text-xs font-medium ${colors.text} mb-1 block`}>
              {resource.category}
            </span>
          )}
          <h3 className="font-bold text-gray-900">{resource.name}</h3>
        </div>
        {resource.highlight && (
          <span className="bg-az-purple text-white text-xs px-2 py-0.5 rounded-full">Recommended</span>
        )}
      </div>

      <p className="text-gray-600 text-sm mt-2">{resource.description}</p>

      {resource.note && (
        <p className="text-xs text-gray-500 mt-2 italic">{resource.note}</p>
      )}

      {resource.address && (
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">location_on</span>
          {resource.address}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {resource.phone && (
          <a
            href={`tel:${resource.phone.replace(/[^0-9]/g, '')}`}
            className={`${colors.button} text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 hover:opacity-90 transition-opacity`}
          >
            <span className="material-symbols-outlined text-sm">call</span>
            {resource.phone}
          </a>
        )}
        {resource.website && (
          <a
            href={resource.website}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-gray-200 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            Website
          </a>
        )}
      </div>
    </div>
  );
}
