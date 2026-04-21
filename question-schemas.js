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
  ]
};
