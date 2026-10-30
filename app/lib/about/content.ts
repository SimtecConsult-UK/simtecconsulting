import type { FaqPair } from "../blog/types";
import { ROUTES, SECTION_IDS } from "../sections";

/**
 * The About page's copy, verbatim from the handover ("design_handoff_about_us")
 * except where its README says otherwise: "&amp;" artefacts fixed to "&", and
 * the "Our story" heading added so the page has a clean H2 structure.
 *
 * Kept in code, like the legal pages, rather than in the CMS — the copy is
 * signed off and changes rarely. Search wording for the page is still edited
 * at /admin/seo.
 */

/** Where "See our work" goes everywhere on the page. */
export const WORK_HREF = `${ROUTES.home}#${SECTION_IDS.caseStudies}`;

/** A run of text in which some pieces may be links. */
export type Rich = (string | { text: string; href: string })[];

/**
 * The founders' portraits for the "Our story" section, shown side by side in
 * this order. Width and height are each file's own pixel size; the photo is
 * shown at that shape, so keep both portraits the same shape.
 */
export const FOUNDER_PHOTOS: {
  src: string;
  name: string;
  role: string;
  width: number;
  height: number;
}[] = [
  {
    src: "/founders/joseph-osullivan.jpg",
    name: "Joseph O’Sullivan",
    role: "Founder & Managing Director",
    width: 720,
    height: 899,
  },
  {
    src: "/founders/andrew-brooks.jpg",
    name: "Andrew Brooks",
    role: "Technical architecture & engineering",
    width: 720,
    height: 899,
  },
];

/** Each section's anchor and its shorter label in the "On this page" card. */
export const ABOUT_SECTIONS = {
  story: { id: "story", label: "Our story" },
  proof: { id: "proof", label: "In practice" },
  approach: { id: "approach", label: "Our approach" },
  capabilities: { id: "capabilities", label: "What we design and build" },
  people: { id: "people", label: "The people responsible" },
  engagement: { id: "engagement", label: "How an engagement works" },
  cost: { id: "cost", label: "What does it cost?" },
  wales: { id: "wales", label: "A Welsh business" },
  faq: { id: "faq", label: "Questions worth asking" },
};

export const ABOUT_TOC = Object.values(ABOUT_SECTIONS);

/** "wide" spans both columns; "feature" also takes the tinted treatment. */
export type CardLayout = "feature" | "half" | "wide";

export const HERO = {
  title:
    "Bespoke software for businesses that need their systems to work differently.",
  lead:
    "We design and build operational software for construction, infrastructure and environmental businesses — including materials and waste management, field operations, compliance, logistics and customer portals. We also help clients create new digital services and products.",
};

export const STORY = {
  paragraphs: [
    "Simtec began because I was tired of seeing good ideas get stuck. I had spent years in the environmental laboratory industry, working with people who understood their jobs but couldn’t always change the systems holding them back.",
    "In 2021, I left a secure career and started Simtec in Wales. There were no guaranteed customers or guaranteed income. Within twelve months, we had moved house, doubled our mortgage and welcomed a new baby. It wasn’t the sensible route on paper.",
    "I didn’t take that risk because I thought the world needed another software company. I took it because I believed we could build systems around the way people actually work, rather than making people work around the software.",
    "I already knew Andrew Brooks from our time working in the same environmental laboratory business. He brought the engineering thinking that complemented my operational and commercial background. Andrew joined Simtec in March 2023, and together we developed a consultancy focused on finding a practical solution before writing a line of code.",
  ],
  quote:
    "That is still how we work: listen to the people doing the job, challenge unnecessary complexity, and design something the team can actually use.",
  attribution: "— Joseph O’Sullivan, Founder & Managing Director",
};

