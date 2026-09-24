/**
 * Homepage case studies.
 *
 * The shape here mirrors the CMS "Case Study" content model one-to-one, so the
 * section can later read the same fields from a CMS without the component
 * changing. Field names and the character limits in the comments come from the
 * handover; the limits are what the CMS editor will enforce, and keeping to
 * them here keeps the rendered heights in the range the design was drawn for.
 *
 * The section renders up to MAX_HOMEPAGE_CASE_STUDIES of these, in array order.
 */

/**
 * One chapter tab. In the CMS this is a single rich-text field storing
 * `<p>` / `<ul>` / `<li>`, split at render time into the paragraphs before the
 * list, the bullets, and the paragraphs after it — which is exactly these three
 * keys. Total text across all three is capped at 1,200 characters per chapter.
 */
export type CaseStudyChapter = {
  /** Paragraphs above the bullets. */
  paragraphs: string[];
  /** One flat list. The section splits it into columns itself — never author columns. */
  bullets: string[];
  /** Paragraphs below the bullets. */
  closing: string[];
};

export type CaseStudy = {
  /** Stable key. Becomes the CMS record id. */
  id: string;
  /** Short client name in the switcher. Max 22 chars — must fit one line on tablet. */
  tabLabel: string;
  /** The section H2. Max 70 chars — wraps to at most 2 lines on a laptop. */
  headline: string;
  /** "Client" in the details bar. Max 40. */
  clientName: string;
  /** "System" in the details bar. Max 40. */
  systemName: string;
  /** "Project type" in the details bar. Max 120. */
  projectType: string;
  /**
   * Colour logo on a transparent background — it sits on white and on #f3f5ff.
   * `width`/`height` are the file's own pixel size, passed to the `<img>` as the
   * intrinsic-ratio hint; CSS still does the sizing.
   */
  logo: { src: string; width: number; height: number };
  /** Screen recording: 16:9, muted, loops. */
  video: string;
  /** Shown before play, on reduced motion and on slow connections. */
  videoPoster?: string;
  /**
   * The quote, without quote marks — the design adds them. Max 260 chars.
   * A blank line starts a new paragraph in the card.
   */
  quote: string;
  /**
   * Shown in capitals under the quote, e.g. "Tina · Compli Digital". Max 40.
   * Leave the name out rather than inventing one; the company alone reads fine.
   */
  quoteAttribution: string;
  chapters: {
    summary: CaseStudyChapter;
    problem: CaseStudyChapter;
    solution: CaseStudyChapter;
    value: CaseStudyChapter;
  };
};

/** The switcher is drawn for at most three clients. */
export const MAX_HOMEPAGE_CASE_STUDIES = 3;

/** Fixed in the design, not editable in the CMS. */
export const CHAPTERS = [
  { key: "summary", label: "Summary" },
  { key: "problem", label: "Problem" },
  { key: "solution", label: "Solution" },
  { key: "value", label: "Intended Value" },
] as const;

export type ChapterKey = (typeof CHAPTERS)[number]["key"];

/** Open on load, on every breakpoint. */
export const DEFAULT_CHAPTER: ChapterKey = "solution";

/**
 * Stand-in recording used across the site until each client's own screen
 * capture is ready. Swapping it is a one-line change per case study.
 */
const PLACEHOLDER_VIDEO = "/video1-section1.webm";

