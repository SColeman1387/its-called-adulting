export interface Tool {
  id: string;
  month: number; // 1–12: which month of the first year this unlocks
  name: string;
  emoji: string;
  tagline: string;          // one punchy line
  whyItMatters: string;     // the HWISTKT moment
  cost: string;             // typical price range
  whereToBuy: string;
  usedFor: string[];        // bullet list of what you'd use it for
  proTip: string;
  tasksItHelpsIn?: string[]; // task IDs this tool is relevant to
}

export const TOOLS: Tool[] = [
  {
    month: 1,
    id: "tire-pressure-gauge",
    name: "Tire Pressure Gauge",
    emoji: "🔵",
    tagline: "The $8 tool you'll use every single month.",
    whyItMatters: "Gas station air pumps don't tell you when to stop — they just pump. Without a gauge you're guessing. Over- or under-inflated tires wear unevenly, reduce gas mileage, and fail in the heat. This takes 30 seconds to use.",
    cost: "$8–$15",
    whereToBuy: "Any auto parts store, Walmart, or Amazon. Get a digital one — analog gauges lose accuracy over time.",
    usedFor: [
      "Monthly tire pressure check on all 4 tires",
      "Before every road trip",
      "After the first cold snap of fall (pressure drops 1 PSI per 10°F)",
      "Any time a tire looks low",
    ],
    proTip: "Keep it in your glove box permanently. Check cold tires (before you've driven), not after — heat expands air and gives a false reading.",
    tasksItHelpsIn: ["tire-pressure"],
  },
  {
    month: 2,
    id: "jumper-cables",
    name: "Jumper Cables",
    emoji: "⚡",
    tagline: "Will bail you out at exactly the worst moment.",
    whyItMatters: "A dead battery always happens at night, in a parking garage, in the cold. Without cables you're completely at the mercy of whoever's nearby — or a $100 tow. With cables you're the person who saves someone else.",
    cost: "$25–$40",
    whereToBuy: "AutoZone, O'Reilly, Walmart. Get at least 12-foot cables — 20-foot is better because not every car can be parked bumper-to-bumper.",
    usedFor: [
      "Starting your own dead battery",
      "Helping someone else whose battery died",
      "Cold weather — batteries lose up to 60% capacity at 0°F",
    ],
    proTip: "The order ALWAYS matters: red to dead (+), red to good (+), black to good (−), black to engine block on dead car. Reverse to remove. See the full guide in the app.",
    tasksItHelpsIn: ["jump-start"],
  },
  {
    month: 3,
    id: "screwdriver-set",
    name: "Screwdriver Set",
    emoji: "🪛",
    tagline: "90% of every screw you ever encounter is one of two types.",
    whyItMatters: "Phillips head (#2) and flathead — those two cover almost everything. Furniture assembly, outlet covers, cabinet hinges, light switch plates, battery compartments, tightening door handles. You will reach for this set weekly.",
    cost: "$12–$25",
    whereToBuy: "Home Depot, Amazon. Get a 6-piece set: #1, #2, #3 Phillips and small, medium, large flathead. A magnetic tip is worth $3 more.",
    usedFor: [
      "Assembling furniture",
      "Tightening door hinges and handles",
      "Replacing outlet and light switch covers",
      "Opening battery compartments",
      "Installing curtain rods and hooks",
    ],
    proTip: "A #2 Phillips is the most used screw size in the world. If you only buy one, buy that. The magnetic tip means you can start screws one-handed.",
    tasksItHelpsIn: ["smoke-detector", "dryer-vent"],
  },
  {
    month: 4,
    id: "tape-measure",
    name: "Tape Measure",
    emoji: "📏",
    tagline: "Before every furniture purchase. Every single time.",
    whyItMatters: "The number one reason people return furniture is that it doesn't fit. Measuring before you buy a couch, a desk, a rug, or a TV stand takes two minutes and saves hours of returning heavy stuff. Also essential for hanging anything straight.",
    cost: "$10–$20",
    whereToBuy: "Home Depot, Walmart, Amazon. Get a 25-foot, 1-inch wide blade — wider blades stay stiff further out so you can measure alone.",
    usedFor: [
      "Checking furniture will fit before buying",
      "Measuring wall space for TVs and shelves",
      "Measuring windows before buying curtains",
      "Checking room dimensions for rugs",
      "Any DIY project",
    ],
    proTip: "The small hook at the end slides slightly — this is intentional. It slides the width of its own thickness so measurements are accurate whether you hook the end or push it against a surface.",
    tasksItHelpsIn: [],
  },
  {
    month: 5,
    id: "hammer",
    name: "Hammer",
    emoji: "🔨",
    tagline: "For picture hooks, furniture assembly, and 'persuading' stuck things.",
    whyItMatters: "Hanging art, assembling furniture, driving a nail for a hanger, tapping a stuck drawer back into track — you reach for a hammer constantly without realizing it. Using a shoe or a wine bottle works exactly once before you regret it.",
    cost: "$15–$25",
    whereToBuy: "Home Depot, Walmart, any hardware store. A 16 oz curved-claw hammer handles everything a first apartment needs.",
    usedFor: [
      "Hanging pictures and mirrors",
      "Driving picture nails and wall anchors",
      "Furniture assembly (tapping dowels)",
      "Removing nails when moving out",
    ],
    proTip: "The claw end removes nails — use it when moving out to pull picture nails cleanly without gouging the wall. Slide a thin piece of cardboard under the hammer head to protect painted surfaces.",
    tasksItHelpsIn: [],
  },
  {
    month: 6,
    id: "adjustable-wrench",
    name: "Adjustable Wrench",
    emoji: "🔧",
    tagline: "Turns off the water before the toilet overflows onto your floor.",
    whyItMatters: "Water supply shutoff valves, leaky faucet connections, showerhead replacement — these all need a wrench. One good adjustable wrench replaces a whole set of fixed wrenches for basic home use.",
    cost: "$15–$30",
    whereToBuy: "Home Depot, Walmart. Get an 8-inch or 10-inch Crescent wrench. Brands that matter: Channellock, Irwin, Craftsman.",
    usedFor: [
      "Turning off water supply valves (toilet, sink)",
      "Replacing showerheads",
      "Tightening supply line connections",
      "Basic plumbing and appliance work",
      "Replacing gas grill fittings",
    ],
    proTip: "Always pull the wrench toward you rather than pushing — if it slips, you'll skin your knuckles pushing but just catch yourself pulling.",
    tasksItHelpsIn: ["fix-running-toilet", "unclog-drain"],
  },
  {
    month: 7,
    id: "pliers",
    name: "Pliers (Needle-Nose + Slip-Joint)",
    emoji: "⚙️",
    tagline: "Grips what fingers can't. Reaches where hands won't fit.",
    whyItMatters: "Needle-nose pliers let you grab small things in tight spaces — the clip inside a drain, the end of a wire, a broken key in a lock. Slip-joint (channel-lock) pliers grip pipes, fixtures, and rounded surfaces that a wrench slides off.",
    cost: "$15–$25 for a pair",
    whereToBuy: "Home Depot, Walmart, Amazon. Get one needle-nose and one 8-inch slip-joint. Channellock brand is worth the extra $5.",
    usedFor: [
      "Pulling hair clogs from drains",
      "Gripping slippery pipes",
      "Bending and shaping wire",
      "Removing broken plugs or keys",
      "Tightening nuts in tight spaces",
    ],
    proTip: "Needle-nose pliers are the best drain-hair-clog tool in existence. Grip and twist — you'll pull out more than you expected and feel disgusted and accomplished at the same time.",
    tasksItHelpsIn: ["unclog-drain"],
  },
  {
    month: 8,
    id: "cordless-drill",
    name: "Cordless Drill/Driver",
    emoji: "🔩",
    tagline: "The single biggest quality-of-life upgrade in any toolkit.",
    whyItMatters: "Assembling furniture by hand takes 2 hours. A drill takes 20 minutes. Mounting a TV, building a shelf, installing a curtain rod — all go from annoying to easy. A drill also doubles as a powered screwdriver for any job with lots of screws.",
    cost: "$60–$120 for a starter kit",
    whereToBuy: "Home Depot, Lowe's. Ryobi and Ridgid are the best value brands. Get a kit that includes a drill, driver, two batteries, and a charger. Avoid cheap no-name brands — the battery dies within a year.",
    usedFor: [
      "Assembling furniture (IKEA, flat-pack anything)",
      "Mounting TVs, shelves, curtain rods",
      "Drilling holes for wall anchors",
      "Driving screws much faster than by hand",
    ],
    proTip: "Use the clutch (the numbered ring near the chuck) — set it low for driving screws (stops when resistance is felt, won't strip), high for drilling. Most people ignore this and strip every screw they drive.",
    tasksItHelpsIn: ["dryer-vent"],
  },
  {
    month: 9,
    id: "socket-set",
    name: "Socket Set (3/8\" Drive)",
    emoji: "🔵",
    tagline: "Lug nuts, oil drain plugs, and anything with a hex head.",
    whyItMatters: "A socket set is what you need when a wrench won't fit or won't get enough torque. Lug nuts on a spare tire, oil drain plugs, furniture bolts, bicycle maintenance — none of these work well with an adjustable wrench. Sockets do.",
    cost: "$30–$60",
    whereToBuy: "Home Depot, AutoZone, Amazon. Get a 3/8-inch drive set with both metric and standard (SAE) sockets. Craftsman, Husky, or Stanley are solid brands. Avoid socket sets under $15 — they crack.",
    usedFor: [
      "Removing and installing lug nuts (spare tire)",
      "Oil drain plug removal",
      "Furniture assembly (hex bolts)",
      "Bicycle and small engine maintenance",
    ],
    proTip: "Most modern cars use metric hardware, most older American cars use SAE (standard). When in doubt, get a set with both. A torque wrench (separate tool) is what you'd use if precision matters.",
    tasksItHelpsIn: ["change-flat"],
  },
  {
    month: 10,
    id: "utility-knife",
    name: "Utility Knife",
    emoji: "🔪",
    tagline: "Moving day essential. Useful every week after.",
    whyItMatters: "Breaking down cardboard boxes alone makes this worth owning. But it also scores drywall, strips insulation from wire, cuts rope and zip ties, opens stuck paint cans, and trims everything that scissors can't handle cleanly.",
    cost: "$8–$15",
    whereToBuy: "Home Depot, Walmart, hardware stores. Get a retractable blade — safety first. Milwaukee and Stanley make excellent ones. Buy a 10-pack of replacement blades.",
    usedFor: [
      "Breaking down moving boxes",
      "Opening packages (cleaner than scissors)",
      "Scoring drywall for cutting",
      "Cutting rope, zip ties, and strapping",
      "Trimming carpet and flooring edges",
    ],
    proTip: "A dull blade is more dangerous than a sharp one — it requires more force and slips more easily. Snap off a section when it dulls. That's why the blade has those score lines.",
    tasksItHelpsIn: [],
  },
  {
    month: 11,
    id: "level",
    name: "Level",
    emoji: "📐",
    tagline: "Hanging anything crooked is more noticeable than you think.",
    whyItMatters: "A shelf that's 2 degrees off looks visually wrong even if you can't explain why. A crooked picture frame annoys you every time you look at it. A 24-inch level makes everything straight in seconds.",
    cost: "$10–$20",
    whereToBuy: "Home Depot, Walmart. A basic 24-inch bubble level works for everything at home. Digital levels are more precise but not necessary.",
    usedFor: [
      "Hanging shelves perfectly level",
      "Mounting TVs straight",
      "Checking that appliances sit level (washer, fridge)",
      "Hanging picture frames",
      "Installing curtain rods evenly",
    ],
    proTip: "Your phone has a built-in level app — it works for quick checks. But a real level is faster and more trusted when you're drilling multiple holes in a line.",
    tasksItHelpsIn: [],
  },
  {
    month: 12,
    id: "stud-finder",
    name: "Stud Finder",
    emoji: "🧲",
    tagline: "Before you ever drill into a wall for anything heavy.",
    whyItMatters: "Drywall can't hold weight on its own — it crumbles. Heavy shelves, TVs, mirrors, and towel bars need to be anchored into studs (the wood framing behind the drywall). Without a stud finder you're guessing, and guessing wrong leaves holes and drops heavy things.",
    cost: "$15–$35",
    whereToBuy: "Home Depot, Walmart, Amazon. The $20 Franklin ProSensor is significantly better than cheap magnetic ones and is a bestseller for good reason.",
    usedFor: [
      "Finding studs before mounting a TV",
      "Locating studs for heavy shelves",
      "Any wall anchor rated for 50+ lbs",
      "Hanging mirrors and large art",
    ],
    proTip: "Studs are typically 16 inches apart (sometimes 24). Once you find one, measure over 16 inches — there's almost always another one there. Mark both sides of the stud and drill in the center.",
    tasksItHelpsIn: [],
  },
];