export const PROOF = {
  intro:
    "A claim about better software means little without a real customer example. Here are the kinds of systems we have delivered and the problems they address.",
  cards: [
    {
      title: "Materials management — SMP Alliance / Costain Group",
      badge: "Proven impact",
      layout: "feature",
      // The testimonial is not on the site yet, so its title is plain text
      // for now rather than a link to nowhere.
      body: [
        "For a materials management process, Simtec built a system that brings essential records into one place. In its published feedback, Costain’s Senior Environmental Advisor reported reduced demands on time and resources, with accurate records available to demonstrate compliance to regulators. Read the approved Costain testimonial for the full account.",
      ],
    },
    {
      title: "VertaVerse — Vertase FLI",
      layout: "half",
      body: [
        "Software connecting material movements, laboratory information, compliance records and remediation project reporting. See the live system example and the ",
        { text: "client-approved case study", href: WORK_HREF },
        " for the evidence of its impact.",
      ],
    },
    {
      title: "ConnEx — SoilEx Environmental",
      layout: "half",
      body: [
        "A connected system for waste acceptance, testing, reporting and customer-facing workflows, developed around SoilEx’s operation and extended as its requirements have evolved.",
      ],
    },
    {
      title: "CORE — Jackson Geo-Environmental & Drilling",
      layout: "wide",
      body: [
        "Software supporting day-to-day project processes, business records and compliance activity. Jackson reported positive recognition of CORE during ISO recertification.",
      ],
    },
  ] satisfies {
    title: string;
    badge?: string;
    layout: CardLayout;
    body: Rich;
  }[],
  ctaLink: "See our work and the verified customer results.",
};

export const APPROACH = {
  title: "Useful software should make work easier, not just move paperwork online.",
  paragraphs: [
    "We often describe software as communication on steroids: get the right information to the right people at the right time, and make it easier to act on it.",
    "A site operative records a movement once. The relevant office team can review it. A customer can see the information they are authorised to see. A manager can make a decision without waiting for three spreadsheets to be reconciled. That’s more useful than a digital filing cabinet.",
    "And if people struggle with a system, we look at the design before blaming the users. During discovery we map real tasks and documents with the people who perform them, review prototypes with customer representatives, then test actual workflows before acceptance. Exactly which users participate and when is agreed for each project.",
  ],
};

export const CAPABILITIES = {
  intro:
    "Our strongest delivered experience is in environmental and materials workflows, operational records, field reporting, logistics, customer portals and business integrations. The following are examples of requirements we can design for — not a catalogue of twenty products ready to switch on.",
  groups: [
    {
      title: "Project & field work",
      items: [
        "Project & Job Management",
        "Planning & Scheduling",
        "Emergency Call-Out Management",
        "Site Diaries & Field Reporting",
        "Mobile Operative & Driver Workflows",
      ],
    },
    {
      title: "Fleet, assets & logistics",
      items: [
        "Dispatch & Logistics",
        "Plant, Equipment & Asset Tracking",
        "Maintenance & Servicing Records",
        "Vehicle Safety Checks",
      ],
    },
    {
      title: "Compliance & environment",
      items: [
        "HSEQ Management",
        "Waste & Materials Tracking",
        "Environmental & Carbon Reporting",
      ],
    },
    {
      title: "Commercial & customers",
      items: [
        "Quotes, POs & Applications for Payment",
        "Field-to-Invoice Workflows",
        "Client Portals",
        "Automated Forms, PDFs & Notifications",
      ],
    },
    {
      title: "People & integrations",
      layout: "wide",
      items: [
        "Timesheets & Labour Capture",
        "Training & Certification Management",
        "Recruitment & Applicant Tracking",
        "System Integrations",
      ],
    },
  ] satisfies { title: string; layout?: CardLayout; items: string[] }[],
  note:
    "We use knowledge from existing projects and reusable engineering components where sensible. Your system is still scoped to your workflows and requirements — we do not claim to have delivered every combination above.",
};

export const PEOPLE = [
  "Joe leads the initial commercial conversation, discovery and solution direction. Andrew leads technical architecture and engineering oversight. Our wider team supports project management, development, testing and support. Your proposal and kick-off identify the day-to-day contact, decision-makers, acceptance owner and escalation route so you know who is responsible for what.",
  "We won’t simply say yes to every feature. If a simpler integration or an existing tool would solve the problem, we will discuss it. If we disagree with a requirement, we will explain why — and listen when you disagree with us.",
];