const compliDigital: CaseStudy = {
  id: "compli-digital",
  tabLabel: "Compli Digital",
  headline: "Compliance, reporting and best practice for the waste sector.",
  clientName: "Compli Digital Ltd",
  systemName: "Compli Digital / TCMF System",
  projectType:
    "Waste management compliance platform / TCM reporting portal / client portal / knowledge-sharing platform",
  logo: { src: "/logos/compli-digital-color.png", width: 281, height: 218 },
  video: PLACEHOLDER_VIDEO,
  quote:
    "Compli Digital is about more than digitising compliance. It gives TCMs and waste professionals a place to manage reporting, share knowledge, promote best practice and support better standards across the industry.",
  quoteAttribution: "Tina · Compli Digital",
  chapters: {
    summary: {
      paragraphs: [
        "Compli Digital is a software, compliance and knowledge-sharing platform designed specifically for the waste management industry.",
        "It helps waste operators, Technical Competent Managers and clients move away from fragmented paper records, spreadsheets and emails by bringing site reporting, compliance tasks, operational checks, client visibility, knowledge sharing and best practice into one digital platform.",
        "Tina’s vision was to create more than a reporting tool. The platform is designed to support better compliance management, better access to information and better sharing of knowledge across the waste sector.",
      ],
      bullets: [],
      closing: [],
    },
    problem: {
      paragraphs: [
        "The waste sector relies on accurate records, repeatable checks, evidence capture, environmental task tracking and audit-ready reporting.",
        "For many operators and TCMs, this information is often managed through paper records, spreadsheets, emails and disconnected documents. This makes it harder to keep information consistent, track actions, manage site activity and give clients clear visibility of what has been done.",
        "Compli Digital needed a platform that could support both the practical compliance workflows of TCMs and the wider goal of improving knowledge sharing and best practice across the industry.",
        "The main challenges included:",
      ],
      bullets: [
        "Replacing paper records, spreadsheets and email trails",
        "Supporting TCMs working across multiple clients and sites",
        "Creating flexible report templates for different checks and site types",
        "Managing site reports, actions, evidence and follow-up tasks",
        "Giving clients clear access to reports, dashboards and outstanding actions",
        "Supporting mobile use for users working on site",
        "Creating a central place for TCMs to share knowledge and best practice",
        "Building a scalable platform for the waste management industry",
      ],
      closing: [],
    },
    solution: {
      paragraphs: [
        "Simtec developed a custom digital platform for Compli Digital, designed around the needs of waste-sector operators, TCMs and their clients.",
        "The system combines a professional web forum, reporting portal and client portal in one platform. Users can create and manage reports, build templates, assign actions, upload evidence, export reports and give clients controlled access to relevant site information.",
        "The platform also includes a knowledge-sharing area where TCMs and waste professionals can ask questions, share practical experience and promote best practice.",
        "The system supports:",
      ],
      bullets: [
        "Professional TCM forum",
        "Topic-based discussions",
        "Searchable posts and tags",
        "Bookmarked content",
        "Pinned best-practice updates",
        "Report template builder",
        "Site report creation",
        "Client and site management",
        "Action tracking",
        "Evidence uploads",
        "Client dashboards",
        "Site data exports",
        "Time-on-site tracking",
        "Client portal access",
        "User permissions and administration",
        "Audit logging",
        "Mobile-first access for users working on site",
      ],
      closing: [],
    },
    value: {
      paragraphs: ["The intended value is to help Compli Digital:"],
      bullets: [
        "Give waste operators one digital place to manage compliance activity",
        "Help TCMs create reports, manage actions and capture evidence more consistently",
        "Give clients clearer access to reports, site information and outstanding actions",
        "Reduce reliance on paper, spreadsheets and email trails",
        "Support audit-ready compliance management",
        "Create a professional knowledge-sharing space for the waste sector",
        "Promote best practice across TCMs, operators and clients",
        "Build a scalable platform that can grow with the business",
      ],
      closing: [],
    },
  },
};

