export interface Supply {
  name: string;
  note: string;       // short buying tip
  amazonUrl: string;  // affiliate link
  price: string;      // typical price
}

// Keyed by task ID
export const TASK_SUPPLIES: Record<string, Supply[]> = {

  "tire-pressure": [
    { name: "Digital Tire Pressure Gauge", price: "$8–$12", note: "Get digital — analog loses accuracy.", amazonUrl: "https://www.amazon.com/s?k=digital+tire+pressure+gauge&tag=itscalledadul-20" },
  ],

  "oil-check": [
    { name: "Motor Oil (check your owner's manual for grade)", price: "$25–$35 / 5qt", note: "Common grades: 5W-30 or 0W-20. Check your cap or manual.", amazonUrl: "https://www.amazon.com/s?k=5W-30+motor+oil+5+quart&tag=itscalledadul-20" },
    { name: "Oil Funnel", price: "$3–$6", note: "Saves you from a mess every time.", amazonUrl: "https://www.amazon.com/s?k=oil+funnel+car&tag=itscalledadul-20" },
  ],

  "wiper-blades": [
    { name: "Wiper Blades (search your car year/make/model)", price: "$15–$35 / pair", note: "Search Amazon by your car's year, make, model for the right fit.", amazonUrl: "https://www.amazon.com/s?k=wiper+blades&tag=itscalledadul-20" },
  ],

  "coolant-check": [
    { name: "Pre-mixed Engine Coolant/Antifreeze", price: "$12–$18", note: "Get pre-mixed (50/50) — don't dilute concentrate yourself.", amazonUrl: "https://www.amazon.com/s?k=pre-mixed+engine+coolant+antifreeze+50+50&tag=itscalledadul-20" },
  ],

  "air-filter": [
    { name: "HVAC Air Filter (check your vent size)", price: "$8–$20", note: "Measure your vent opening — size printed on old filter. Replace every 90 days.", amazonUrl: "https://www.amazon.com/s?k=hvac+air+filter+merv+8&tag=itscalledadul-20" },
  ],

  "smoke-detector": [
    { name: "9V Batteries (4-pack)", price: "$6–$10", note: "Most detectors use 9V. Buy a 4-pack and do all of them at once.", amazonUrl: "https://www.amazon.com/s?k=9v+batteries+4+pack&tag=itscalledadul-20" },
    { name: "Smoke + CO Detector Combo", price: "$25–$40", note: "Replace detectors over 10 years old. Combo units do both.", amazonUrl: "https://www.amazon.com/s?k=smoke+carbon+monoxide+detector+combo&tag=itscalledadul-20" },
  ],

  "water-softener": [
    { name: "Water Softener Salt Pellets (40 lb bag)", price: "$8–$15", note: "Morton or Diamond Crystal are the standard brands.", amazonUrl: "https://www.amazon.com/s?k=water+softener+salt+pellets+40lb&tag=itscalledadul-20" },
  ],

  "get-oil-change": [
    { name: "Motor Oil + Filter Kit", price: "$30–$45", note: "If doing it yourself — search your car year/make/model.", amazonUrl: "https://www.amazon.com/s?k=oil+change+kit+motor+oil+filter&tag=itscalledadul-20" },
  ],

  "jump-start": [
    { name: "Jumper Cables (20 ft)", price: "$25–$35", note: "20-foot cables reach when cars can't park bumper-to-bumper.", amazonUrl: "https://www.amazon.com/s?k=jumper+cables+20+foot&tag=itscalledadul-20" },
    { name: "Portable Jump Starter (no second car needed)", price: "$50–$80", note: "A lithium jump pack means you never need another car. Worth every penny.", amazonUrl: "https://www.amazon.com/s?k=portable+lithium+jump+starter+pack&tag=itscalledadul-20" },
  ],

  "change-flat": [
    { name: "Tire Pressure Gauge", price: "$8–$12", note: "Check your spare's pressure before you need it.", amazonUrl: "https://www.amazon.com/s?k=digital+tire+pressure+gauge&tag=itscalledadul-20" },
    { name: "Tire Plug Kit", price: "$10–$15", note: "For minor punctures — lets you plug and reinflate instead of swapping.", amazonUrl: "https://www.amazon.com/s?k=tire+plug+repair+kit&tag=itscalledadul-20" },
  ],

  "unclog-drain": [
    { name: "Drain Clog Remover (Drano Max Gel)", price: "$8–$12", note: "Pour and wait 15 min before flushing. Works on most hair clogs.", amazonUrl: "https://www.amazon.com/s?k=drano+max+gel+drain+clog+remover&tag=itscalledadul-20" },
    { name: "Drain Hair Catcher", price: "$6–$10", note: "Prevents clogs entirely. Put one in every shower.", amazonUrl: "https://www.amazon.com/s?k=shower+drain+hair+catcher&tag=itscalledadul-20" },
  ],

  "fix-running-toilet": [
    { name: "Toilet Flapper Replacement Kit", price: "$5–$12", note: "Flappers are the #1 cause of running toilets. Universal kits fit most toilets.", amazonUrl: "https://www.amazon.com/s?k=toilet+flapper+replacement+universal&tag=itscalledadul-20" },
    { name: "Toilet Fill Valve", price: "$10–$15", note: "If replacing the flapper doesn't fix it, the fill valve is next.", amazonUrl: "https://www.amazon.com/s?k=toilet+fill+valve+replacement&tag=itscalledadul-20" },
  ],

  "clean-washing-machine": [
    { name: "Washing Machine Cleaner Tablets", price: "$10–$14", note: "Affresh tablets — run once a month to prevent mold and odor.", amazonUrl: "https://www.amazon.com/s?k=affresh+washing+machine+cleaner+tablets&tag=itscalledadul-20" },
  ],

  "dryer-vent": [
    { name: "Dryer Vent Cleaning Kit", price: "$15–$25", note: "Long flexible brush that attaches to a drill. Cleans the full duct length.", amazonUrl: "https://www.amazon.com/s?k=dryer+vent+cleaning+kit+brush+drill&tag=itscalledadul-20" },
  ],

  "fridge-coils": [
    { name: "Refrigerator Coil Cleaning Brush", price: "$8–$12", note: "Long narrow brush that reaches behind and under the fridge.", amazonUrl: "https://www.amazon.com/s?k=refrigerator+coil+cleaning+brush&tag=itscalledadul-20" },
  ],

  "mold-prevention": [
    { name: "Bathroom Mold & Mildew Cleaner", price: "$6–$10", note: "Tilex or Clorox spray — spray, let sit 5 min, wipe.", amazonUrl: "https://www.amazon.com/s?k=bathroom+mold+mildew+cleaner+spray&tag=itscalledadul-20" },
    { name: "Bathroom Exhaust Fan (if yours is broken)", price: "$20–$50", note: "Ventilation is the real fix. Run it during and 15 min after every shower.", amazonUrl: "https://www.amazon.com/s?k=bathroom+exhaust+fan&tag=itscalledadul-20" },
  ],

  "lawn-spring": [
    { name: "Starter Fertilizer (spring)", price: "$25–$40", note: "High phosphorus to kick-start root growth. Apply after first mow.", amazonUrl: "https://www.amazon.com/s?k=spring+starter+lawn+fertilizer&tag=itscalledadul-20" },
    { name: "Grass Seed (for bare patches)", price: "$15–$30", note: "Match to your grass type — Kentucky Bluegrass or Tall Fescue for Ohio.", amazonUrl: "https://www.amazon.com/s?k=grass+seed+ohio+tall+fescue&tag=itscalledadul-20" },
  ],

  "lawn-fall": [
    { name: "Fall Winterizer Fertilizer", price: "$25–$40", note: "High potassium formula — feeds roots through winter.", amazonUrl: "https://www.amazon.com/s?k=fall+winterizer+lawn+fertilizer&tag=itscalledadul-20" },
  ],

  "pool-weekly": [
    { name: "Pool Chlorine Tablets (3-inch)", price: "$40–$60 / 10 lb", note: "Goes in your floater or skimmer basket. 10 lbs lasts most of the summer.", amazonUrl: "https://www.amazon.com/s?k=pool+chlorine+tablets+3+inch+10lb&tag=itscalledadul-20" },
    { name: "Pool Test Strips", price: "$10–$15", note: "Test chlorine, pH, and alkalinity weekly. 100-strip pack lasts all season.", amazonUrl: "https://www.amazon.com/s?k=pool+test+strips+100+pack&tag=itscalledadul-20" },
  ],

  "first-apartment-checklist": [
    { name: "Command Strips (damage-free hanging)", price: "$10–$15", note: "Hang things without holes. Essential for renters.", amazonUrl: "https://www.amazon.com/s?k=command+strips+damage+free+hanging&tag=itscalledadul-20" },
    { name: "Basic Tool Kit", price: "$25–$40", note: "Hammer, screwdrivers, tape measure — the first-apartment essentials.", amazonUrl: "https://www.amazon.com/s?k=basic+home+tool+kit+starter&tag=itscalledadul-20" },
    { name: "Surge Protector Power Strip", price: "$15–$25", note: "Protects electronics and adds outlets. Get one with USB ports.", amazonUrl: "https://www.amazon.com/s?k=surge+protector+power+strip+usb&tag=itscalledadul-20" },
  ],
};
