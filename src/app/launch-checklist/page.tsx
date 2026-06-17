"use client";

const sections = [
  {
    number: "01",
    title: "Finish the App",
    color: "border-orange-400",
    headingColor: "text-orange-600",
    items: [
      {
        task: "Run the Supabase schema SQL",
        detail: "Go to supabase.com → your project → SQL Editor. Paste the entire contents of supabase-schema.sql from your project root and click Run. This creates all 7 tables (profiles, tool_acquisitions, task_completions, lesson_records, referrals, rewards, parent_links) plus Row-Level Security policies.",
        steps: [
          "Create a new project at supabase.com (free tier is fine to start)",
          "Copy project URL and anon key from Settings → API",
          "Paste both into .env.local in your project root",
          "Open SQL Editor, paste supabase-schema.sql, click Run",
          "Verify tables appear under Table Editor",
        ],
      },
      {
        task: "Configure Supabase Auth email settings",
        detail: "By default Supabase sends confirmation emails from a generic address. Customize this so users see your brand.",
        steps: [
          "Supabase Dashboard → Authentication → Email Templates",
          "Update the confirmation email subject and body with your app name",
          "Set Site URL to your Vercel domain once deployed (e.g. itscalledadulting.app)",
          "Set Redirect URL to https://yourdomain.com/auth/callback",
        ],
      },
      {
        task: "Sync localStorage data to Supabase on sign-up",
        detail: "Users who try the app before creating an account have data in localStorage (toolkit, completions, profile). After they sign up, migrate it to the DB so nothing is lost. This is a one-session build task — ask Claude Code to add a migration step to the post-signup flow.",
        steps: [
          "After successful sign-up, read ica_tools_acquired, ica_completions, ica_learning from localStorage",
          "Batch-insert them into tool_acquisitions, task_completions, lesson_records",
          "Clear the localStorage keys after successful sync",
        ],
      },
      {
        task: "Build and test the parent link accept flow",
        detail: "When a parent sends a link request, the kid needs to see a notification and tap Accept. Currently the invite is created in the DB but there is no in-app notification UI for the child.",
        steps: [
          "Add a banner/badge to the homepage when parent_links has a pending row for the logged-in user",
          "Build an Accept / Decline screen at /parent/accept?token=TOKEN",
          "Test the full flow: parent sends invite → kid signs in → kid sees banner → kid accepts → parent dashboard shows kid's data",
        ],
      },
      {
        task: "Test rewards redemption end-to-end",
        detail: "Sign in as a test user, manually set tool_acquisitions to 6+ rows in Supabase, then redeem a Tier 1 reward and verify it appears in /admin/redemptions.",
        steps: [
          "Create a test account at /auth",
          "In Supabase Table Editor, insert 6 rows into tool_acquisitions for that user",
          "Visit /rewards — Tier 1 should show as ready",
          "Complete the redemption form",
          "Visit /admin/redemptions and confirm the row appears",
        ],
      },
    ],
  },
  {
    number: "02",
    title: "Deploy to the Web",
    color: "border-blue-400",
    headingColor: "text-blue-600",
    items: [
      {
        task: "Deploy to Vercel (free)",
        detail: "Vercel is the fastest way to get a live URL. The app is Next.js, so it deploys in about 3 minutes with zero configuration.",
        steps: [
          "Push your code to GitHub if not already there (git push origin main)",
          "Go to vercel.com → New Project → Import from GitHub",
          "Select the its-called-adulting repo",
          "Under Environment Variables, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
          "Click Deploy — Vercel gives you a URL like its-called-adulting.vercel.app",
          "Test the live URL end-to-end before buying a domain",
        ],
      },
      {
        task: "Buy and connect a domain",
        detail: "itscalledadulting.com or itscalledadulting.app (~$12–15/yr). The .app domain is modern and memorable. Buy from Namecheap or Google Domains.",
        steps: [
          "Check availability at namecheap.com",
          "Buy itscalledadulting.app (preferred) or .com",
          "In Vercel → Project → Domains, add your custom domain",
          "Follow Vercel's DNS instructions (add a CNAME record at your registrar)",
          "Update Supabase Site URL and Redirect URL to the new domain",
          "Verify https:// works and email confirmation links resolve correctly",
        ],
      },
      {
        task: "Add the app icon to the PWA manifest",
        detail: "The icon was designed in this session — a navy background with a gold lightbulb/speech bubble/question mark. Wire it into the app so it looks right when users add it to their home screen.",
        steps: [
          "Save the icon image to public/icon-512.png and public/icon-192.png",
          "Update public/manifest.json icons array to reference both sizes",
          "Update src/app/layout.tsx apple-touch-icon to point to /icon-512.png",
          "Test on iPhone: visit the site in Safari → Share → Add to Home Screen",
        ],
      },
    ],
  },
  {
    number: "03",
    title: "Pre-Launch: Build a Waitlist",
    color: "border-purple-400",
    headingColor: "text-purple-600",
    items: [
      {
        task: "Build a marketing landing page",
        detail: "A single page at the root URL (or a separate /welcome page) that sells the app to two audiences: the young adult who needs it and the parent who wants to give it. Ask Claude Code to build this — it knows the full app and can write the copy.",
        steps: [
          "Hero: 'Everything your parents forgot to teach you. All in one place.'",
          "Parent section: 'Is your kid ready for the real world? Now they can be.'",
          "Feature highlights: weekly lessons, 12-tool challenge, rewards",
          "Email capture form (stores to Supabase profiles table with role='waitlist')",
          "Social proof placeholder for early testimonials",
        ],
      },
      {
        task: "Set up a simple email sequence for waitlist signups",
        detail: "When someone joins the waitlist, send them 2–3 emails over a week to keep them warm until launch. Use Resend.com (free tier, integrates with Supabase) or Mailchimp.",
        steps: [
          "Email 1 (immediate): 'You're on the list — here's what's coming'",
          "Email 2 (day 3): Share one HWISTKT tip from the app to show value",
          "Email 3 (launch day): 'It's live — here's your link + referral code'",
        ],
      },
    ],
  },
  {
    number: "04",
    title: "Columbus Launch — Parents",
    color: "border-green-400",
    headingColor: "text-green-600",
    items: [
      {
        task: "Post in Columbus-area Facebook parent groups",
        detail: "This is the highest-ROI move for reaching parents of 17–22 year olds. These groups have tens of thousands of members and parents actively share resources. Claude Code can write the posts and help you submit them if you share your screen.",
        steps: [
          "Join these groups if not already a member: 'Columbus Ohio Moms', 'Dublin Ohio Parents', 'Westerville Parent Network', 'Upper Arlington Community', 'New Albany Ohio Community', 'Hilliard Ohio Parents'",
          "Post angle: 'I built this because my own kid was about to graduate and I realized I'd never taught her how to read a lease, change a tire, or know when to call a plumber. So I made an app.'",
          "Include one screenshot of the toolkit or weekly lesson",
          "Post Tuesday–Thursday, 7–9pm (highest engagement for parent groups)",
          "Respond to every comment personally for the first 48 hours",
        ],
      },
      {
        task: "Post in Columbus high school parent groups",
        detail: "Senior year parents are the exact target — they're anxious about their kids leaving, actively searching for resources. Graduating class Facebook groups are goldmines.",
        steps: [
          "Search Facebook for '[School Name] Class of 2026 Parents'",
          "Target: Upper Arlington, Dublin Coffman, Westerville Central/South, New Albany, Olentangy, Thomas Worthington",
          "Post angle: 'Built this for graduating seniors — everything they'll need to know living on their own'",
          "Offer to give 10 seniors free early access in exchange for feedback",
        ],
      },
      {
        task: "Reach out to Columbus-area college orientation programs",
        detail: "Ohio State, Columbus State, Capital University, and Ohio Wesleyan all run new student orientation. Getting the app into an orientation resource list is worth hundreds of organic installs.",
        steps: [
          "Email the Dean of Students office at each school",
          "Subject: 'Free resource for incoming students — adulting skills app'",
          "Offer free access for all incoming students in exchange for a mention in orientation materials",
          "Follow up once after 1 week if no response",
        ],
      },
      {
        task: "Nextdoor — Columbus neighborhoods",
        detail: "Nextdoor is hyper-local and has strong engagement in Columbus suburbs. Parents share recommendations constantly.",
        steps: [
          "Post in your own neighborhood first",
          "Angle: 'Local dad built this app — would love Columbus families to be the first to try it'",
          "Ask neighbors to reshare to their neighborhoods",
        ],
      },
    ],
  },
  {
    number: "05",
    title: "Columbus Launch — Young Adults",
    color: "border-yellow-400",
    headingColor: "text-yellow-600",
    items: [
      {
        task: "Ohio State and Columbus State Reddit + social",
        detail: "r/OSU and r/Columbus are active communities. A genuine post from the founder with the HWISTKT story performs well.",
        steps: [
          "Post to r/OSU: 'Built an app for people who just moved into their first apartment and have no idea what they're doing'",
          "Post to r/Columbus: same angle, local connection",
          "Do NOT post a download link immediately — share the story first, put the link in comments",
          "Reddit timing: Tuesday–Thursday, 9am–12pm EST",
        ],
      },
      {
        task: "Ohio State student organizations",
        detail: "First-generation student groups, transfer student associations, and student government are actively looking for useful resources to share with members.",
        steps: [
          "Email Ohio State First-Gen Buckeyes organization",
          "Contact OSU Student Government (they have a resources committee)",
          "Offer to present the app at one meeting in exchange for a social post",
        ],
      },
      {
        task: "TikTok / Instagram Reels",
        detail: "Short-form video of a single HWISTKT moment performs extremely well with 18–25 year olds. You don't need to show your face — screen recordings of the app work.",
        steps: [
          "Video 1: 'The order you attach jumper cables matters. Nobody teaches you this.' — show the app's jumper cable guide",
          "Video 2: 'Your lease probably has 3 illegal clauses. Here's how to spot them.' — show the lease checker tool",
          "Video 3: 'I built this app because I panicked when my daughter was about to graduate and I realized I'd never taught her any of this'",
          "Post to both TikTok and Instagram Reels, same video",
          "Use hashtags: #adulting #firstapartment #movingout #collegelife #lifeadvice #lifeskills",
        ],
      },
    ],
  },
  {
    number: "06",
    title: "Referral & Rewards Activation",
    color: "border-red-400",
    headingColor: "text-red-600",
    items: [
      {
        task: "Source your Tier 1 and Tier 2 reward inventory",
        detail: "The rewards system is built. Now source the physical products wholesale so you're ready to fulfill when redemptions come in.",
        steps: [
          "Tier 1 options: Multi-tool (~$12 wholesale), Cordless tire inflator (~$25 wholesale)",
          "Tier 2 options: Ryobi drill kit (~$55 wholesale at Home Depot Pro), Lithium jump pack (~$45 wholesale)",
          "Start small — order 10 of each and reorder as redemptions come in",
          "Consider using Amazon Business account for easy wholesale pricing",
          "Store shipping supplies: bubble mailers, boxes, packing tape",
        ],
      },
      {
        task: "Announce the rewards program publicly",
        detail: "The rewards program is your strongest retention and referral hook. Lead with it in launch posts.",
        steps: [
          "Add rewards info to the landing page hero",
          "Include in every Facebook/Reddit post: 'Complete all 12 tools and earn a free cordless drill'",
          "Post a TikTok specifically about the rewards: 'This app gives you a free drill if you build your toolkit'",
        ],
      },
      {
        task: "Test your first redemption fulfillment",
        detail: "Before you have real users redeeming, do a dry run with yourself so you know the admin workflow.",
        steps: [
          "Sign in as admin, visit /admin/redemptions",
          "Create a test redemption from a second test account",
          "Walk through: mark as Processing → add tracking number → mark as Shipped",
          "Confirm the flow feels manageable at 10 redemptions/week",
        ],
      },
    ],
  },
  {
    number: "07",
    title: "Ongoing: Keep the App Growing",
    color: "border-gray-400",
    headingColor: "text-gray-600",
    items: [
      {
        task: "Review /admin/submissions weekly",
        detail: "Every 'What else didn't you know?' submission is a free content idea. The best ones become new tasks in data.ts — ask Claude Code to add them.",
        steps: [
          "Visit /admin every Monday morning",
          "Pick the 1–2 best submissions to turn into new tasks",
          "Reply to submitters personally — they become your most loyal users",
        ],
      },
      {
        task: "Add a new task to data.ts every 2 weeks",
        detail: "The app compounds in value as content grows. More tasks = more reasons to share. Ask Claude Code: 'Add a task for [topic] with a full HWISTKT write-up and DIY guide.'",
        steps: [],
      },
      {
        task: "Watch for parent link requests in Supabase",
        detail: "Parent linking is a premium retention feature. When parents start using it, ask them for testimonials — 'I finally feel like she's got backup' is a powerful quote for marketing.",
        steps: [
          "Check parent_links table weekly for new connections",
          "Email parents who link: 'Thanks for trusting us with your kid's adulting journey — we'd love your feedback'",
        ],
      },
    ],
  },
];

