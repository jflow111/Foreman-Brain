// Price This — parser rules + rough pricing templates
// Each job has: patterns (phrases), keywords, baseLaborHrs [min,max], baseMaterialCost [min,max],
// minCharge, materialPreview, followUps (max 3), seKey (handoff target in SE_SCHEMAS)

window.PT_CONFIG = { jobs: [

  // ── Add Outlet ──
  {
    key: 'receptacle-add',
    seKey: 'receptacle-add',
    label: 'Add Outlet / Receptacle',
    icon: '🔌',
    patterns: ['add outlet','add receptacle','new outlet','install outlet','add plug','run outlet','need outlet','want outlet'],
    keywords: ['outlet','receptacle','plug'],
    triggerWords: ['add','new','install','run'],
    baseLaborHrs: [1.5, 3.0],
    baseMaterialCost: [35, 65],
    minCharge: 275,
    materialPreview: ['15A or 20A receptacle','NM cable (14/2 or 12/2)','New work box','Cover plate'],
    scopeTemplate: 'Install {qty} new outlet(s). Includes circuit run, box, device, and cover.',
    assumptions: ['Existing panel has open breaker space','Standard stud-framed walls','CA permit may be required'],
    followUps: [
      {
        id: 'access',
        label: 'Wall access type?',
        options: [
          { value: 'open',   label: '✓  Open wall / attic access', laborMod: 1.0 },
          { value: 'fish',   label: '🧱 Finished wall, need to fish', laborMod: 1.6 },
          { value: 'unsure', label: '?  Unsure', laborMod: 1.3 }
        ]
      },
      {
        id: 'qty',
        label: 'How many outlets?',
        isQty: true,
        options: [
          { value: '1',  label: '1',     qty: 1   },
          { value: '2',  label: '2',     qty: 2   },
          { value: '3',  label: '3–4',   qty: 3.5 },
          { value: '5+', label: '5 or more', qty: 6 }
        ]
      },
      {
        id: 'type',
        label: 'Outlet type?',
        options: [
          { value: 'standard', label: '⚪ Standard',   matAdd: 0  },
          { value: 'gfci',     label: '🔶 GFCI',        matAdd: 18 },
          { value: 'usb',      label: '🔌 USB combo',   matAdd: 25 },
          { value: 'unsure',   label: '?  Unsure',      matAdd: 0  }
        ]
      }
    ]
  },

  // ── Replace Outlet / Switch ──
  {
    key: 'replace-receptacle',
    seKey: 'replace-receptacle',
    label: 'Replace Outlet / Switch',
    icon: '🔄',
    patterns: ['replace outlet','replace receptacle','replace switch','swap outlet','dead outlet','broken outlet','not working outlet'],
    keywords: ['replace','swap','dead outlet','broken outlet'],
    triggerWords: ['replace','swap','fix'],
    baseLaborHrs: [0.5, 1.0],
    baseMaterialCost: [12, 35],
    minCharge: 175,
    materialPreview: ['Replacement receptacle or switch','Wire nuts','Cover plate'],
    scopeTemplate: 'Replace {qty} existing outlet(s) or switch(es). In-kind replacement, no new wiring required.',
    assumptions: ['Existing wiring is serviceable','No panel work required'],
    followUps: [
      {
        id: 'qty',
        label: 'How many to replace?',
        isQty: true,
        options: [
          { value: '1',  label: '1',    qty: 1   },
          { value: '2',  label: '2–3',  qty: 2.5 },
          { value: '4+', label: '4+',   qty: 5   }
        ]
      },
      {
        id: 'type',
        label: 'Any GFCI or smart devices?',
        options: [
          { value: 'standard', label: '⚪ Standard',      matAdd: 0  },
          { value: 'gfci',     label: '🔶 GFCI required', matAdd: 18 },
          { value: 'smart',    label: '📱 Smart switch',  matAdd: 45 }
        ]
      }
    ]
  },

  // ── Install / Replace Fan ──
  {
    key: 'fan-install',
    seKey: 'fan-install',
    label: 'Ceiling Fan Install',
    icon: '🌀',
    patterns: ['install fan','ceiling fan','replace fan','add fan','fan install','fan replacement','put in fan','hang fan'],
    keywords: ['fan','ceiling fan'],
    triggerWords: ['install','replace','add','new','hang'],
    baseLaborHrs: [1.5, 3.5],
    baseMaterialCost: [25, 75],
    minCharge: 275,
    materialPreview: ['Fan-rated box or brace kit','Wire connectors','Misc hardware','Customer-supplied fan'],
    scopeTemplate: 'Install ceiling fan at {location}. Includes fan-rated box, wiring connection, and controls.',
    assumptions: ['Customer-supplied fan','Standard ceiling height under 10 ft','Existing switch circuit usable'],
    followUps: [
      {
        id: 'location',
        label: 'Existing box or new run?',
        options: [
          { value: 'existing', label: '✓  Existing light location', laborMod: 1.0 },
          { value: 'new',      label: '⚡ New location — need wiring', laborMod: 1.8 },
          { value: 'unsure',   label: '?  Unsure', laborMod: 1.4 }
        ]
      },
      {
        id: 'control',
        label: 'Control type?',
        options: [
          { value: 'single',  label: '⚪ Single switch',                 laborMod: 1.0, matAdd: 0  },
          { value: 'dual',    label: '⚡ Separate fan + light switches', laborMod: 1.3, matAdd: 20 },
          { value: 'remote',  label: '📱 Remote or smart',               laborMod: 1.1, matAdd: 40 }
        ]
      }
    ]
  },

  // ── Replace Light Fixture ──
  {
    key: 'replace-fixture',
    seKey: 'replace-fixture',
    label: 'Replace Light Fixture',
    icon: '💡',
    patterns: ['replace fixture','replace light','swap fixture','new light fixture','fixture replacement','replace chandelier','replace pendant','change fixture'],
    keywords: ['fixture','chandelier','pendant','light fixture'],
    triggerWords: ['replace','swap','new','upgrade','change'],
    baseLaborHrs: [0.75, 2.0],
    baseMaterialCost: [15, 40],
    minCharge: 175,
    materialPreview: ['Wire nuts','Mounting hardware','Misc','Customer-supplied fixture'],
    scopeTemplate: 'Replace {qty} existing light fixture(s). Customer-supplied fixture installation.',
    assumptions: ['Customer-supplied fixture','Existing wiring serviceable','Standard ceiling height'],
    followUps: [
      {
        id: 'qty',
        label: 'How many fixtures?',
        isQty: true,
        options: [
          { value: '1',  label: '1',    qty: 1   },
          { value: '2',  label: '2–3',  qty: 2.5 },
          { value: '4+', label: '4 or more', qty: 5 }
        ]
      },
      {
        id: 'height',
        label: 'Ceiling height?',
        options: [
          { value: 'standard',  label: '✓  Standard (8–10 ft)',   laborMod: 1.0 },
          { value: 'high',      label: '📐 High (10–14 ft)',       laborMod: 1.4 },
          { value: 'very-high', label: '🪜 Very high (14 ft+)',    laborMod: 2.0 }
        ]
      }
    ]
  },

  // ── Recessed Lighting ──
  {
    key: 'recessed-lighting',
    seKey: 'recessed-lighting',
    label: 'Recessed Lighting',
    icon: '🔦',
    patterns: ['recessed light','recessed lighting','can light','pot light','canned light','downlight','led wafer','add cans','install cans','recessed can'],
    keywords: ['recessed','can light','pot light','downlight','wafer','canned'],
    triggerWords: ['install','add','put in','new'],
    baseLaborHrs: [1.0, 1.75],
    baseMaterialCost: [45, 85],
    minCharge: 450,
    quantityDefault: 4,
    materialPreview: ['LED wafer/retrofit fixtures','Switch or dimmer','NM cable & connectors','Misc installation materials'],
    scopeTemplate: 'Install {qty} recessed LED lights. Includes wiring, fixtures, dimmer switch, and circuit.',
    assumptions: ['Attic access assumed for wiring','New switch/dimmer circuit included','Drywall patching not included'],
    followUps: [
      {
        id: 'qty',
        label: 'How many lights?',
        isQty: true,
        options: [
          { value: '4',   label: '4',   qty: 4  },
          { value: '6',   label: '6',   qty: 6  },
          { value: '8',   label: '8',   qty: 8  },
          { value: '10+', label: '10+', qty: 11 }
        ]
      },
      {
        id: 'access',
        label: 'Ceiling access?',
        options: [
          { value: 'attic',     label: '✓  Attic access above',        laborMod: 1.0  },
          { value: 'no-access', label: '🧱 No attic, finished ceiling', laborMod: 1.5  },
          { value: 'unsure',    label: '?  Unsure',                     laborMod: 1.25 }
        ]
      },
      {
        id: 'control',
        label: 'Switch or dimmer?',
        options: [
          { value: 'switch',  label: '⚪ Standard switch',        matAdd: 0  },
          { value: 'dimmer',  label: '🌓 Dimmer',                 matAdd: 35 },
          { value: 'multi',   label: '✦  Multi-location dimmer',  matAdd: 80 }
        ]
      }
    ]
  },

  // ── EV Charger ──
  {
    key: 'ev-charger',
    seKey: 'ev-charger',
    label: 'EV Charger Install',
    icon: '🔋',
    patterns: ['ev charger','electric vehicle charger','car charger','level 2 charger','ev charging','tesla charger','charger install','nema 14-50','50 amp charger','40 amp charger','48 amp charger','level2'],
    keywords: ['ev charger','ev charging','level 2','nema 14-50','electric vehicle'],
    triggerWords: ['charger','ev','vehicle','charging'],
    baseLaborHrs: [4.0, 8.0],
    baseMaterialCost: [180, 380],
    minCharge: 850,
    materialPreview: ['50A 2-pole breaker','6/2 NM or THHN wire','NEMA 14-50 outlet or hardwire terminations','Conduit & fittings (if required)','Junction box'],
    scopeTemplate: 'Install EV charging circuit from main panel to {location}. Includes breaker, wiring, and outlet/termination.',
    assumptions: ['Main panel has available breaker space','Standard residential install','Permit required'],
    followUps: [
      {
        id: 'amperage',
        label: 'Charger amperage?',
        options: [
          { value: '32a',   label: '32A — entry level',     laborMod: 0.9, matMod: 0.85 },
          { value: '40a',   label: '40A — standard',        laborMod: 1.0, matMod: 1.0  },
          { value: '48a',   label: '48A — high speed',      laborMod: 1.0, matMod: 1.1  },
          { value: 'unsure',label: '?  I\'ll size it',      laborMod: 1.0, matMod: 1.0  }
        ]
      },
      {
        id: 'distance',
        label: 'Distance from panel?',
        options: [
          { value: 'short',     label: '0–25 ft',   laborMod: 0.8, matMod: 0.75 },
          { value: 'medium',    label: '25–50 ft',  laborMod: 1.0, matMod: 1.0  },
          { value: 'long',      label: '50–100 ft', laborMod: 1.3, matMod: 1.5  },
          { value: 'very-long', label: '100+ ft',   laborMod: 1.8, matMod: 2.0  }
        ]
      },
      {
        id: 'location',
        label: 'Mount location?',
        options: [
          { value: 'attached',  label: '🏠 Attached garage',   laborMod: 1.0, matAdd: 0   },
          { value: 'exterior',  label: '🌧️ Exterior wall',      laborMod: 1.2, matAdd: 40  },
          { value: 'detached',  label: '🏚️ Detached garage',    laborMod: 1.5, matAdd: 120 },
          { value: 'unsure',    label: '?  Unsure',             laborMod: 1.1, matAdd: 0   }
        ]
      }
    ]
  },

  // ── Subpanel ──
  {
    key: 'subpanel',
    seKey: 'subpanel',
    label: 'Subpanel Install',
    icon: '⚡',
    patterns: ['subpanel','sub panel','sub-panel','panel in garage','garage panel','add panel','new panel','100 amp panel','60 amp panel','panel addition'],
    keywords: ['subpanel','sub-panel','sub panel'],
    triggerWords: ['install','add','run','new panel'],
    baseLaborHrs: [6.0, 12.0],
    baseMaterialCost: [350, 700],
    minCharge: 1400,
    materialPreview: ['100A 20-space subpanel','2-pole 100A feeder breaker','4-wire feeder cable','Conduit & fittings','Ground rods (if detached)'],
    scopeTemplate: 'Install subpanel at {location}. Includes feeder from main panel, new panel, main breaker, and terminations.',
    assumptions: ['Main panel has space for feeder breaker','Permit and inspection required'],
    followUps: [
      {
        id: 'size',
        label: 'Subpanel size?',
        options: [
          { value: '60a',   label: '60A — small garage',     laborMod: 0.9, matMod: 0.75 },
          { value: '100a',  label: '100A — standard',        laborMod: 1.0, matMod: 1.0  },
          { value: '150a',  label: '150A — large shop',      laborMod: 1.1, matMod: 1.3  },
          { value: 'unsure',label: '?  Size it for me',      laborMod: 1.0, matMod: 1.0  }
        ]
      },
      {
        id: 'location',
        label: 'Subpanel location?',
        options: [
          { value: 'same',     label: '🏠 Same building',      laborMod: 1.0, matAdd: 0   },
          { value: 'detached', label: '🏚️ Detached structure',  laborMod: 1.5, matAdd: 250 },
          { value: 'unsure',   label: '?  Unsure',             laborMod: 1.2, matAdd: 0   }
        ]
      },
      {
        id: 'distance',
        label: 'Feeder run length?',
        options: [
          { value: 'short',  label: '< 30 ft',    laborMod: 0.8, matMod: 0.8 },
          { value: 'medium', label: '30–75 ft',   laborMod: 1.0, matMod: 1.0 },
          { value: 'long',   label: '75–150 ft',  laborMod: 1.3, matMod: 1.5 }
        ]
      }
    ]
  },

  // ── Troubleshoot ──
  {
    key: 'troubleshooting',
    seKey: 'troubleshooting',
    label: 'Troubleshoot / Diagnose',
    icon: '🔍',
    patterns: ['troubleshoot','no power','breaker tripping','circuit dead','power out','outlet not working','lights not working','diagnose','find fault','trace circuit','tripping breaker','flickering','flickering lights'],
    keywords: ['troubleshoot','diagnose','not working','no power','tripping','flickering','dead circuit'],
    triggerWords: ['troubleshoot','diagnose','find','check','trace'],
    baseLaborHrs: [1.5, 3.0],
    baseMaterialCost: [0, 50],
    minCharge: 275,
    materialPreview: ['Diagnostic labor (flat fee)','Repair parts billed separately after diagnosis'],
    scopeTemplate: 'Diagnostic visit for electrical issue. Identify fault, provide findings, quote repair separately.',
    assumptions: ['Diagnostic rate applied','Repair quoted after diagnosis','Same-day travel included'],
    followUps: [
      {
        id: 'issue',
        label: 'What\'s the issue?',
        options: [
          { value: 'dead',        label: '⚡ Dead outlet or circuit',    laborMod: 1.0 },
          { value: 'tripping',    label: '🔁 Breaker keeps tripping',    laborMod: 1.2 },
          { value: 'no-power',    label: '🌑 No power to area',          laborMod: 1.3 },
          { value: 'flickering',  label: '💡 Flickering / intermittent', laborMod: 1.5 }
        ]
      },
      {
        id: 'urgency',
        label: 'How urgent?',
        options: [
          { value: 'normal',    label: '📅 Schedule normally',  laborMod: 1.0 },
          { value: 'urgent',    label: '⚠️ Same day',           laborMod: 1.5 },
          { value: 'emergency', label: '🚨 Emergency now',      laborMod: 2.0 }
        ]
      }
    ]
  },

  // ── Dedicated Circuit ──
  {
    key: 'dedicated-circuit',
    seKey: 'ev-charger',
    label: 'Dedicated Circuit',
    icon: '⚡',
    patterns: ['dedicated circuit','new circuit','add circuit','20 amp circuit','30 amp circuit','circuit for','run circuit','circuit to','single circuit'],
    keywords: ['dedicated circuit','new circuit','add circuit'],
    triggerWords: ['dedicated','circuit','run','add'],
    baseLaborHrs: [2.0, 4.0],
    baseMaterialCost: [60, 150],
    minCharge: 350,
    materialPreview: ['New circuit breaker','NM cable or conduit','Outlet or device at load end','Misc connectors'],
    scopeTemplate: 'Run new dedicated circuit from panel to load location.',
    assumptions: ['Panel has open breaker space','Standard residential wiring'],
    followUps: [
      {
        id: 'amperage',
        label: 'Circuit size?',
        options: [
          { value: '15a', label: '15A — standard',      laborMod: 0.9, matMod: 0.85 },
          { value: '20a', label: '20A — appliance',     laborMod: 1.0, matMod: 1.0  },
          { value: '30a', label: '30A — dryer/range',   laborMod: 1.1, matMod: 1.3  },
          { value: '50a', label: '50A — range or EV',   laborMod: 1.2, matMod: 1.6  }
        ]
      },
      {
        id: 'distance',
        label: 'Run distance from panel?',
        options: [
          { value: 'short',  label: '< 25 ft',  laborMod: 0.85, matMod: 0.8 },
          { value: 'medium', label: '25–50 ft', laborMod: 1.0,  matMod: 1.0 },
          { value: 'long',   label: '50+ ft',   laborMod: 1.3,  matMod: 1.5 }
        ]
      }
    ]
  },

  // ── Service Upgrade ──
  {
    key: 'service-upgrade',
    seKey: 'service-upgrade',
    label: 'Service Upgrade',
    icon: '🏗️',
    patterns: ['service upgrade','panel upgrade','200 amp service','400 amp service','upgrade service','upgrade panel','main panel upgrade','100 to 200','increase service','upgrade to 200'],
    keywords: ['service upgrade','panel upgrade','200 amp','400 amp'],
    triggerWords: ['upgrade','increase','upgrade panel','new service'],
    baseLaborHrs: [8.0, 16.0],
    baseMaterialCost: [800, 2000],
    minCharge: 2500,
    materialPreview: ['200A main panel (20–40 space)','Meter base (if needed)','Service entrance cable','Ground rods & bonding','Permit fees (billed separately)'],
    scopeTemplate: 'Upgrade electrical service. Includes new panel, service entrance, meter base coordination, and permit.',
    assumptions: ['Utility coordination required','Permit and inspection required','Service drop by utility','Underground trenching not included'],
    followUps: [
      {
        id: 'size',
        label: 'Upgrade to what size?',
        options: [
          { value: '200a',  label: '200A — standard',    laborMod: 1.0, matMod: 1.0 },
          { value: '400a',  label: '400A — large home',  laborMod: 1.5, matMod: 1.8 },
          { value: 'unsure',label: '?  Advise me',       laborMod: 1.0, matMod: 1.0 }
        ]
      },
      {
        id: 'meter',
        label: 'Meter base?',
        options: [
          { value: 'keep',    label: '✓  Keep existing meter base', laborMod: 0.9, matMod: 0.85 },
          { value: 'replace', label: '🔄 Replace meter base too',   laborMod: 1.15, matAdd: 250 },
          { value: 'unsure',  label: '?  Assess on site',           laborMod: 1.0,  matMod: 1.0 }
        ]
      }
    ]
  }

]};