const jacksonGeoServices: CaseStudy = {
  id: "jackson-geo-services",
  tabLabel: "Jackson Geo-Services",
  headline: "Simtec made 100% growth in 12 months possible.",
  clientName: "Jackson Geo-Services Ltd",
  systemName: "CORE",
  projectType:
    "Operational management / H&S / scheduling / training / plant / project management system",
  // The colour mark, not the white one in /logos/jackson-geo-services.svg —
  // that one is for the dark hero band and is invisible on this section's white.
  logo: { src: "/logos/jackson-geo-services-color.svg", width: 470, height: 166 },
  video: PLACEHOLDER_VIDEO,
  quote:
    "Creating a holistic business management system has been my dream for a decade.\n\nSimtec helped us turn that dream into reality.",
  // The speaker's name is still to be confirmed, so the company stands alone
  // rather than shipping a placeholder name to the homepage.
  quoteAttribution: "Jackson Geo-Services",
  chapters: {
    summary: {
      paragraphs: [
        "CORE is a central operational management system designed to help Jackson manage key business workflows in one connected platform.",
        "The system brings together project management, H&S, scheduling, training, plant, enquiries and operational data, giving the team better visibility, more consistent information and a stronger foundation for growth.",
      ],
      bullets: [],
      closing: [],
    },
    problem: {
      paragraphs: [
        "Before CORE, Jackson had a growing business with multiple operational areas that needed to be managed consistently across teams, projects and departments.",
        "As the business scaled, it became harder to rely on separate spreadsheets, manual processes, disconnected systems and knowledge held by individuals. Key information around projects, plant, training, scheduling, H&S and enquiries needed to be easier to capture, manage and access.",
        "The main challenges included:",
      ],
      bullets: [
        "Managing project information across multiple teams",
        "Keeping operational data consistent",
        "Tracking H&S information and actions",
        "Managing scheduling and resource planning",
        "Tracking training, competencies and certification",
        "Managing plant and equipment visibility",
        "Handling enquiries and project information in a structured way",
        "Reducing reliance on spreadsheets and manual admin",
        "Giving management better visibility across the business",
        "Creating a system that could support growth",
      ],
      closing: [],
    },
    solution: {
      paragraphs: [
        "CORE helps Jackson manage key operational workflows through one integrated system.",
        "The platform gives teams a central place to manage projects, actions, scheduling, H&S, training, plant, enquiries and wider operational information. By standardising how data is captured and shared, CORE helps create a more consistent way of working across the business.",
        "The system supports:",
      ],
      bullets: [
        "Project and operational management",
        "H&S workflows and records",
        "Scheduling and planning",
        "Training and certification tracking",
        "Plant and equipment management",
        "Enquiry and opportunity management",
        "Project records and status tracking",
        "Dashboards and management visibility",
        "Standardised data capture",
        "Reduced reliance on disconnected spreadsheets",
      ],
      closing: [
        "Rather than forcing Jackson into a rigid off-the-shelf platform, CORE was developed around the way the business actually operates and the workflows needed to support continued growth.",
      ],
    },
    value: {
      paragraphs: [
        "CORE has helped Jackson create a more connected and scalable operational structure.",
        "By bringing key workflows into one system, the business has improved visibility, reduced fragmentation and created a stronger foundation for managing growth. Teams can access information more consistently, managers have a clearer view of what is happening across the business, and operational processes are better standardised.",
        "The impact includes:",
      ],
      bullets: [
        "Improved visibility across projects, teams and departments",
        "More consistent operational data",
        "Reduced reliance on spreadsheets and manual processes",
        "Better tracking of H&S, training, plant and project information",
        "Clearer scheduling and resource planning",
        "Improved management oversight",
        "Stronger internal processes to support business growth",
        "A more scalable way to manage operational information",
      ],
      closing: [
        "CORE has helped Jackson move from disconnected information and manual workflows towards a more structured, integrated and data-led way of operating.",
      ],
    },
  },
};

/**
 * Homepage order. Add a third entry here when its copy, logo and recording are
 * ready — the switcher, the phone logo tiles and the details bar all follow the
 * length of this array, so nothing else needs touching.
 */
export const caseStudies: CaseStudy[] = [compliDigital, jacksonGeoServices];

/** Splits a quote into its paragraphs on blank lines. */
export function quoteParagraphs(quote: string): string[] {
  return quote
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