export default function LaunchChecklistPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 print:py-6 print:px-8">
      {/* Print button — hidden when printing */}
      <div className="print:hidden flex justify-end mb-6">
        <button
          onClick={() => window.print()}
          className="bg-gray-900 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
        >
          🖨 Save as PDF
        </button>
      </div>

      {/* Header */}
      <div className="mb-10 print:mb-8">
        <div className="text-4xl mb-3">💡</div>
        <h1 className="text-3xl font-black text-gray-900 mb-1">It&apos;s Called Adulting</h1>
        <h2 className="text-xl font-bold text-orange-500 mb-3">Launch Checklist</h2>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
          This checklist was generated from your Claude Code build session. Every item below references work already built in the app — this is the path from &ldquo;working locally&rdquo; to &ldquo;live and growing in Columbus.&rdquo;
        </p>
        <div className="mt-4 text-xs text-gray-400">
          Generated June 2026 · its-called-adulting project · /launch-checklist
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.number} className="mb-12 print:mb-10 print:break-inside-avoid">
          {/* Section header */}
          <div className={`flex items-center gap-3 mb-5 pb-3 border-b-2 ${section.color}`}>
            <span className={`text-3xl font-black ${section.headingColor} opacity-30`}>{section.number}</span>
            <h3 className={`text-xl font-black ${section.headingColor}`}>{section.title}</h3>
          </div>

          <div className="space-y-6">
            {section.items.map((item, i) => (
              <div key={i} className="print:break-inside-avoid">
                {/* Checkbox + task title */}
                <div className="flex items-start gap-3 mb-2">
                  <div className="mt-0.5 w-5 h-5 rounded border-2 border-gray-300 shrink-0 print:border-gray-400" />
                  <h4 className="font-bold text-gray-900 text-base leading-tight">{item.task}</h4>
                </div>

                {/* Detail */}
                <p className="text-sm text-gray-500 leading-relaxed ml-8 mb-3">{item.detail}</p>

                {/* Sub-steps */}
                {item.steps.length > 0 && (
                  <div className="ml-8 space-y-1.5">
                    {item.steps.map((step, j) => (
                      <div key={j} className="flex items-start gap-2.5">
                        <div className="mt-1 w-3.5 h-3.5 rounded-sm border border-gray-300 shrink-0 print:border-gray-400" />
                        <span className="text-xs text-gray-600 leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-100 text-center print:mt-8">
        <p className="text-xs text-gray-400 leading-relaxed">
          Built with Claude Code · All features referenced in this checklist exist in the codebase at<br />
          <span className="font-mono">/Users/sheacoleman/Desktop/its-called-adulting</span>
        </p>
        <p className="text-xs text-gray-300 mt-2">
          Questions? Open a new Claude Code session and reference this checklist — it knows the full build.
        </p>
      </div>
    </main>
  );
}