export const ENGAGEMENT = {
  steps: [
    {
      title: "Talk",
      body: "A free initial conversation to understand the problem and establish whether bespoke software is a sensible option. No specification required.",
    },
    {
      title: "Discover",
      body: "If there is a fit, we ask for a structured overview of users, documents, data, workflows and integrations, then work through the detail with your team.",
    },
    {
      title: "Define",
      body: "We prepare a proposed scope, then a formal priced proposal setting out inclusions, exclusions, milestones, customer inputs, delivery roles, acceptance criteria, support and recurring costs.",
    },
    {
      title: "Design, build and test",
      body: "We demonstrate work as it develops. Your nominated users review key journeys and participate in agreed user acceptance testing. Scope changes are assessed for cost and timing before approval.",
    },
    {
      title: "Launch and support",
      body: "We plan migration, onboarding and go-live against the agreed scope, with hypercare and ongoing support defined in the engagement documents.",
    },
  ],
  callout:
    "If something goes off track, your named project contact raises it, explains its impact, and brings options for a decision. We agree changes and responsibilities in writing rather than treating every new request as automatically included.",
};

export const COST = {
  tiles: [
    { label: "Many initial projects", value: "around £40,000" },
    { label: "Focused projects", value: "around 8–12 weeks" },
  ],
  paragraphs: [
    "Many initial projects are around £40,000, although the price can be lower or significantly higher depending on complexity. This is a reference point, not a package or a promise of specific features for that amount. A typical scoped proposal covers the agreed discovery/design activities, development, project coordination, testing and launch deliverables as expressly listed; integrations, migration and training are included only where specified. Ongoing hosting, maintenance and support are quoted separately.",
    "Focused projects can take around 8–12 weeks once work starts, but timing depends on the scope, integrations, customer availability and agreed milestones. We set the actual plan in the proposal.",
  ],
  cta: "Want a view on your project?",
};

export const WALES =
  "We are proud to have started Simtec in Wales and to work with organisations solving difficult operational problems. We want to see more businesses — especially across construction and environmental services — get more value from the information they already collect. We also back opportunities in our community, including support for women’s rugby league in Wales.";

export const FAQS: FaqPair[] = [
  {
    q: "Do you own my data or source code?",
    a: "Your agreement sets out your rights to business data and any bespoke or pre-existing software components, as well as licensing. We explain this before you commit; we don’t assume all intellectual property transfers without qualification.",
  },
  {
    q: "Could I move away from Simtec later?",
    a: "Data export, handover, third-party access and any transition assistance are matters we can plan and document in the agreement. Ask us to include explicit exit requirements in the scope.",
  },
  {
    q: "Where is the system hosted, and how is it protected?",
    a: "Hosting location, access controls, backups, incident response and recovery requirements are confirmed for each system and recorded in the proposal or supporting technical documentation. We won’t claim the same arrangements fit every customer.",
  },
  {
    q: "What if requirements change or a deadline slips?",
    a: "There is a defined point of contact, agreed change process, delivery milestones and acceptance criteria. We assess any change in price or schedule before approval and raise delays with their consequences and options.",
  },
  {
    q: "Can I see real software?",
    a: "Yes — we can share suitable approved screenshots, case studies and demonstrations, subject to customer permissions and commercial confidentiality.",
  },
  {
    q: "What happens after launch?",
    a: "The proposal sets out hypercare and ongoing hosting/support arrangements, including how fixes, incidents, changes and new development are handled.",
  },
  {
    q: "What do I receive after the first conversation?",
    a: "We discuss whether there is a fit. More detailed discovery leads to a proposed scope and, once aligned, a formal quote with deliverables, responsibilities and ongoing charges.",
  },
];

export const CLOSING = {
  title: "Have a problem to solve — or an idea worth exploring?",
  body: "Tell us what is getting in the way. We will ask questions, share a practical view on the options and tell you whether we think we can help.",
};