// ─── Badge tracking ───────────────────────────────────────────────────────────

const FIRST_OPEN_KEY = "ica_first_open";
const ACQUIRED_KEY = "ica_tools_acquired";

export function getFirstOpenDate(): Date {
  if (typeof window === "undefined") return new Date();
  const raw = localStorage.getItem(FIRST_OPEN_KEY);
  if (raw) return new Date(raw);
  const now = new Date().toISOString();
  localStorage.setItem(FIRST_OPEN_KEY, now);
  return new Date(now);
}

export function getAcquiredTools(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(ACQUIRED_KEY) || "[]"); }
  catch { return []; }
}

export function markToolAcquired(toolId: string): void {
  const acquired = getAcquiredTools();
  if (!acquired.includes(toolId)) {
    acquired.push(toolId);
    localStorage.setItem(ACQUIRED_KEY, JSON.stringify(acquired));
  }
}

export function unmarkToolAcquired(toolId: string): void {
  const acquired = getAcquiredTools().filter((id) => id !== toolId);
  localStorage.setItem(ACQUIRED_KEY, JSON.stringify(acquired));
}

// How many full months have passed since the user first opened the app
export function getMonthsElapsed(): number {
  const first = getFirstOpenDate();
  const now = new Date();
  return (now.getFullYear() - first.getFullYear()) * 12 + (now.getMonth() - first.getMonth());
}

// Which tools are unlocked (month ≤ months elapsed + 1, capped at 12)
export function getUnlockedTools(): Tool[] {
  const months = getMonthsElapsed();
  return TOOLS.filter((t) => t.month <= months + 1);
}

// The current month's featured tool
export function getFeaturedTool(): Tool {
  const months = Math.min(getMonthsElapsed(), 11);
  return TOOLS[months];
}

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}
