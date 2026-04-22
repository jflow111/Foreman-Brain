// Foreman Brain — Smart Estimate Question Schemas
// Each schema: array of question objects consumed by the question engine in app.html.
// Fields:
//   id          — unique string key
//   label       — question text shown to user
//   sub         — optional sub-label / hint
//   inputType   — 'choice' | 'number'
//   options     — array of { value, label, icon, isUnsure, hint }
//   pricingKeys — array of scope variable names this answer feeds
//   next        — function(answer) → next question id, or null for done

window.SE_SCHEMAS = {

  // ─────────────────────────────────────────────
  // RECESSED LIGHTING
  // ─────────────────────────────────────────────
  'recessed-lighting': [
    {
      id: 'qty',
      label: 'How many recessed lights?',
      sub: 'Count only the new fixtures being added.',
      inputType: 'choice',
      pricingKeys: ['qty_fixtures'],
      options: [
        { value: '4',  label: '4 lights',  icon: '💡' },
        { value: '6',  label: '6 lights',  icon: '💡' },
        { value: '8',  label: '8 lights',  icon: '💡' },
        { value: '10', label: '10 lights', icon: '💡' },
        { value: '12', label: '12 lights', icon: '💡' },
        { value: 'custom', label: 'Other / custom', icon: '✏️' },
        { value: 'unsure', label: 'Not sure yet', icon: '?', isUnsure: true }
      ],
      next: function() { return 'access'; }
    },
    {
      id: 'access',
      label: 'Is there ceiling access above?',
      sub: 'Attic access dramatically reduces labor. Finished ceilings above require fish wire work.',
      inputType: 'choice',
      pricingKeys: ['access_type', 'labor_multiplier'],
      options: [
        { value: 'attic',    label: 'Attic access (open)',      icon: '🏚️', hint: 'Fastest install' },
        { value: 'finished', label: 'No access — finished above', icon: '🧱', hint: 'Fish wire required, higher labor' },
        { value: 'unsure',   label: 'Unsure',                  icon: '?',  isUnsure: true }
      ],
      next: function() { return 'ceiling'; }
    },
    {
      id: 'ceiling',
      label: 'What is the ceiling type?',
      sub: 'Sloped or high ceilings require additional labor and sometimes lifts.',
      inputType: 'choice',
      pricingKeys: ['ceiling_type', 'equipment_flag'],
      options: [
        { value: 'flat',   label: 'Flat drywall (standard)', icon: '▭' },
        { value: 'sloped', label: 'Sloped / vaulted',        icon: '📐', hint: 'Angled fixtures may be needed' },
        { value: 'high',   label: 'High ceiling (12 ft+)',   icon: '🏛️', hint: 'Lift or scaffold may be needed' },
        { value: 'unsure', label: 'Unsure',                  icon: '?',  isUnsure: true }
      ],
      next: function() { return 'control'; }
    },
    {
      id: 'control',
      label: 'What control type is needed?',
      sub: 'Dimmers require compatible fixtures and may add a switch rough-in.',
      inputType: 'choice',
      pricingKeys: ['switch_materials', 'dimmer_flag'],
      options: [
        { value: 'existing',        label: 'Use existing switch',      icon: '🔘' },
        { value: 'new-switch',      label: 'Add new switch',           icon: '🔲' },
        { value: 'dimmer',          label: 'Add dimmer (new location)', icon: '🎚️' },
        { value: 'switch-dimmer',   label: 'New switch + dimmer',      icon: '🎚️', hint: 'Most common upgrade' },
        { value: 'unsure',          label: 'Unsure',                   icon: '?', isUnsure: true }
      ],
      next: function() { return 'power'; }
    },
    {
      id: 'power',
      label: 'What is the power source?',
      sub: 'Existing circuits save a breaker slot. New circuits add panel and wire cost.',
      inputType: 'choice',
      pricingKeys: ['circuit_type', 'panel_breaker_flag'],
      options: [
        { value: 'existing-lighting',    label: 'Existing lighting circuit nearby', icon: '⚡' },
        { value: 'existing-receptacle',  label: 'Existing receptacle circuit nearby', icon: '🔌' },
        { value: 'new-circuit',          label: 'New dedicated circuit needed',      icon: '🆕', hint: 'Adds breaker + wire run cost' },
        { value: 'unsure',               label: 'Unsure',                            icon: '?', isUnsure: true }
      ],
      next: function() { return 'room'; }
    },
    {
      id: 'room',
      label: 'What room are the lights going in?',
      sub: 'Wet locations (bathroom, kitchen) require IC/AT rated fixtures and may affect permit scope.',
      inputType: 'choice',
      pricingKeys: ['room_type', 'ic_rating_flag', 'permit_flag'],
      options: [
        { value: 'living',    label: 'Living room',  icon: '🛋️' },
        { value: 'bedroom',   label: 'Bedroom',      icon: '🛏️' },
        { value: 'kitchen',   label: 'Kitchen',      icon: '🍳', hint: 'IC/AT rated fixtures required' },
        { value: 'hallway',   label: 'Hallway',      icon: '🚪' },
        { value: 'bathroom',  label: 'Bathroom',     icon: '🚿', hint: 'IC/AT rated, likely damp location' },
        { value: 'other',     label: 'Other / mixed', icon: '🏠' }
      ],
      next: function() { return null; }
    }
  ],

  // ─────────────────────────────────────────────
  // EV CHARGER
  // ─────────────────────────────────────────────
  'ev-charger': [
    {
      id: 'charger_type',
      label: 'What type of EV charger connection?',
      sub: 'Most home chargers are hardwired or use a NEMA 14-50 outlet.',
      inputType: 'choice',
      pricingKeys: ['charger_type', 'outlet_materials'],
      options: [
        { value: 'hardwired',  label: 'Hardwired (240V)',   icon: '⚡', hint: 'Cleanest install, charger wired directly' },
        { value: 'nema-1450', label: 'NEMA 14-50 outlet',  icon: '🔌', hint: 'Customer provides the charger plug' },
        { value: 'unsure',     label: 'Not sure yet',       icon: '?',  isUnsure: true }
      ],
      next: function() { return 'distance'; }
    },
    {
      id: 'distance',
      label: 'How far is the install location from the main panel?',
      sub: 'Distance determines wire length, conduit, and labor. Measure the actual run path, not straight line.',
      inputType: 'choice',
      pricingKeys: ['wire_length', 'conduit_length', 'labor_hours'],
      options: [
        { value: '0-25',   label: '0 – 25 ft',   icon: '📏' },
        { value: '25-50',  label: '25 – 50 ft',  icon: '📏' },
        { value: '50-75',  label: '50 – 75 ft',  icon: '📏' },
        { value: '75-100', label: '75 – 100 ft', icon: '📏' },
        { value: '100+',   label: '100+ ft',     icon: '📏', hint: 'May need wire upgrade to reduce voltage drop' },
        { value: 'unsure', label: 'Unsure',       icon: '?',  isUnsure: true }
      ],
      next: function() { return 'location'; }
    },
    {
      id: 'location',
      label: 'Where is the charger being mounted?',
      sub: 'Detached or exterior locations add conduit, weatherproofing, and sometimes trenching.',
      inputType: 'choice',
      pricingKeys: ['location_type', 'conduit_type', 'weatherproof_req', 'trench_flag'],
      options: [
        { value: 'attached-garage', label: 'Attached garage',    icon: '🏠' },
        { value: 'detached-garage', label: 'Detached garage',    icon: '🏚️', hint: 'May require trenching or overhead run' },
        { value: 'exterior-wall',   label: 'Exterior wall',      icon: '🧱', hint: 'Weatherproof box and conduit required' },
        { value: 'carport',         label: 'Carport / open area', icon: '🅿️', hint: 'Full conduit and weatherproofing required' }
      ],
      next: function() { return 'panel_capacity'; }
    },
    {
      id: 'panel_capacity',
      label: 'Does the main panel have room for a new breaker?',
      sub: 'A full panel may require tandem breakers or a subpanel — this changes cost significantly.',
      inputType: 'choice',
      pricingKeys: ['panel_work_flag', 'service_upgrade_flag'],
      options: [
        { value: 'has-space',  label: 'Yes — open breaker slot available', icon: '✅' },
        { value: 'tandem',     label: 'Maybe — tandem breakers possible',  icon: '⚠️', hint: 'Depends on panel brand/model' },
        { value: 'no-space',   label: 'No — panel is full',               icon: '🔴', hint: 'Subpanel or service upgrade may be needed' },
        { value: 'unsure',     label: 'Unsure / haven\'t looked',          icon: '?',  isUnsure: true }
      ],
      next: function() { return 'routing'; }
    },
    {
      id: 'routing',
      label: 'How difficult is the wire routing path?',
      sub: 'Finished walls and long runs through finished spaces add significant labor.',
      inputType: 'choice',
      pricingKeys: ['labor_hours_multiplier', 'conduit_flag'],
      options: [
        { value: 'easy',      label: 'Easy — open basement or attic path',  icon: '🟢' },
        { value: 'standard',  label: 'Standard — some obstacles',           icon: '🟡' },
        { value: 'difficult', label: 'Difficult — through finished areas',   icon: '🔴', hint: 'Patching and fishing adds labor' },
        { value: 'trench',    label: 'Trenching needed (underground)',       icon: '⛏️',  hint: 'Add trench, conduit, and backfill' },
        { value: 'unsure',    label: 'Unsure',                               icon: '?',  isUnsure: true }
      ],
      next: function() { return 'amperage'; }
    },
    {
      id: 'amperage',
      label: 'What amperage does the charger need?',
      sub: 'Amperage determines wire gauge and breaker size. Most chargers run on 40A or 48A circuits.',
      inputType: 'choice',
      pricingKeys: ['wire_gauge', 'breaker_size'],
      options: [
        { value: '32a',    label: '32A circuit (Level 2 basic)',   icon: '⚡' },
        { value: '40a',    label: '40A circuit (most common)',     icon: '⚡', hint: '8 AWG wire, 50A breaker' },
        { value: '48a',    label: '48A circuit (max speed)',       icon: '⚡', hint: '6 AWG wire, 60A breaker' },
        { value: 'unsure', label: 'Not sure — we\'ll spec it',     icon: '?',  isUnsure: true }
      ],
      next: function() { return null; }
    }
  ],

  // ─────────────────────────────────────────────
  // TROUBLESHOOTING
  // ─────────────────────────────────────────────
  'troubleshooting': [
    {
      id: 'symptom',
      label: 'What is the main symptom?',
      sub: 'Pick the closest match. This sets the diagnostic approach.',
      inputType: 'choice',
      pricingKeys: ['diagnostic_type', 'urgency_flag'],
      options: [
        { value: 'breaker-trips',   label: 'Breaker trips repeatedly',      icon: '🔴' },
        { value: 'no-power',        label: 'No power to area / room',       icon: '🌑' },
        { value: 'flickering',      label: 'Lights flickering or dimming',  icon: '💡' },
        { value: 'partial-power',   label: 'Partial power (half works)',    icon: '⚡', hint: 'Often a lost leg at the panel' },
        { value: 'burning-smell',   label: 'Burning smell or warm device',  icon: '🔥', hint: 'Safety priority — urgent' },
        { value: 'device-not-work', label: 'Specific device not working',   icon: '🔌' },
        { value: 'other',           label: 'Something else',                icon: '❓' }
      ],
      next: function() { return 'scope'; }
    },
    {
      id: 'scope',
      label: 'How many devices or areas are affected?',
      sub: 'Scope tells us whether this is a branch circuit issue or something at the panel.',
      inputType: 'choice',
      pricingKeys: ['scope_of_work'],
      options: [
        { value: 'one-device',  label: 'Just one outlet / device',     icon: '🔌' },
        { value: 'one-room',    label: 'One room or one circuit',       icon: '🚪' },
        { value: 'multi-room',  label: 'Multiple rooms',               icon: '🏠' },
        { value: 'whole-panel', label: 'Whole section / half the panel', icon: '⚡', hint: 'May be a lost phase' }
      ],
      next: function() { return 'timing'; }
    },
    {
      id: 'timing',
      label: 'Is it happening right now?',
      sub: 'Intermittent faults are harder to diagnose and may require load testing.',
      inputType: 'choice',
      pricingKeys: ['same_day_flag', 'intermittent_flag'],
      options: [
        { value: 'now',          label: 'Yes — happening right now',        icon: '🟢' },
        { value: 'intermittent', label: 'Intermittent / comes and goes',    icon: '🟡', hint: 'May require extended diagnostic time' },
        { value: 'stopped',      label: 'Already stopped (but happened)',   icon: '⚪' }
      ],
      next: function() { return 'safety'; }
    },
    {
      id: 'safety',
      label: 'Are any safety indicators present?',
      sub: 'Safety issues get priority dispatch and may require immediate shutoff.',
      inputType: 'choice',
      pricingKeys: ['safety_flag', 'urgency_flag'],
      options: [
        { value: 'burning',    label: 'Burning smell or heat coming from device / panel', icon: '🔥', hint: 'Urgent — recommend shutoff' },
        { value: 'sparking',   label: 'Sparking or visible arcing',                       icon: '⚡', hint: 'Urgent — recommend shutoff' },
        { value: 'warm-panel', label: 'Warm panel face or outlet cover',                  icon: '🌡️' },
        { value: 'none',       label: 'None of the above',                                icon: '✅' }
      ],
      next: function() { return null; }
    }
  ],

  // ─────────────────────────────────────────────
  // SUBPANEL INSTALL
  // ─────────────────────────────────────────────
  'subpanel': [
    {
      id: 'panel_size',
      label: 'What size subpanel is needed?',
      sub: 'Size determines the feeder wire gauge and breaker size at the main panel.',
      inputType: 'choice',
      pricingKeys: ['panel_size', 'feeder_size'],
      options: [
        { value: '60a',    label: '60A — small garage or shed',  icon: '⚡' },
        { value: '100a',   label: '100A — standard detached',    icon: '⚡', hint: 'Most common subpanel size' },
        { value: '125a',   label: '125A — larger shop/space',    icon: '⚡' },
        { value: '200a',   label: '200A — full shop or ADU',     icon: '⚡', hint: 'May require 4/0 feeder' },
        { value: 'unsure', label: 'Unsure — we\'ll assess load', icon: '?', isUnsure: true }
      ],
      next: function() { return 'location'; }
    },
    {
      id: 'location',
      label: 'Where is the subpanel being installed?',
      sub: 'Detached structures require a separate grounding electrode system and different wire types.',
      inputType: 'choice',
      pricingKeys: ['location_type', 'grounding_flag'],
      options: [
        { value: 'attached-garage', label: 'Attached garage',           icon: '🏠' },
        { value: 'detached-garage', label: 'Detached garage',           icon: '🏚️', hint: '4-wire feeder + separate ground required' },
        { value: 'shop-barn',       label: 'Shop / barn',               icon: '🏗️', hint: '4-wire feeder + separate ground required' },
        { value: 'adu',             label: 'ADU / living space',        icon: '🏘️', hint: 'May require permit and load calc' },
        { value: 'other',           label: 'Other location',            icon: '📍' }
      ],
      next: function() { return 'distance'; }
    },
    {
      id: 'distance',
      label: 'How far is the subpanel from the main panel?',
      sub: 'Longer runs require upsized conductors to compensate for voltage drop.',
      inputType: 'choice',
      pricingKeys: ['wire_length', 'voltage_drop_flag'],
      options: [
        { value: '0-25',   label: '0–25 ft',   icon: '📏' },
        { value: '25-50',  label: '25–50 ft',  icon: '📏' },
        { value: '50-75',  label: '50–75 ft',  icon: '📏' },
        { value: '75-100', label: '75–100 ft', icon: '📏' },
        { value: '100+',   label: '100+ ft',   icon: '📏', hint: 'Conductor upsize likely needed' },
        { value: 'unsure', label: 'Unsure',    icon: '?',  isUnsure: true }
      ],
      next: function() { return 'run_type'; }
    },
    {
      id: 'run_type',
      label: 'How will the feeder be run?',
      sub: 'Underground runs require conduit and trenching. Overhead runs need proper clearance.',
      inputType: 'choice',
      pricingKeys: ['conduit_type', 'trench_flag', 'labor_hours'],
      options: [
        { value: 'interior',    label: 'Interior / overhead inside structure', icon: '🏠' },
        { value: 'overhead',    label: 'Overhead exterior (aerial run)',        icon: '🔌', hint: 'Requires proper clearance heights' },
        { value: 'underground', label: 'Underground (trenching needed)',        icon: '⛏️',  hint: 'PVC conduit, trench, backfill' },
        { value: 'unsure',      label: 'Unsure',                               icon: '?',  isUnsure: true }
      ],
      next: function() { return 'main_capacity'; }
    },
    {
      id: 'main_capacity',
      label: 'Does the main panel have breaker space for the feeder?',
      sub: 'A double-pole breaker is required at the main panel for the feeder.',
      inputType: 'choice',
      pricingKeys: ['main_panel_flag', 'service_upgrade_flag'],
      options: [
        { value: 'has-space',  label: 'Yes — has open 2-pole space',        icon: '✅' },
        { value: 'tandem',     label: 'Maybe — tandem breakers possible',   icon: '⚠️' },
        { value: 'no-space',   label: 'No — panel is full',                 icon: '🔴', hint: 'Service upgrade may be needed' },
        { value: 'unsure',     label: 'Unsure',                             icon: '?',  isUnsure: true }
      ],
      next: function() { return null; }
    }
  ],

  // ─────────────────────────────────────────────
  // SERVICE UPGRADE
  // ─────────────────────────────────────────────
  'service-upgrade': [
    {
      id: 'current_size',
      label: 'What is the current service size?',
      sub: 'This determines the scope of the upgrade and utility coordination required.',
      inputType: 'choice',
      pricingKeys: ['current_service', 'upgrade_scope'],
      options: [
        { value: '60a',    label: '60A — very old service',     icon: '⚡', hint: 'Common in pre-1960s homes' },
        { value: '100a',   label: '100A — standard old service', icon: '⚡' },
        { value: '150a',   label: '150A',                        icon: '⚡' },
        { value: '200a',   label: '200A already (other upgrade)',icon: '⚡' },
        { value: 'unsure', label: 'Unsure — need to check',     icon: '?',  isUnsure: true }
      ],
      next: function() { return 'upgrade_to'; }
    },
    {
      id: 'upgrade_to',
      label: 'What size are we upgrading to?',
      sub: 'Most residential upgrades go to 200A. 400A requires a two-meter setup.',
      inputType: 'choice',
      pricingKeys: ['new_service_size', 'meter_base_size'],
      options: [
        { value: '200a',   label: '200A — standard upgrade',      icon: '⚡', hint: 'Most common residential upgrade' },
        { value: '400a',   label: '400A — large home or shop',    icon: '⚡', hint: 'Requires dual meter base' },
        { value: 'unsure', label: 'Unsure — load calc needed',    icon: '?',  isUnsure: true }
      ],
      next: function() { return 'meter_location'; }
    },
    {
      id: 'meter_location',
      label: 'Is the meter / panel staying in place?',
      sub: 'Relocating the meter or panel adds significant labor and coordination.',
      inputType: 'choice',
      pricingKeys: ['relocation_flag', 'labor_hours'],
      options: [
        { value: 'same-location',  label: 'Same location — no move needed',    icon: '✅', hint: 'Lowest cost option' },
        { value: 'move-meter',     label: 'Relocating meter only',             icon: '🔄' },
        { value: 'move-panel',     label: 'Relocating main panel only',        icon: '🔄' },
        { value: 'move-both',      label: 'Relocating meter and panel',        icon: '🔄', hint: 'Highest complexity' },
        { value: 'unsure',         label: 'Unsure',                            icon: '?',  isUnsure: true }
      ],
      next: function() { return 'panel_replace'; }
    },
    {
      id: 'panel_replace',
      label: 'Is the main panel being replaced?',
      sub: 'Older panels (Federal Pacific, Zinsco, Pushmatic) should always be replaced.',
      inputType: 'choice',
      pricingKeys: ['panel_replace_flag', 'breaker_transfer'],
      options: [
        { value: 'yes-replace', label: 'Yes — full panel replacement',        icon: '✅', hint: 'Recommended with service upgrade' },
        { value: 'no-reuse',    label: 'No — reuse existing panel enclosure', icon: '🔄' },
        { value: 'unknown',     label: 'Unknown — need to inspect',           icon: '?',  isUnsure: true }
      ],
      next: function() { return 'utility_coord'; }
    },
    {
      id: 'utility_coord',
      label: 'Has the utility been contacted?',
      sub: 'Most utilities require a service disconnect and inspection before reconnection.',
      inputType: 'choice',
      pricingKeys: ['utility_flag', 'permit_flag'],
      options: [
        { value: 'yes',     label: 'Yes — utility already contacted',      icon: '✅' },
        { value: 'no',      label: 'No — utility coordination needed',     icon: '📞', hint: 'We can coordinate — add to scope' },
        { value: 'unsure',  label: 'Unsure',                               icon: '?',  isUnsure: true }
      ],
      next: function() { return null; }
    }
  ],

  // ─────────────────────────────────────────────
  // HOT TUB / SPA
  // ─────────────────────────────────────────────
  'hot-tub': [
    {
      id: 'circuit_size',
      label: 'What circuit size does the spa require?',
      sub: 'Check the spa manufacturer\'s nameplate. Most require 50A or 60A GFCI-protected circuits.',
      inputType: 'choice',
      pricingKeys: ['circuit_size', 'wire_gauge', 'breaker_size'],
      options: [
        { value: '30a',    label: '30A 240V — small plug-in spa',    icon: '⚡' },
        { value: '50a',    label: '50A 240V — most standard spas',   icon: '⚡', hint: '6 AWG copper, 50A GFCI breaker' },
        { value: '60a',    label: '60A 240V — larger / premium spa', icon: '⚡', hint: '4 AWG copper, 60A GFCI breaker' },
        { value: 'unsure', label: 'Unsure — need to check nameplate', icon: '?', isUnsure: true }
      ],
      next: function() { return 'distance'; }
    },
    {
      id: 'distance',
      label: 'How far is the spa from the main panel?',
      sub: 'Includes the run from the panel to the GFCI disconnect, then to the spa.',
      inputType: 'choice',
      pricingKeys: ['wire_length', 'conduit_length'],
      options: [
        { value: '0-25',   label: '0–25 ft',   icon: '📏' },
        { value: '25-50',  label: '25–50 ft',  icon: '📏' },
        { value: '50-75',  label: '50–75 ft',  icon: '📏' },
        { value: '75-100', label: '75–100 ft', icon: '📏' },
        { value: '100+',   label: '100+ ft',   icon: '📏', hint: 'May require wire upsize' },
        { value: 'unsure', label: 'Unsure',    icon: '?',  isUnsure: true }
      ],
      next: function() { return 'disconnect'; }
    },
    {
      id: 'disconnect',
      label: 'What is needed for the GFCI disconnect?',
      sub: 'CA code requires a GFCI-protected disconnect within sight of the spa.',
      inputType: 'choice',
      pricingKeys: ['disconnect_type', 'gfci_flag'],
      options: [
        { value: 'need-new',      label: 'Install new GFCI disconnect',          icon: '✅', hint: 'Required by code — most jobs' },
        { value: 'customer-has',  label: 'Customer-supplied disconnect',          icon: '📦' },
        { value: 'unsure',        label: 'Unsure',                               icon: '?',  isUnsure: true }
      ],
      next: function() { return 'location'; }
    },
    {
      id: 'location',
      label: 'Where is the spa located?',
      sub: 'Location affects conduit type, routing difficulty, and weatherproofing requirements.',
      inputType: 'choice',
      pricingKeys: ['location_type', 'conduit_flag', 'trench_flag'],
      options: [
        { value: 'back-deck',  label: 'Back deck or patio',   icon: '🏠' },
        { value: 'side-yard',  label: 'Side yard',            icon: '🌿' },
        { value: 'indoor',     label: 'Indoor / enclosed',    icon: '🏛️' },
        { value: 'rooftop',    label: 'Rooftop',              icon: '🏙️', hint: 'Waterproof conduit, complex routing' }
      ],
      next: function() { return 'routing'; }
    },
    {
      id: 'routing',
      label: 'How difficult is the wire routing?',
      sub: 'Underground runs and finished walls significantly increase labor.',
      inputType: 'choice',
      pricingKeys: ['labor_multiplier', 'trench_flag'],
      options: [
        { value: 'easy',        label: 'Easy — open path along exterior',   icon: '🟢' },
        { value: 'standard',    label: 'Standard — some obstacles',         icon: '🟡' },
        { value: 'underground', label: 'Underground trench needed',          icon: '⛏️', hint: 'Add trench + conduit + backfill' },
        { value: 'unsure',      label: 'Unsure',                            icon: '?',  isUnsure: true }
      ],
      next: function() { return null; }
    }
  ],

  // ─────────────────────────────────────────────
  // ADD RECEPTACLES
  // ─────────────────────────────────────────────
  'receptacle-add': [
    {
      id: 'qty',
      label: 'How many receptacles are being added?',
      sub: 'Each additional receptacle on the same run adds minimal cost.',
      inputType: 'choice',
      pricingKeys: ['qty_outlets'],
      options: [
        { value: '1',      label: '1 receptacle',  icon: '🔌' },
        { value: '2',      label: '2 receptacles', icon: '🔌' },
        { value: '3-4',    label: '3–4 receptacles', icon: '🔌' },
        { value: '5+',     label: '5 or more',     icon: '🔌', hint: 'May need a new circuit' },
        { value: 'unsure', label: 'Unsure yet',    icon: '?',  isUnsure: true }
      ],
      next: function() { return 'outlet_type'; }
    },
    {
      id: 'outlet_type',
      label: 'What type of receptacle?',
      sub: 'Wet locations always require GFCI. 240V outlets need a dedicated circuit.',
      inputType: 'choice',
      pricingKeys: ['outlet_type', 'circuit_size', 'gfci_flag'],
      options: [
        { value: 'standard-15a',  label: 'Standard 15A — general use',     icon: '🔌' },
        { value: 'standard-20a',  label: 'Standard 20A — kitchen / bath',  icon: '🔌' },
        { value: 'gfci',          label: 'GFCI — wet location required',   icon: '💧' },
        { value: 'usb-combo',     label: 'USB combo outlet',               icon: '📱' },
        { value: '240v',          label: '240V specialty outlet',          icon: '⚡', hint: 'Requires dedicated circuit' }
      ],
      next: function() { return 'wall_access'; }
    },
    {
      id: 'wall_access',
      label: 'What is the wall condition?',
      sub: 'Finished drywall requires fish wire — adds significant labor per outlet.',
      inputType: 'choice',
      pricingKeys: ['access_type', 'labor_multiplier'],
      options: [
        { value: 'open-wall',   label: 'Open / unfinished wall',         icon: '🟢', hint: 'Easiest — direct wire run' },
        { value: 'finished',    label: 'Finished drywall — fish wire',   icon: '🔴', hint: 'Adds labor per outlet' },
        { value: 'exterior',    label: 'Exterior / weatherproof location', icon: '🌧️' },
        { value: 'unsure',      label: 'Unsure',                         icon: '?',  isUnsure: true }
      ],
      next: function() { return 'power_source'; }
    },
    {
      id: 'power_source',
      label: 'Where will power come from?',
      sub: 'Tapping an existing circuit is fastest. A new circuit costs more but is cleaner.',
      inputType: 'choice',
      pricingKeys: ['circuit_source', 'panel_breaker_flag'],
      options: [
        { value: 'existing-nearby',  label: 'Existing circuit in same room',    icon: '⚡' },
        { value: 'existing-adjacent', label: 'Existing circuit in adjacent room', icon: '⚡' },
        { value: 'new-circuit',      label: 'New dedicated circuit from panel',  icon: '🆕', hint: 'Adds breaker + full wire run' },
        { value: 'unsure',           label: 'Unsure',                           icon: '?',  isUnsure: true }
      ],
      next: function() { return null; }
    }
  ],

  // ─────────────────────────────────────────────
  // KITCHEN CIRCUITS
  // ─────────────────────────────────────────────
  'kitchen-circuits': [
    {
      id: 'scope',
      label: 'Which kitchen circuits are needed?',
      sub: 'CA code requires at minimum two 20A small appliance circuits (SABC) in kitchens.',
      inputType: 'choice',
      pricingKeys: ['circuit_count', 'circuit_types'],
      options: [
        { value: 'sabc-only',    label: '2x 20A small appliance (SABC only)',          icon: '⚡', hint: 'Code minimum for kitchen' },
        { value: 'sabc-fridge',  label: 'SABC + dedicated refrigerator circuit',       icon: '🧊' },
        { value: 'sabc-full',    label: 'SABC + fridge + microwave (full code set)',   icon: '🍳', hint: 'Most common remodel package' },
        { value: 'full-remodel', label: 'Full remodel — all of the above + dishwasher', icon: '✅' },
        { value: 'unsure',       label: 'Unsure — need assessment',                    icon: '?', isUnsure: true }
      ],
      next: function() { return 'wall_access'; }
    },
    {
      id: 'wall_access',
      label: 'What is the wall / ceiling access situation?',
      sub: 'Open walls during remodel save significant labor compared to fishing through finished walls.',
      inputType: 'choice',
      pricingKeys: ['access_type', 'labor_multiplier'],
      options: [
        { value: 'open',          label: 'Open walls — remodel in progress',  icon: '🟢', hint: 'Best time to run circuits' },
        { value: 'closed',        label: 'Closed walls — fish wire required', icon: '🔴', hint: 'Higher labor cost' },
        { value: 'partial',       label: 'Partially open',                    icon: '🟡' },
        { value: 'unsure',        label: 'Unsure',                            icon: '?',  isUnsure: true }
      ],
      next: function() { return 'panel_distance'; }
    },
    {
      id: 'panel_distance',
      label: 'How far is the kitchen from the main panel?',
      sub: 'Longer runs or floor changes add wire and labor cost.',
      inputType: 'choice',
      pricingKeys: ['wire_length', 'labor_hours'],
      options: [
        { value: 'same-wall',   label: 'Same floor, panel nearby (close)',     icon: '📏' },
        { value: 'same-floor',  label: 'Same floor, across the room',          icon: '📏' },
        { value: 'diff-floor',  label: 'Different floor from panel',           icon: '📏', hint: 'Requires vertical wire run' },
        { value: 'unsure',      label: 'Unsure',                               icon: '?',  isUnsure: true }
      ],
      next: function() { return 'panel_capacity'; }
    },
    {
      id: 'panel_capacity',
      label: 'Does the panel have room for the new breakers?',
      sub: 'Each new circuit needs a breaker slot. Full panels need space made first.',
      inputType: 'choice',
      pricingKeys: ['panel_work_flag'],
      options: [
        { value: 'has-space',  label: 'Yes — open slots available',       icon: '✅' },
        { value: 'tight',      label: 'Tight — may need tandem breakers', icon: '⚠️' },
        { value: 'full',       label: 'Full — panel work needed first',   icon: '🔴' },
        { value: 'unsure',     label: 'Unsure',                           icon: '?',  isUnsure: true }
      ],
      next: function() { return null; }
    }
  ],

  // ─────────────────────────────────────────────
  // CEILING FAN INSTALL
  // ─────────────────────────────────────────────
  'fan-install': [
    {
      id: 'existing_fixture',
      label: 'Is there an existing fixture at this location?',
      sub: 'Replacing an existing fixture is simpler. New locations need a fan-rated box installed.',
      inputType: 'choice',
      pricingKeys: ['existing_fixture_flag', 'box_work'],
      options: [
        { value: 'replace-light',  label: 'Yes — replacing a light fixture', icon: '💡', hint: 'Box may need upgrading to fan-rated' },
        { value: 'replace-fan',    label: 'Yes — replacing existing fan',    icon: '🌀' },
        { value: 'new-location',   label: 'No — new ceiling location',       icon: '🆕', hint: 'New box + wiring required' }
      ],
      next: function() { return 'box_type'; }
    },
    {
      id: 'box_type',
      label: 'What type of mounting is needed?',
      sub: 'All ceiling fans require a fan-rated box. Heavy fans over 35 lbs need brace mounts.',
      inputType: 'choice',
      pricingKeys: ['box_type', 'labor_hours'],
      options: [
        { value: 'standard-brace', label: 'Standard fan-rated brace box',    icon: '✅', hint: 'Works for most fans' },
        { value: 'heavy-duty',     label: 'Heavy-duty / structural mount',   icon: '🔩', hint: 'For fans over 35 lbs' },
        { value: 'already-rated',  label: 'Existing box is already fan-rated', icon: '✅' },
        { value: 'unsure',         label: 'Unsure — need to check',          icon: '?',  isUnsure: true }
      ],
      next: function() { return 'control'; }
    },
    {
      id: 'control',
      label: 'What control setup is needed?',
      sub: 'Separate fan/light controls require 3-wire cable. Smart switches need neutral wires.',
      inputType: 'choice',
      pricingKeys: ['control_type', 'wire_type'],
      options: [
        { value: 'single-switch',  label: 'Single wall switch (fan + light together)', icon: '🔘' },
        { value: 'dual-control',   label: 'Separate fan and light controls',           icon: '🎚️', hint: 'Requires 3-wire cable' },
        { value: 'smart-switch',   label: 'Smart switch or remote control',            icon: '📱' },
        { value: 'unsure',         label: 'Unsure',                                   icon: '?',  isUnsure: true }
      ],
      next: function() { return 'ceiling_height'; }
    },
    {
      id: 'ceiling_height',
      label: 'What is the ceiling height?',
      sub: 'High ceilings may need extension rods and affect safety during installation.',
      inputType: 'choice',
      pricingKeys: ['ceiling_height', 'equipment_flag'],
      options: [
        { value: 'standard',  label: 'Standard (8–10 ft)',    icon: '▭' },
        { value: 'high',      label: 'High (10–14 ft)',       icon: '🏛️', hint: 'Ladder work — adds time' },
        { value: 'very-high', label: 'Very high (14 ft+)',    icon: '🏛️', hint: 'Scaffold or lift needed' },
        { value: 'unsure',    label: 'Unsure',                icon: '?',  isUnsure: true }
      ],
      next: function() { return null; }
    }
  ],

  // ─────────────────────────────────────────────
  // SERVICE CALL (flat-rate diagnostic)
  // ─────────────────────────────────────────────
  'service-call': [
    {
      id: 'call_type',
      label: 'What type of service call is this?',
      sub: 'This sets the base rate and time allocation.',
      inputType: 'choice',
      pricingKeys: ['call_type', 'base_rate'],
      options: [
        { value: 'diagnostic',  label: 'Diagnostic — find and identify the problem', icon: '🔍' },
        { value: 'small-repair', label: 'Small repair — already know the issue',     icon: '🔧', hint: 'Under 1 hour expected' },
        { value: 'inspection',  label: 'Code / inspection compliance check',         icon: '📋' },
        { value: 'post-inspection', label: 'Post-inspection repair list',            icon: '📝' }
      ],
      next: function() { return 'estimated_time'; }
    },
    {
      id: 'estimated_time',
      label: 'How long do you expect the call to take?',
      sub: 'Honest estimate — intermittent faults often take longer.',
      inputType: 'choice',
      pricingKeys: ['labor_hours'],
      options: [
        { value: 'under-1hr',  label: 'Quick — under 1 hour',    icon: '⚡' },
        { value: '1-2hr',      label: 'Standard — 1 to 2 hours', icon: '🕐' },
        { value: 'half-day',   label: 'Extended — half day',     icon: '🕛' },
        { value: 'unknown',    label: 'Unknown',                  icon: '?', isUnsure: true }
      ],
      next: function() { return 'travel'; }
    },
    {
      id: 'travel',
      label: 'What is the travel distance?',
      sub: 'Travel time is part of the service call cost.',
      inputType: 'choice',
      pricingKeys: ['travel_cost'],
      options: [
        { value: 'local',     label: 'Local — under 15 miles',    icon: '📍' },
        { value: 'standard',  label: 'Standard — 15–30 miles',    icon: '📍' },
        { value: 'extended',  label: 'Extended — 30+ miles',      icon: '📍', hint: 'Travel time billed at labor rate' }
      ],
      next: function() { return null; }
    }
  ],

  // ─────────────────────────────────────────────
  // REPLACE FIXTURE / FAN
  // ─────────────────────────────────────────────
  'replace-fixture': [
    {
      id: 'fixture_type',
      label: 'What type of fixture is being replaced?',
      sub: 'Heavy fixtures (over 35 lbs) or chandeliers may require structural support.',
      inputType: 'choice',
      pricingKeys: ['fixture_type', 'box_upgrade_flag'],
      options: [
        { value: 'flush-mount',  label: 'Flush / semi-flush light',   icon: '💡' },
        { value: 'pendant',      label: 'Pendant / hanging light',     icon: '💡' },
        { value: 'ceiling-fan',  label: 'Ceiling fan',                 icon: '🌀', hint: 'Fan-rated box required' },
        { value: 'chandelier',   label: 'Chandelier (heavy fixture)',  icon: '✨', hint: 'May need structural support' },
        { value: 'exhaust-fan',  label: 'Bathroom exhaust fan',        icon: '💨' },
        { value: 'recessed',     label: 'Recessed can / trim only',    icon: '⭕' }
      ],
      next: function() { return 'qty'; }
    },
    {
      id: 'qty',
      label: 'How many fixtures?',
      inputType: 'choice',
      pricingKeys: ['qty_fixtures'],
      options: [
        { value: '1',    label: '1 fixture',  icon: '1️⃣' },
        { value: '2-3',  label: '2–3 fixtures', icon: '2️⃣' },
        { value: '4+',   label: '4 or more',  icon: '🔢' }
      ],
      next: function() { return 'ceiling_height'; }
    },
    {
      id: 'ceiling_height',
      label: 'What is the ceiling height?',
      inputType: 'choice',
      pricingKeys: ['ceiling_height', 'equipment_flag'],
      options: [
        { value: 'standard',  label: 'Standard (8–10 ft)',   icon: '▭' },
        { value: 'high',      label: 'High (10–14 ft)',      icon: '🏛️', hint: 'Ladder work adds time' },
        { value: 'very-high', label: 'Very high (14 ft+)',   icon: '🏛️', hint: 'May need scaffold or lift' }
      ],
      next: function() { return 'wiring_condition'; }
    },
    {
      id: 'wiring_condition',
      label: 'What is the existing wiring condition?',
      sub: 'Old wiring may require an adapter or box upgrade to accept the new fixture.',
      inputType: 'choice',
      pricingKeys: ['wiring_flag'],
      options: [
        { value: 'good',      label: 'Good — modern wiring, direct swap',   icon: '✅' },
        { value: 'old-wiring', label: 'Older wiring (knob & tube, cloth)', icon: '⚠️', hint: 'May need pigtailing or adapter' },
        { value: 'unsure',    label: 'Unsure',                              icon: '?',  isUnsure: true }
      ],
      next: function() { return null; }
    }
  ],

  // ─────────────────────────────────────────────
  // REPLACE RECEPTACLE / SWITCH
  // ─────────────────────────────────────────────
  'replace-receptacle': [
    {
      id: 'device_type',
      label: 'What type of device is being replaced?',
      inputType: 'choice',
      pricingKeys: ['device_type', 'device_cost'],
      options: [
        { value: 'standard-outlet', label: 'Standard receptacle',         icon: '🔌' },
        { value: 'gfci-outlet',     label: 'GFCI receptacle',             icon: '💧' },
        { value: 'usb-outlet',      label: 'USB combination outlet',      icon: '📱' },
        { value: 'standard-switch', label: 'Standard switch',             icon: '🔘' },
        { value: 'dimmer-switch',   label: 'Dimmer switch',               icon: '🎚️' },
        { value: 'smart-switch',    label: 'Smart / Wi-Fi switch',        icon: '📱' }
      ],
      next: function() { return 'qty'; }
    },
    {
      id: 'qty',
      label: 'How many devices?',
      inputType: 'choice',
      pricingKeys: ['qty_devices'],
      options: [
        { value: '1',    label: '1 device',    icon: '1️⃣' },
        { value: '2-3',  label: '2–3 devices', icon: '2️⃣' },
        { value: '4-6',  label: '4–6 devices', icon: '🔢' },
        { value: '7+',   label: '7 or more',   icon: '🔢', hint: 'Bulk pricing may apply' }
      ],
      next: function() { return 'wiring_condition'; }
    },
    {
      id: 'wiring_condition',
      label: 'Any wiring concerns?',
      sub: 'Aluminum wiring and crowded boxes add time and require special handling.',
      inputType: 'choice',
      pricingKeys: ['wiring_flag', 'labor_multiplier'],
      options: [
        { value: 'standard',  label: 'No — standard copper wiring, straightforward swap', icon: '✅' },
        { value: 'aluminum',  label: 'Aluminum wiring — needs CO/ALR devices',            icon: '⚠️', hint: 'Requires compatible devices + anti-ox compound' },
        { value: 'crowded',   label: 'Box is crowded or wiring is tight',                 icon: '⚠️' },
        { value: 'unsure',    label: 'Unsure — will check on site',                      icon: '?',  isUnsure: true }
      ],
      next: function() { return null; }
    }
  ]
};
