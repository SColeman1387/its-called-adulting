export type RiskLevel = "critical" | "major" | "minor" | "info";

export interface InspectionQuestion {
  id: string;
  group: string;
  question: string;
  why: string; // "How was I supposed to know that?" explanation
  badAnswer: "yes" | "no"; // which answer is the red flag
  risk: RiskLevel;
  estimatedCost?: string; // repair cost if this is a problem
  dealBreaker?: boolean;
}

export interface InspectionGroup {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const INSPECTION_GROUPS: InspectionGroup[] = [
  { id: "paperwork", label: "Before You Even Look", icon: "📄", description: "Do this before you leave the house" },
  { id: "exterior", label: "Walk Around Outside", icon: "👀", description: "What the body is hiding" },
  { id: "under-hood", label: "Under the Hood", icon: "🔧", description: "The engine tells the truth" },
  { id: "tires-brakes", label: "Tires & Brakes", icon: "🛞", description: "Safety first — these are expensive" },
  { id: "interior", label: "Inside the Car", icon: "💺", description: "Check every single thing" },
  { id: "test-drive", label: "Test Drive", icon: "🚗", description: "Listen and feel everything" },
  { id: "deal", label: "The Deal", icon: "💰", description: "Don't leave money on the table" },
];

export const INSPECTION_QUESTIONS: InspectionQuestion[] = [
  // PAPERWORK
  {
    id: "vin-report",
    group: "paperwork",
    question: "Did you run the VIN on Carfax or AutoCheck?",
    why: "The VIN (Vehicle Identification Number) is on the dash, visible through the windshield. A free or cheap report shows accidents, flood damage, title problems, how many owners it's had, and if the odometer was rolled back. Dealers don't advertise any of this.",
    badAnswer: "no",
    risk: "critical",
    dealBreaker: true,
  },
  {
    id: "salvage-title",
    group: "paperwork",
    question: "Does the title show 'Salvage', 'Rebuilt', or 'Flood'?",
    why: "A salvage title means the insurance company declared the car a total loss — it was so damaged they paid out instead of fixing it. Even rebuilt salvage cars often have hidden structural damage, misaligned frames, or electrical gremlins. Many lenders won't finance them and resale value tanks.",
    badAnswer: "yes",
    risk: "critical",
    dealBreaker: true,
    estimatedCost: "Resale value drops 20–40%. Hidden repairs can be $5,000+.",
  },
  {
    id: "seller-matches-title",
    group: "paperwork",
    question: "Does the name on the title match the seller's ID?",
    why: "If the person selling the car isn't on the title, you could be buying a stolen car, or someone flipping it without having paid for it themselves. Never hand over money until you confirm the seller owns the car legally.",
    badAnswer: "no",
    risk: "critical",
    dealBreaker: true,
  },
  {
    id: "too-cheap",
    group: "paperwork",
    question: "Is the price significantly below Kelley Blue Book value?",
    why: "Check kbb.com before you go. If a car is $2,000+ below what it should sell for, there's almost always a reason the seller isn't telling you. Price 10–15% below KBB is a deal. Price 25%+ below is a red flag.",
    badAnswer: "yes",
    risk: "major",
  },

  // EXTERIOR
  {
    id: "paint-mismatch",
    group: "exterior",
    question: "Do any panels have slightly different paint color or texture?",
    why: "Walk around the car in daylight and look at the paint at an angle. Even small color differences between panels mean that panel was repainted — usually after an accident. Repainting is fine for minor damage, but panels that were repainted after structural damage are a serious issue.",
    badAnswer: "yes",
    risk: "major",
    estimatedCost: "If minor: cosmetic only. If structural: $2,000–$10,000+.",
  },
  {
    id: "uneven-gaps",
    group: "exterior",
    question: "Are the gaps between doors, hood, and trunk uneven or inconsistent?",
    why: "Cars are assembled at the factory with precise, consistent gaps between panels. If the gap on the left door is twice as wide as the right door, something moved — usually a collision that bent the frame. Frame damage is the most expensive thing a car can have.",
    badAnswer: "yes",
    risk: "critical",
    estimatedCost: "Frame straightening: $600–$2,500+. May not be fixable.",
    dealBreaker: true,
  },
  {
    id: "rust",
    group: "exterior",
    question: "Is there rust on the rocker panels, wheel wells, or undercarriage?",
    why: "Get down and look under the car. Surface rust (orange flaking on flat surfaces) is cosmetic. But rust on the frame rails, floor pans, or rocker panels (the metal sill under the doors) is structural — it literally weakens the car's skeleton. In Ohio's salted winters, this is common.",
    badAnswer: "yes",
    risk: "major",
    estimatedCost: "Surface rust: $500–$1,500. Structural rust: $2,000–$5,000+. Severe: car is totaled.",
  },
  {
    id: "oil-on-ground",
    group: "exterior",
    question: "Is there an oil stain or wet spot under where the car is parked?",
    why: "Park the car, wait 5 minutes, then look at the ground underneath. A fresh oil stain means an active leak. A dark stain in the dirt below is an older leak that's been there a while. Either way, this tells you the engine isn't sealed properly — and it may just be getting started.",
    badAnswer: "yes",
    risk: "major",
    estimatedCost: "Minor seal leak: $150–$500. Gasket failure: $500–$2,000+.",
  },
  {
    id: "dents-damage",
    group: "exterior",
    question: "Are there significant dents, creases, or damage the seller didn't mention?",
    why: "Small door dings are normal on used cars. But if there's a crease in a panel, damage near a wheel, or anything the seller glossed over — ask directly what happened. How they answer tells you a lot about what else they might be hiding.",
    badAnswer: "yes",
    risk: "minor",
    estimatedCost: "Paintless dent repair: $75–$300 per dent. Body shop work: $300–$1,500 per panel.",
  },

  // UNDER HOOD
  {
    id: "milky-oil",
    group: "under-hood",
    question: "Does the oil on the dipstick look milky, frothy, or light brown?",
    why: "Pull the dipstick (yellow or orange ring, labeled OIL). Wipe it clean, reinsert, pull again. Normal oil is dark brown or amber. If it looks like a chocolate milkshake — creamy, light-colored, frothy — water or coolant is mixing with the oil. This almost always means a blown head gasket, which is one of the most expensive engine repairs there is.",
    badAnswer: "yes",
    risk: "critical",
    estimatedCost: "Head gasket replacement: $1,500–$3,000. Sometimes more than the car is worth.",
    dealBreaker: true,
  },
  {
    id: "low-oil",
    group: "under-hood",
    question: "Is the oil level below the MIN mark on the dipstick?",
    why: "A car that runs low on oil either burns oil (old/worn engine), leaks oil, or the owner never checks it. Any of those is a bad sign. It tells you how the previous owner treated the car — and they didn't treat it well.",
    badAnswer: "yes",
    risk: "major",
    estimatedCost: "Depends on cause. Burning oil: engine replacement $3,000–$8,000. Leak: $150–$2,000.",
  },
  {
    id: "coolant-low-or-rusty",
    group: "under-hood",
    question: "Is the coolant reservoir low, empty, or filled with rusty/brown fluid?",
    why: "Coolant should be bright green, orange, or pink (depending on type) and between the MIN and MAX lines on the reservoir. Brown or rusty coolant means it hasn't been changed in years — the system is corroding from the inside. Low coolant means there's a leak somewhere.",
    badAnswer: "yes",
    risk: "major",
    estimatedCost: "Coolant flush: $100–$150. Leak repair: $200–$1,000+. Head gasket: $1,500+.",
  },
  {
    id: "battery-corrosion",
    group: "under-hood",
    question: "Is there heavy white or blue powder/buildup on the battery terminals?",
    why: "A little corrosion on battery terminals is normal. Heavy buildup means the battery is leaking acid gas, usually because it's old or failing. It can also corrode the cable connections and cause electrical gremlins. Batteries are cheap; corroded cables are annoying to fix.",
    badAnswer: "yes",
    risk: "minor",
    estimatedCost: "New battery: $100–$200. Cable cleaning: free with a wire brush.",
  },
  {
    id: "check-engine-light",
    group: "under-hood",
    question: "Is the check engine light on when you start the car?",
    why: "The check engine light covers hundreds of possible issues, from a loose gas cap (trivial) to a failing catalytic converter ($1,000+) to engine misfires. NEVER buy a car with the check engine light on without getting the codes read first. Any AutoZone will read the codes for free.",
    badAnswer: "yes",
    risk: "major",
    estimatedCost: "Unknown until codes are read. Range: $20 (gas cap) to $5,000+ (emissions system).",
  },
  {
    id: "smoke-from-exhaust",
    group: "under-hood",
    question: "Does the exhaust produce blue, white, or black smoke on startup?",
    why: "A tiny puff of white vapor on a cold morning is normal condensation — it disappears in 30 seconds. But smoke that continues is a problem. Blue smoke = burning oil (worn piston rings or valve seals). White smoke = coolant in the engine (head gasket). Black smoke = running too rich, often a fuel injector or sensor issue.",
    badAnswer: "yes",
    risk: "critical",
    estimatedCost: "Blue smoke: $1,000–$4,000. White smoke: $1,500–$3,500. Black: $200–$800.",
    dealBreaker: true,
  },

  // TIRES & BRAKES
  {
    id: "uneven-tire-wear",
    group: "tires-brakes",
    question: "Do the tires show uneven wear — bald in the middle, on edges, or more worn on one side?",
    why: "Run your hand across each tire. Even wear across the whole tread is normal. Wear only in the middle = overinflated for years. Wear on both edges = chronically underinflated. Wear on just one edge = alignment problem, which means money spent OR a bent suspension component. Feathered/scalloped wear = bad shocks or struts.",
    badAnswer: "yes",
    risk: "major",
    estimatedCost: "Alignment: $75–$150. New tires: $400–$900 for a full set. Suspension: $300–$1,500.",
  },
  {
    id: "brake-dust-uneven",
    group: "tires-brakes",
    question: "Does one wheel have significantly more brake dust than the others?",
    why: "Look through the spokes of each wheel at the brake rotor and caliper. A caliper that's seized will drag on the rotor constantly, creating tons of dust on that one wheel. It also kills gas mileage and can warp the rotor. It's visible from the outside with no tools.",
    badAnswer: "yes",
    risk: "major",
    estimatedCost: "Seized caliper + rotor replacement: $300–$700 per corner.",
  },
  {
    id: "brake-pedal-pulsing",
    group: "tires-brakes",
    question: "Does the brake pedal pulse or vibrate when you press it?",
    why: "A pulsing or vibrating brake pedal when stopping means warped rotors. Rotors warp when they get hot and cool unevenly — common if someone rode the brakes hard, towed with the wrong setup, or let brake pads wear to metal. It's a safety issue and makes stopping longer.",
    badAnswer: "yes",
    risk: "major",
    estimatedCost: "Rotor resurfacing: $150–$250. New rotors + pads: $300–$700 per axle.",
  },
  {
    id: "low-tread",
    group: "tires-brakes",
    question: "Do the tires have low tread depth? (Penny test: if you can see all of Lincoln's head, they're too worn)",
    why: "Stick a penny in the tread groove with Lincoln's head facing down. If you can see the top of his head, the tires are below 2/32\" — legally bald in most states and dangerous in rain. Tires are a 'first maintenance' cost a seller rarely fixes before listing.",
    badAnswer: "yes",
    risk: "major",
    estimatedCost: "New tires: $100–$200 each. Full set: $400–$900 installed.",
  },

  // INTERIOR
  {
    id: "all-lights-work",
    group: "interior",
    question: "Do any dashboard warning lights stay on after startup? (other than seatbelt)",
    why: "When you first turn the key, all warning lights flash briefly — that's normal, the car is doing a self-check. After a few seconds they should all go off. Any that stay on (oil, battery, TPMS, ABS, airbag) mean that system has a problem or the sensor was disabled by a shady seller.",
    badAnswer: "yes",
    risk: "major",
    estimatedCost: "Varies by light. Airbag light is most serious — airbags may not deploy. $300–$1,500+.",
  },
  {
    id: "airbag-light",
    group: "interior",
    question: "Is the airbag / SRS warning light on?",
    why: "If the airbag light is on, the airbags may not deploy in a crash. This is a serious safety issue. It could mean deployed airbags were replaced without resetting the module, a sensor failure, or missing components. Some sellers gut the airbags after a crash and stuff the holes with foam.",
    badAnswer: "yes",
    risk: "critical",
    estimatedCost: "SRS module reset: $300–$500. Airbag replacement: $1,000–$3,000+.",
    dealBreaker: true,
  },
  {
    id: "water-in-car",
    group: "interior",
    question: "Do you smell mildew or see water stains on the carpet, headliner, or trunk?",
    why: "Roll up the windows, get in, and take a big sniff. Musty smell + water stains = water intrusion. Could be a leaking sunroof drain, bad door seals, or worse — a flood car. Flood cars are the ultimate hidden nightmare: mold grows inside the walls, electrical gremlins appear for years, and airbag modules corrode. Always check the spare tire well too — water pools there first.",
    badAnswer: "yes",
    risk: "critical",
    estimatedCost: "Minor leak fix: $200–$600. Flood damage remediation: $1,000–$3,000. Often not worth it.",
    dealBreaker: true,
  },
  {
    id: "ac-heat-work",
    group: "interior",
    question: "Does the AC blow cold and the heat blow hot?",
    why: "AC that doesn't blow cold usually means it needs a recharge ($150–$300) or has a leak in the system that requires much more. Heat that doesn't work suggests a stuck thermostat or clogged heater core — the heater core is buried behind the dashboard and can cost $500–$1,000 in labor alone.",
    badAnswer: "no",
    risk: "major",
    estimatedCost: "AC recharge: $150–$300. AC leak/compressor: $500–$2,000. Heater core: $500–$1,200.",
  },
  {
    id: "windows-work",
    group: "interior",
    question: "Do all power windows, locks, and mirrors work from the driver's seat?",
    why: "Test every single button. Power window motors fail regularly — a new motor is $200–$400 per window. Mirrors that don't adjust electrically are annoying. Central locking that doesn't work can lock you out. These seem minor but add up fast if multiple things are broken.",
    badAnswer: "no",
    risk: "minor",
    estimatedCost: "$150–$400 per window motor. Mirrors: $100–$300. Locks: $150–$400.",
  },

  // TEST DRIVE
  {
    id: "cold-start-rough",
    group: "test-drive",
    question: "Did the car start roughly, idle unevenly, or take more than one try to start?",
    why: "Ask to be there before the seller has started the car that morning. A cold start is the most revealing moment — the engine has to work from scratch. Rough idle, hesitation, or multiple attempts to start suggest ignition issues (plugs, coils), fuel delivery problems, or a struggling starter motor.",
    badAnswer: "yes",
    risk: "major",
    estimatedCost: "Spark plugs: $100–$300. Ignition coil: $200–$500. Fuel pump: $400–$900. Starter: $300–$600.",
  },
  {
    id: "pulling",
    group: "test-drive",
    question: "Does the car pull to the left or right when you drive straight and let go of the wheel?",
    why: "On a straight, level road, let the wheel go briefly. It should track straight. Pulling means misalignment, uneven tire pressure, or a more serious suspension or brake issue. Alignment alone is cheap ($75), but if it won't hold alignment it means something bent — often from a curb hit or pothole.",
    badAnswer: "yes",
    risk: "major",
    estimatedCost: "Alignment: $75–$150. Bent suspension component: $300–$1,500+.",
  },
  {
    id: "vibration-highway",
    group: "test-drive",
    question: "Does the car vibrate noticeably at highway speed (60–70 mph)?",
    why: "Highway speed vibration is almost always unbalanced tires or a bent wheel (rim). Get on the highway. If the steering wheel shakes at 60–65 mph but smooths out above 70, that's classic tire balance. If it shakes at all speeds, it could be a bent rim or a worn CV axle.",
    badAnswer: "yes",
    risk: "minor",
    estimatedCost: "Tire balance: $60–$80. Bent rim: $150–$400. CV axle: $300–$600.",
  },
  {
    id: "brakes-grinding",
    group: "test-drive",
    question: "Do the brakes make grinding, squealing, or metal-on-metal noise?",
    why: "Brake pads have a built-in wear indicator — a small metal tab that starts squealing when the pad gets low. That's your warning sign. If you hear metal-on-metal grinding, the pads are completely gone and the metal caliper is grinding into the rotor. Every mile you drive makes it worse and more expensive.",
    badAnswer: "yes",
    risk: "critical",
    estimatedCost: "Pads + rotors (front): $300–$500. All four corners: $600–$1,000. Don't drive it.",
    dealBreaker: true,
  },
  {
    id: "transmission-slipping",
    group: "test-drive",
    question: "Does the transmission hesitate, slip, or clunk when shifting between gears?",
    why: "Automatic transmissions should shift smoothly and almost invisibly. A shudder when it changes gear, a delay between pressing the gas and the car moving, or a hard clunk are all signs of transmission trouble. Transmission replacement is one of the most expensive repairs on any vehicle.",
    badAnswer: "yes",
    risk: "critical",
    estimatedCost: "Transmission service: $150–$300. Rebuild: $2,500–$5,000. Replacement: $3,000–$8,000.",
    dealBreaker: true,
  },
  {
    id: "steering-clunking",
    group: "test-drive",
    question: "Does the steering make clunking or knocking sounds over bumps?",
    why: "Clunking over bumps or when turning means worn ball joints, tie rod ends, sway bar links, or struts. These are all safety-critical suspension components. Ball joints especially — if one fails at highway speed, you lose control of the car completely.",
    badAnswer: "yes",
    risk: "major",
    estimatedCost: "Sway bar links: $150–$300. Tie rods: $200–$600. Ball joints: $300–$800. Struts: $400–$1,200.",
  },

  // DEAL
  {
    id: "mechanic-inspection",
    group: "deal",
    question: "Are you planning to get a pre-purchase inspection from an independent mechanic?",
    why: "This is the single most important thing you can do. For $100–$150, a mechanic puts the car on a lift and sees everything you can't — leaks from below, bent suspension, rust on the frame, exhaust leaks, brake condition. If a seller refuses to let you take it to a mechanic, walk away immediately.",
    badAnswer: "no",
    risk: "major",
  },
  {
    id: "seller-refuses-mechanic",
    group: "deal",
    question: "Did the seller refuse to let you take the car to your own mechanic?",
    why: "A seller who won't let you get an independent inspection is hiding something. Full stop. There is no legitimate reason to refuse this. 'I don't want to be without the car' is not a real reason — any inspection takes a couple hours. Walk away.",
    badAnswer: "yes",
    risk: "critical",
    dealBreaker: true,
  },
  {
    id: "pressure-to-decide-now",
    group: "deal",
    question: "Is the seller pressuring you to decide right now, without time to think?",
    why: "High-pressure sales tactics ('I have three other buyers coming this afternoon') are manipulation. A good car doesn't need a pressure sale. Take your time. If they sell it while you're getting an inspection — fine, that one wasn't for you. A seller who won't give you 24–48 hours is almost always hiding something or running a scam.",
    badAnswer: "yes",
    risk: "major",
  },
];

export type AnswerMap = Record<string, "yes" | "no" | "skip">;

export interface InspectionResult {
  score: number; // 0–100, higher = better
  verdict: "walk-away" | "negotiate-hard" | "inspect-first" | "looks-good";
  dealBreakers: InspectionQuestion[];
  criticalFlags: InspectionQuestion[];
  majorFlags: InspectionQuestion[];
  minorFlags: InspectionQuestion[];
  estimatedRepairCost: string;
  summary: string;
  negotiationAmmo: string[];
}

export function calculateResult(answers: AnswerMap): InspectionResult {
  const dealBreakers: InspectionQuestion[] = [];
  const criticalFlags: InspectionQuestion[] = [];
  const majorFlags: InspectionQuestion[] = [];
  const minorFlags: InspectionQuestion[] = [];

  for (const q of INSPECTION_QUESTIONS) {
    const answer = answers[q.id];
    if (!answer || answer === "skip") continue;
    const isBad = answer === q.badAnswer;
    if (!isBad) continue;

    if (q.dealBreaker) {
      dealBreakers.push(q);
    } else if (q.risk === "critical") {
      criticalFlags.push(q);
    } else if (q.risk === "major") {
      majorFlags.push(q);
    } else {
      minorFlags.push(q);
    }
  }

  // Score: start at 100, deduct points
  let score = 100;
  score -= dealBreakers.length * 25;
  score -= criticalFlags.length * 15;
  score -= majorFlags.length * 8;
  score -= minorFlags.length * 3;
  score = Math.max(0, Math.min(100, score));

  let verdict: InspectionResult["verdict"];
  if (dealBreakers.length > 0 || score < 30) verdict = "walk-away";
  else if (score < 55 || criticalFlags.length > 0) verdict = "negotiate-hard";
  else if (score < 75 || majorFlags.length > 1) verdict = "inspect-first";
  else verdict = "looks-good";

  // Rough repair cost estimate
  const lowCosts = minorFlags.length * 200;
  const midCosts = majorFlags.length * 600;
  const highCosts = criticalFlags.length * 2000;
  const dealBreakerCosts = dealBreakers.length * 3000;
  const totalLow = lowCosts + midCosts + highCosts + dealBreakerCosts;
  const totalHigh = lowCosts * 2 + midCosts * 3 + highCosts * 4 + dealBreakerCosts * 2;
  const estimatedRepairCost =
    totalLow === 0
      ? "No major concerns found"
      : `$${totalLow.toLocaleString()}–$${totalHigh.toLocaleString()} in potential repairs`;

  // Negotiation ammo
  const negotiationAmmo: string[] = [];
  for (const q of [...criticalFlags, ...majorFlags]) {
    if (q.estimatedCost) {
      negotiationAmmo.push(`${q.question.replace("?", "")} → ${q.estimatedCost}`);
    }
  }

  const summaries: Record<InspectionResult["verdict"], string> = {
    "walk-away": dealBreakers.length > 0
      ? `This car has ${dealBreakers.length} deal-breaker issue${dealBreakers.length > 1 ? "s" : ""}. Walk away and find another car.`
      : "Too many serious problems. The risk isn't worth it at any price.",
    "negotiate-hard": `This car has real issues. If you want it, use the problems below to negotiate the price down significantly — or walk away if the seller won't move.`,
    "inspect-first": `This car looks okay but has some things that need a closer look. Get a pre-purchase inspection from a mechanic before committing.`,
    "looks-good": `This car passed most checks with flying colors. Still get a mechanic to inspect it before you hand over money — that's just good practice.`,
  };

  return {
    score,
    verdict,
    dealBreakers,
    criticalFlags,
    majorFlags,
    minorFlags,
    estimatedRepairCost,
    summary: summaries[verdict],
    negotiationAmmo,
  };
}
