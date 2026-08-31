// Discovery Workshop Wizard — question schema.
// Ported from design_handoff_discovery_wizard/reference/Discovery Wizard.dc.html (the `DEF` array).
// Copy, options, column definitions and conditional (`showIf`) rules are transcribed verbatim.

import { MODULE_CATALOG, type ModuleCatalogEntry, type ModuleCategory } from "../lib/moduleCatalog";

export type Answers = Record<string, string | string[] | undefined>;

export type RepRow = Record<string, string | string[]>;

export type RepColumn = {
  key: string;
  header: string;
  placeholder?: string;
  width?: string;
  chips?: boolean;
  /** Render this cell as a link input with an inline "upload a file instead"
   * button — either fills the same `key` value (a pasted URL or an uploaded
   * filename). The renderer also stamps a structural `__<key>Kind: "link" |
   * "file"` field on the row recording which one produced the value, so a
   * later feature (e.g. a link icon vs. a file icon) can tell them apart
   * instead of guessing from the string's shape. */
  linkOrFile?: boolean;
  /** Render this cell as a dropdown with these fixed options. */
  options?: string[];
  /** Render this cell as a dropdown whose options are computed from the
   * current answers, rep rows, and the row itself (e.g. the modules
   * selected earlier in the form, another rep question's entries — like
   * user roles — or just the modules belonging to this row's own group). */
  dynamicOptions?: (answers: Answers, repRows: Record<string, RepRow[]>, row: RepRow) => string[];
  /** Render the options/dynamicOptions dropdown as a multi-select (a popover
   * of checkable options) instead of a single native `<select>`. The cell's
   * value becomes a string[]. */
  multiSelect?: boolean;
};

export type GroupField = {
  key: string;
  label: string;
  placeholder?: string;
};

export type ModuleGroup = {
  header: string;
  options: string[];
};

export type QuestionType = "text" | "number" | "long" | "choice" | "multi" | "group" | "rep" | "groupedMulti";

export type NeedHelp = {
  whatToInclude: string;
  whyWeAsk: string;
  whoMayKnow: string;
};

export type Question = {
  id: string;
  type: QuestionType;
  label: string;
  help?: string;
  /** Optional "Need help?" panel — collapsed by default, expanded beneath the
   * question. Omit for obvious fields (name, email, phone, etc.). */
  needHelp?: NeedHelp;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  /** multi only: compute the option list from other answers instead of the
   * fixed `options` list — e.g. mirroring another multi-select's current
   * selection (chips selected there reappear here as choosable options). */
  dynamicOptions?: (answers: Answers) => string[];
  fields?: GroupField[];
  columns?: RepColumn[];
  addLabel?: string;
  showIf?: (answers: Answers) => boolean;
  /** groupedMulti only: module groups, one per `filterBy` option. */
  groups?: ModuleGroup[];
  /** groupedMulti only: id of the multi-select question whose selected
   * values decide which `groups` (matched by header) are shown. */
  filterBy?: string;
  /** rep only: pre-populate/re-sync rows from other answers instead of two blanks. */
  getDefaultRows?: (answers: Answers) => RepRow[];
  /** rep only: row key holding the group header to section rows under. */
  groupRowsBy?: string;
  /** rep only: every header that should always get its own section (even
   * with zero rows), given the current answers. Without this, a group with
   * no rows yet simply wouldn't appear. */
  groupHeadersFor?: (answers: Answers) => string[];
  /** rep only: when set (and `required`), every row must have text in all of
   * these columns for the question to count as answered — instead of the
   * default "at least one cell somewhere has text". */
  requiredColumns?: string[];
  /** rep only: the columns `getDefaultRows` itself fills in. A generated row
   * with text in any OTHER column has been hand-edited, so reconciliation
   * keeps it even after its source selection is removed — otherwise going
   * back and deselecting the thing that generated a row would silently
   * delete whatever the user typed into it. */
  seedColumns?: string[];
  /** rep only: removing a generated row (identified by its `__key`) needs to
   * turn off whatever answer produced it — otherwise `getDefaultRows` would
   * just regenerate it on the next render, making the remove button on a
   * generated row a no-op. Returns the updated answers. */
  removeSource?: (row: RepRow, answers: Answers) => Answers;
};

export type Section = {
  name: string;
  shortName: string;
  description: string;
  questions: Question[];
};

// Every {system, module} pair where BOTH the system (`primarySystemType`)
// and the module (`selectedModules`) are currently selected — the shared
// traversal behind `defaultProposedModuleRows` and `selectedModuleHeaders`.
// `selectedModules` isn't pruned when a system is later deselected, so this
// dual check (not just `selectedModules` alone) is what keeps orphaned
// modules from a deselected system out of both.
function selectedModuleEntries(answers: Answers): { group: ModuleCategory; module: ModuleCatalogEntry }[] {
  const selectedSystems = (answers.primarySystemType as string[] | undefined) || [];
  const selectedModules = (answers.selectedModules as string[] | undefined) || [];
  const entries: { group: ModuleCategory; module: ModuleCatalogEntry }[] = [];
  MODULE_CATALOG.forEach((group) => {
    if (!selectedSystems.includes(group.header)) return;
    group.modules.forEach((m) => {
      if (selectedModules.includes(m.name)) entries.push({ group, module: m });
    });
  });
  return entries;
}

// One row per module selected in `selectedModules`, sectioned by system in
// `MODULE_CATALOG` order, with title/description pre-filled from the catalog.
// Structural fields (things the renderer needs, not user-typed answers) are
// `__`-prefixed, matching `__key`'s existing convention — see `hasNonKeyValue`.
export function defaultProposedModuleRows(answers: Answers): RepRow[] {
  return selectedModuleEntries(answers).map(({ group, module: m }) => ({
    __key: `${group.header}::${m.name}`,
    __group: group.header,
    moduleTitle: m.name,
    description: m.description,
  }));
}

// One row per role selected in `dayOneUsers` (question 19), so question 20
// starts pre-seeded with a row per day-one user type instead of blank rows.
export function defaultUserRoleRows(answers: Answers): RepRow[] {
  const roles = (answers.dayOneUsers as string[] | undefined) || [];
  return roles.map((role) => ({
    __key: `role::${role}`,
    userType: role,
  }));
}

// Removing a generated `userRoles` row un-selects its role back in
// `dayOneUsers` — the row exists because that box is checked, so without
// this the row would just reappear on the next render.
export function removeUserRoleSource(row: RepRow, answers: Answers): Answers {
  const key = row.__key as string | undefined;
  const role = key?.startsWith("role::") ? key.slice("role::".length) : undefined;
  if (!role) return answers;
  return { ...answers, dayOneUsers: ((answers.dayOneUsers as string[] | undefined) || []).filter((r) => r !== role) };
}

// Unique, non-empty user types typed into `userRoles` (question 20), used as
// dropdown options anywhere else in the form that references "who" (e.g. the
// dashboards/reports audience column). Excludes the literal "Other" row that
// `defaultUserRoleRows` seeds from the `dayOneUsers` catch-all checkbox — it's
// a placeholder, not a real named user type, until someone renames it.
export function userRoleOptions(repRows: Record<string, RepRow[]>): string[] {
  const rows = repRows.userRoles || [];
  const seen = new Set<string>();
  rows.forEach((row) => {
    const value = row.userType;
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (trimmed && trimmed !== "Other") seen.add(trimmed);
  });
  return Array.from(seen);
}

// Every module the user picked in `selectedModules` — used to section
// per-module rep tables (e.g. dashboards/reports) so each module gets its
// own group of rows, the same way `primarySystemTypeHeaders` sections
// per-system tables.
export function selectedModuleHeaders(answers: Answers): string[] {
  return selectedModuleEntries(answers).map(({ module }) => module.name);
}

// Modules belonging to just one system-type group (e.g. the group a
// `repetitiveTasks` row is grouped under) — narrower than the flat
// `selectedModules` list, so a row grouped under one system can't be tagged
// with a module that actually belongs to a different system. Falls back to
// the flat list when there's no group to scope by (e.g. a row from before
// this column existed).
export function modulesForGroup(answers: Answers, group: string | undefined): string[] {
  const allSelected = (answers.selectedModules as string[] | undefined) || [];
  if (!group) return allSelected;
  return selectedModuleEntries(answers)
    .filter((entry) => entry.group.header === group)
    .map((entry) => entry.module.name);
}

// Every system the user picked in `primarySystemType` (question 29) should
// always get its own section in any rep table grouped by system, even
// before it has any rows — otherwise a system with nothing pre-picked would
// never get a place to add its first one.
export function primarySystemTypeHeaders(answers: Answers): string[] {
  const selectedSystems = (answers.primarySystemType as string[] | undefined) || [];
  return MODULE_CATALOG.map((g) => g.header).filter((h) => selectedSystems.includes(h));
}

// A `getDefaultRows` for grouped rep tables that want every section to open
// with an editable row already waiting instead of starting empty (the plain
// "start empty, rely on + Add" behaviour every other grouped table uses) —
// used by `documentsCreated` (question 47) and `filesToStore` (question 50),
// both grouped by `primarySystemTypeHeaders`.
export function blankRowPerGroup(headersFor: (answers: Answers) => string[]) {
  return (answers: Answers): RepRow[] =>
    headersFor(answers).map((header) => ({ __key: `blank::${header}`, __group: header }));
}

// The "who's involved" + "which module" pair shared by every automation
// table grouped by system type (`repetitiveTasks`, `repeatedEmails`,
// `repeatedDocuments`) — each just adds its own subject and trigger columns
// around this pair, so it's defined once here instead of copy-pasted per
// question.
function stakeholderAndModulesColumns(): RepColumn[] {
  return [
    { key: "stakeholder", header: "Stakeholder", placeholder: "Select", width: ".5fr", options: ["Internal", "External"] },
    {
      key: "modules",
      header: "Modules",
      placeholder: "Select module",
      dynamicOptions: (answers, _repRows, row) => modulesForGroup(answers, row.__group as string | undefined),
    },
  ];
}

// Trailing "who signs off on this" column shared by the same three
// automation tables — appended after each table's own trigger column.
const APPROVAL_COLUMN: RepColumn = { key: "approval", header: "Approval", placeholder: "Select", width: ".7fr", options: ["Human", "Auto", "Not sure"] };

// The "what it shows" + "link or uploaded file" pair shared by the Links and
// Document uploads tables — each just uses its own row-data key names around
// this shared shape, so it's defined once here instead of copy-pasted per
// question.
function descriptionAndLinkColumns(descriptionKey: string, linkKey: string): RepColumn[] {
  return [
    { key: descriptionKey, header: "Document description", placeholder: "What it shows", width: "1.4fr" },
    { key: linkKey, header: "Link / Upload doc", linkOrFile: true },
  ];
}

export const SECTIONS: Section[] = [
  {
    name: "Project Basics",
    shortName: "Project basics",
    description: "Capture client, project and commercial/timing context.",
    questions: [
      { id: "company", type: "text", label: "Company", placeholder: "Company name", required: true },
      { id: "contactName", type: "text", label: "Contact name", placeholder: "Full name", required: true },
      { id: "contactRole", type: "text", label: "Contact role/title", placeholder: "e.g. Operations Director" },
      { id: "email", type: "text", label: "Email", placeholder: "name@company.co.uk", required: true },
      { id: "phone", type: "text", label: "Phone", placeholder: "Best number to reach you" },
      { id: "projectName", type: "text", label: "Project name", placeholder: "e.g. Job management system", required: true },
      { id: "projectType", type: "choice", label: "Project type", required: true, options: ["New system", "Replacement", "Enhancement", "Automation", "Reporting/dashboard", "AI/document automation", "Not sure"] },
      { id: "targetGoLive", type: "text", label: "Target go-live", placeholder: "Date, quarter — or TBC" },
      { id: "budgetRange", type: "choice", label: "Budget range", help: "Not binding — it helps us size Phase 1 sensibly.", options: ["£10k–£20k", "£20k–£50k", "£50k–£100k", "£100k+"] },
      { id: "ndaRequired", type: "choice", label: "NDA required?", options: ["Yes", "No", "Not sure"] },
      {
        id: "clientProjectLead",
        type: "group",
        label: "Client project lead",
        help: "If someone else will run the project day to day. N/A is fine.",
        fields: [
          { key: "name", label: "Name" },
          { key: "title", label: "Title" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
        ],
      },
    ],
  },
  {
    name: "Business Context",
    shortName: "Business context",
    description: "Understand the business background and why the project matters.",
    questions: [
      {
        id: "businessDescription",
        type: "long",
        label: "What does your business do?",
        placeholder: "A sentence or two is plenty…",
        needHelp: {
          whatToInclude: "Briefly explain the services you provide, who your customers are and the type of work this system will support.",
          whyWeAsk: "This helps us understand the setting in which the system will be used.",
          whoMayKnow: "The business owner, Managing Director, Operations Manager or Sales Manager.",
        },
      },
      {
        id: "problem",
        type: "long",
        label: "What is the main problem you want this system to solve?",
        required: true,
        placeholder: "",
        needHelp: {
          whatToInclude: "Describe the main issue in plain English and how it affects the business.",
          whyWeAsk: "This keeps the project focused on solving the right problem.",
          whoMayKnow: "The project lead, department manager or people affected by the problem.",
        },
      },
      {
        id: "trigger",
        type: "long",
        label: "What has made this a priority now?",
        required: true,
        help: "Bullet points are fine.",
        placeholder: "",
        needHelp: {
          whatToInclude: "Tell us what has changed or happened. For example, business growth, a lost contract, new rules, system failure or increasing administration.",
          whyWeAsk: "This helps us understand the urgency and any deadlines affecting the project.",
          whoMayKnow: "The project lead, business owner, Operations Manager or Compliance Manager.",
        },
      },
      {
        id: "painPoints",
        type: "long",
        label: "Where does the current way of working cause problems?",
        required: true,
        help: "Bullet points are fine.",
        placeholder: "e.g. double data entry, chasing paperwork, no live status…",
        needHelp: {
          whatToInclude: "List the delays, mistakes, repeated work and frustrations people currently experience.",
          whyWeAsk: "These are the problems the new system should remove or reduce.",
          whoMayKnow: "The people doing the work day to day, their manager and anyone who checks or reports on it.",
        },
      },
      {
        id: "costOfInaction",
        type: "long",
        label: "What will happen if the problem is not fixed?",
        placeholder: "",
        needHelp: {
          whatToInclude: "Describe the likely effect on time, cost, customers, compliance, safety or business growth.",
          whyWeAsk: "This helps us understand the importance of the project and which risks should be addressed first.",
          whoMayKnow: "The business owner, Finance Director, Operations Manager or Compliance Manager.",
        },
      },
      {
        id: "successDefinition",
        type: "long",
        label: "What should be better 3-6 months after the system launches?",
        required: true,
        help: "Bullet points are fine.",
        placeholder: "",
        needHelp: {
          whatToInclude: "Describe what people should be able to do more quickly, easily or accurately.",
          whyWeAsk: "This gives the project a clear result to work towards.",
          whoMayKnow: "The project lead, senior management and the people who will use the system.",
        },
      },
      {
        id: "successMetrics",
        type: "long",
        label: "How will you know the project has worked?",
        help: "Bullet points are fine. Enter TBC if you are unsure.",
        placeholder: "",
        needHelp: {
          whatToInclude: "Add any numbers or evidence you can use, such as time saved, fewer errors, faster invoicing or less paperwork.",
          whyWeAsk: "This allows us to check whether the system has delivered the expected improvement.",
          whoMayKnow: "The project lead, Finance team, Operations Manager or department manager.",
        },
      },
    ],
  },
  {
    name: "Users and Access",
    shortName: "Users & access",
    description: "Identify who uses the system and what permissions are needed.",
    questions: [
      {
        id: "dayOneUsers",
        type: "multi",
        label: "Who will use the system when it first launches?",
        required: true,
        options: ["Admin", "Manager", "Director", "Office", "Site", "Field", "Client", "Consultant", "Supplier", "Finance", "Other"],
        needHelp: {
          whatToInclude: "Select every type of person who will need access from the start.",
          whyWeAsk: "Different users may need different screens, tasks and levels of access.",
          whoMayKnow: "The project lead, department managers, HR or IT.",
        },
      },
      {
        id: "userRoles",
        type: "rep",
        label: "What types of users will there be?",
        required: true,
        addLabel: "Add user type",
        needHelp: {
          whatToInclude: "Add one row for each type of user, such as Administrator, Site Manager, Driver or Customer. Describe what they need to do and the access they require. Do not list individual people.",
          whyWeAsk: "This helps us give each user the correct tools and access.",
          whoMayKnow: "Department managers, HR, IT and the people doing the work.",
        },
        getDefaultRows: defaultUserRoleRows,
        seedColumns: ["userType"],
        requiredColumns: ["userType", "mainTasks", "accessLevel"],
        removeSource: removeUserRoleSource,
        columns: [
          { key: "userType", header: "User type", placeholder: "e.g. Site manager" },
          { key: "internalExternal", header: "Internal/external", placeholder: "Select", options: ["Internal", "External"] },
          { key: "mainTasks", header: "Main tasks", placeholder: "What they do in the system", width: "1.4fr" },
          { key: "accessLevel", header: "Access level", placeholder: "Select", options: ["Full", "Read-only"] },
        ],
      },
      {
        id: "external",
        type: "choice",
        label: "Will anyone outside your business need access?",
        required: true,
        options: ["Yes", "No", "Possibly later"],
        needHelp: {
          whatToInclude: "Select 'Yes' if customers, suppliers, subcontractors or consultants need to log in. Select 'Possibly later' if this is not required for the first version.",
          whyWeAsk: "External users normally need different access, security and screens.",
          whoMayKnow: "The project lead, Account Manager, Operations Manager or IT.",
        },
      },
      {
        id: "permissionRestrictions",
        type: "long",
        label: "Is there anything certain users must not see or change?",
        placeholder: "",
        needHelp: {
          whatToInclude: "Describe any private information, restricted actions or records that should only be available to specific people.",
          whyWeAsk: "This helps protect sensitive information and prevents unauthorised changes.",
          whoMayKnow: "Department managers, HR, Finance, Compliance or IT.",
        },
      },
    ],
  },
  {
    name: "Current Process / Workflow Overview",
    shortName: "Current workflow",
    description: "Capture the real workflow from start to finish.",
    questions: [
      {
        id: "mainProcess",
        type: "long",
        label: "What main piece of work should the system manage?",
        required: true,
        placeholder: "",
        needHelp: {
          whatToInclude: "Briefly describe the process from the first request or action through to completion.",
          whyWeAsk: "This identifies the main journey the system needs to support.",
          whoMayKnow: "The Operations Manager, process owner or people completing the work.",
        },
      },
      {
        id: "processStart",
        type: "text",
        label: "What starts the process?",
        required: true,
        placeholder: "e.g. Enquiry arrives by email",
        needHelp: {
          whatToInclude: "Tell us the first event or request. For example, a customer enquiry, new order, site instruction or uploaded document.",
          whyWeAsk: "The system needs a clear starting point for each new piece of work.",
          whoMayKnow: "Sales, Operations, Customer Service or the person who receives the initial request.",
        },
      },
      {
        id: "processEnd",
        type: "text",
        label: "When is the process considered complete?",
        placeholder: "e.g. Invoice paid",
        needHelp: {
          whatToInclude: "Describe the final action, such as approval, delivery, report issued, job closed or invoice paid.",
          whyWeAsk: "This tells us what 'finished' means and what must happen before a record can be closed.",
          whoMayKnow: "Operations, Finance, the department manager or the process owner.",
        },
      },
      {
        id: "workflowSteps",
        type: "rep",
        label: "List the steps in the current process.",
        required: true,
        addLabel: "Add step",
        needHelp: {
          whatToInclude: "Add each step in the order it happens. For every step, tell us what happens, who does it, what tool they use and any current problems.",
          whyWeAsk: "This allows us to understand the real process before deciding how the new system should work.",
          whoMayKnow: "The people completing each step and the manager responsible for the full process.",
        },
        columns: [
          { key: "stepNumber", header: "No.", placeholder: "1", width: "48px" },
          { key: "stepName", header: "Step name", placeholder: "e.g. Quote" },
          { key: "whatHappens", header: "What happens", placeholder: "", width: "1.3fr" },
          { key: "whoDoesIt", header: "Who does it", placeholder: "" },
          { key: "currentTool", header: "Current tool", placeholder: "e.g. Excel", width: ".8fr" },
          { key: "painPoint", header: "Pain point", placeholder: "" },
        ],
      },
      {
        id: "processBreakdown",
        type: "long",
        label: "Where do delays, mistakes or problems usually happen?",
        required: true,
        placeholder: "",
        needHelp: {
          whatToInclude: "Tell us which steps cause waiting, rework, missed information, complaints or errors.",
          whyWeAsk: "These are the areas the new system should improve first.",
          whoMayKnow: "Day-to-day users, supervisors, customers and anyone who checks the completed work.",
        },
      },
      {
        id: "manualOrRepeated",
        type: "long",
        label: "What work is completed manually or repeated regularly?",
        required: true,
        placeholder: "",
        needHelp: {
          whatToInclude: "List anything people copy, re-enter, chase, calculate or create again and again.",
          whyWeAsk: "These tasks may be suitable for automation.",
          whoMayKnow: "The people completing the work and their team manager.",
        },
      },
    ],
  },
  {
    name: "Scope and Modules",
    shortName: "Scope & modules",
    description: "Break the project into functional areas and prioritise Phase 1.",
    questions: [
      {
        id: "primarySystemType",
        type: "multi",
        label: "Which part of the business is this system mainly for?",
        required: true,
        options: ["Project Management & Field Productivity", "Fleet, Asset & Logistics", "Compliance, HSEQ & Environmental", "Commercial, Finance & Client", "Admin Systems & Integrations"],
        needHelp: {
          whatToInclude: "Select the area that most closely matches the project. You can choose more detailed functions on the next page.",
          whyWeAsk: "This helps us show the most relevant features and questions.",
          whoMayKnow: "The project lead or Operations Manager.",
        },
      },
      {
        id: "selectedModules",
        type: "groupedMulti",
        label: "Which areas should the system cover?",
        required: true,
        filterBy: "primarySystemType",
        groups: MODULE_CATALOG.map((g) => ({ header: g.header, options: g.modules.map((m) => m.name) })),
        needHelp: {
          whatToInclude: "Select the parts of the business you want the system to manage. Only choose areas that are genuinely relevant.",
          whyWeAsk: "Your choices form the starting point for the system's scope.",
          whoMayKnow: "The project lead, department managers and day-to-day users.",
        },
      },
      {
        id: "proposedModules",
        type: "rep",
        label: "Review and prioritise the parts of the system.",
        required: true,
        addLabel: "Add module",
        getDefaultRows: defaultProposedModuleRows,
        groupRowsBy: "__group",
        groupHeadersFor: primarySystemTypeHeaders,
        requiredColumns: ["moduleTitle", "priority"],
        needHelp: {
          whatToInclude: "Add or amend each area and select: Must - required in the first version; Nice - useful if the budget and timescale allow; Future - not needed in the first version.",
          whyWeAsk: "This helps us define a realistic first version without losing useful ideas for later.",
          whoMayKnow: "The project sponsor, Operations Manager and department managers.",
        },
        columns: [
          { key: "moduleTitle", header: "Module title", placeholder: "e.g. Job tracker" },
          { key: "description", header: "Description", placeholder: "What it does, in a sentence", width: "1.5fr" },
          { key: "priority", header: "Priority", chips: true },
          { key: "notes", header: "Notes", placeholder: "Optional" },
        ],
      },
      {
        id: "smallestUsefulVersion",
        type: "long",
        label: "What is the smallest version that would still be useful?",
        required: true,
        placeholder: "",
        needHelp: {
          whatToInclude: "Describe the most important process or result the first version must deliver.",
          whyWeAsk: "This helps us identify a practical starting point if the project needs to be reduced or delivered in stages.",
          whoMayKnow: "The project sponsor, Operations Manager and main users.",
        },
      },
      {
        id: "phase1Exclusions",
        type: "long",
        label: "What should we deliberately leave out of the first version?",
        placeholder: "",
        needHelp: {
          whatToInclude: "List features, departments, integrations or processes that should wait until later.",
          whyWeAsk: "Clear exclusions prevent assumptions and help control cost and delivery time.",
          whoMayKnow: "The project sponsor and department managers.",
        },
      },
    ],
  },
  {
    name: "Records and Data Model",
    shortName: "Records & data",
    description: "Identify what the system needs to track and how records relate.",
    questions: [
      {
        id: "mainRecords",
        type: "multi",
        label: "What information does the system need to keep track of?",
        required: true,
        options: ["Clients", "Sites", "Projects", "Jobs", "Enquiries", "Tasks", "Documents", "Users", "Vehicles", "Plant", "Materials", "Forms", "Quotes", "Invoices", "Emails", "Compliance records", "Other"],
        needHelp: {
          whatToInclude: "Select the main things the system needs to store and manage, such as customers, sites, projects, jobs, vehicles or documents.",
          whyWeAsk: "These will become the main records within the system.",
          whoMayKnow: "Operations, administration and the people maintaining current spreadsheets or systems.",
        },
      },
      {
        id: "dataEntities",
        type: "rep",
        label: "How should the different records be linked?",
        help: "Enter TBC if you are unsure.",
        addLabel: "Add entity",
        needHelp: {
          whatToInclude: "Describe simple relationships, such as 'a customer can have several sites' or 'a project can contain several jobs'.",
          whyWeAsk: "This helps us organise the information correctly and avoid entering it more than once.",
          whoMayKnow: "Your system administrator, IT provider, Operations Manager or spreadsheet owner.",
        },
        columns: [
          { key: "entityName", header: "Entity name", placeholder: "e.g. Job" },
          { key: "uniqueId", header: "Unique ID/reference", placeholder: "e.g. Job number" },
          { key: "keyFields", header: "Key fields", placeholder: "", width: "1.3fr" },
          { key: "relationships", header: "Relationships", placeholder: "e.g. belongs to a Site", width: "1.2fr" },
          { key: "notes", header: "Notes", placeholder: "" },
        ],
      },
      {
        id: "searchableFields",
        type: "long",
        label: "What should users be able to search for?",
        placeholder: "",
        needHelp: {
          whatToInclude: "List the information people commonly use to find a record, such as job number, customer, postcode, vehicle registration or document reference.",
          whyWeAsk: "This helps us design useful searches and filters.",
          whoMayKnow: "Day-to-day users, administration staff and Customer Service.",
        },
      },
      {
        id: "mandatoryFields",
        type: "long",
        label: "What information must always be completed?",
        placeholder: "",
        needHelp: {
          whatToInclude: "List information that cannot be left blank when a record is created, completed or approved.",
          whyWeAsk: "This prevents incomplete records and makes sure important information is collected.",
          whoMayKnow: "Operations, Compliance, Finance and the people checking completed work.",
        },
      },
      {
        id: "sensitiveData",
        type: "multi",
        label: "What private or confidential information will the system hold?",
        required: true,
        options: ["Personal", "Financial", "H&S", "Confidential", "Employee", "Location/site", "None", "Not sure"],
        needHelp: {
          whatToInclude: "Select the types of information involved, such as staff details, health information, financial information or confidential pricing. Do not enter actual private details here.",
          whyWeAsk: "This helps us plan who can see the information and how it should be protected.",
          whoMayKnow: "HR, Finance, your IT provider or the person responsible for data protection.",
        },
      },
    ],
  },
  {
    name: "Statuses, Dates and Triggers",
    shortName: "Statuses & dates",
    description: "Work out what the system actively manages, prompts or calculates.",
    questions: [
      {
        id: "statuses",
        type: "rep",
        label: "How does each type of record move through the process?",
        required: true,
        addLabel: "Add status",
        needHelp: {
          whatToInclude: "For each record, list the statuses it can have, what each status means and what should happen next.",
          whyWeAsk: "Statuses allow users to see progress and help the system control the next action.",
          whoMayKnow: "The process owner, Operations Manager and day-to-day users.",
        },
        columns: [
          { key: "recordType", header: "Record type", placeholder: "e.g. Job", width: ".8fr" },
          { key: "status", header: "Status", placeholder: "e.g. In progress", width: ".8fr" },
          { key: "meaning", header: "Meaning", placeholder: "", width: "1.3fr" },
          { key: "nextAction", header: "Next action", placeholder: "", width: "1.2fr" },
        ],
      },
      {
        id: "importantDates",
        type: "rep",
        label: "Which dates and deadlines must the system track?",
        required: true,
        addLabel: "Add date",
        needHelp: {
          whatToInclude: "Add important dates such as start dates, due dates, inspections, renewals, expiry dates and payment dates.",
          whyWeAsk: "This allows the system to show upcoming work and warn users before deadlines are missed.",
          whoMayKnow: "Project Managers, Operations, Compliance, Finance or administration staff.",
        },
        columns: [
          { key: "dateDeadline", header: "Date/deadline", placeholder: "e.g. Licence expiry" },
          {
            key: "appliesTo",
            header: "Applies to",
            placeholder: "Select module",
            width: ".8fr",
            dynamicOptions: (answers) => (answers.selectedModules as string[] | undefined) || [],
          },
          { key: "howSet", header: "How set", placeholder: "Select", width: ".9fr", options: ["Manual", "Calculated"] },
          { key: "reminder", header: "Reminder?", placeholder: "Select", width: ".6fr", options: ["Yes", "No"] },
          { key: "timing", header: "Timing", placeholder: "e.g. 30 days before", width: ".9fr" },
        ],
      },
      {
        id: "triggers",
        type: "long",
        label: "What should the system remind people about automatically?",
        required: true,
        placeholder: "",
        needHelp: {
          whatToInclude: "Tell us what event should create the reminder, who should receive it and when it should be sent.",
          whyWeAsk: "This helps prevent missed deadlines and removes manual chasing.",
          whoMayKnow: "Team managers, administration staff and the people currently sending reminders.",
        },
      },
      {
        id: "calculatedDates",
        type: "long",
        label: "Are any dates worked out automatically?",
        placeholder: "",
        needHelp: {
          whatToInclude: "List any dates calculated from another date, such as an expiry date 12 months after issue.",
          whyWeAsk: "The system may be able to calculate these dates and reduce mistakes.",
          whoMayKnow: "Compliance, Operations, HR or the person currently calculating the dates.",
        },
      },
      {
        id: "urgentRules",
        type: "long",
        label: "When should the system flag something as urgent or overdue?",
        placeholder: "",
        needHelp: {
          whatToInclude: "Tell us what needs flagging and when. For example, a job the day after its deadline or a certificate 30 days before it expires.",
          whyWeAsk: "This helps people spot work that needs attention before something is missed.",
          whoMayKnow: "Operations, project managers, Compliance or the people monitoring deadlines.",
        },
      },
    ],
  },
  {
    name: "Dashboards, Reports and KPIs",
    shortName: "Dashboards & KPIs",
    description: "Define what users need to see to manage the business.",
    questions: [
      {
        id: "firstThingUsersSee",
        type: "long",
        label: "What should users see when they first log in?",
        required: true,
        placeholder: "",
        needHelp: {
          whatToInclude: "Describe the work, warnings, figures or actions that matter most at the start of a normal day.",
          whyWeAsk: "This helps us design a useful home screen for each type of user.",
          whoMayKnow: "Day-to-day users and their managers.",
        },
      },
      {
        id: "dashboardsReports",
        type: "rep",
        label: "What dashboards or reports do you need?",
        required: true,
        addLabel: "Add report",
        needHelp: {
          whatToInclude: "Add one row for each dashboard or report. Tell us who needs it, what it should show, how often it is used and whether it must be downloaded.",
          whyWeAsk: "This ensures the system provides the information people need to manage the business.",
          whoMayKnow: "Senior management, Operations, Finance, Compliance and customers who receive reports.",
        },
        groupRowsBy: "__group",
        groupHeadersFor: selectedModuleHeaders,
        requiredColumns: ["views"],
        columns: [
          { key: "name", header: "Name", placeholder: "" },
          {
            key: "audience",
            header: "Audience",
            placeholder: "Select user type",
            width: ".8fr",
            dynamicOptions: (_answers, repRows) => userRoleOptions(repRows),
          },
          { key: "purpose", header: "Purpose", placeholder: "", width: "1fr" },
          { key: "frequency", header: "Frequency", placeholder: "e.g. Weekly", width: ".7fr" },
          {
            key: "views",
            header: "Views",
            placeholder: "Select views",
            width: "1fr",
            multiSelect: true,
            options: ["List", "Board", "Calendar", "Map", "Dashboard cards", "Table/register", "Detail page", "Mobile", "Client", "Export"],
          },
          { key: "exportRequired", header: "Export required", placeholder: "Yes/No", width: ".7fr" },
        ],
      },
      {
        id: "kpis",
        type: "long",
        label: "Which numbers do you need to monitor?",
        required: true,
        help: "Bullet points are fine.",
        placeholder: "",
        needHelp: {
          whatToInclude: "List the figures that show whether work is on track, such as open jobs, overdue actions, turnaround time, costs or completed inspections.",
          whyWeAsk: "These numbers can be shown on dashboards and used to measure performance.",
          whoMayKnow: "Senior management, Finance, Operations and department managers.",
        },
      },
    ],
  },
  {
    name: "Documents, Templates and Outputs",
    shortName: "Documents & templates",
    description: "Capture documents created, reused, stored or issued.",
    questions: [
      {
        id: "documentsCreated",
        type: "rep",
        label: "Which documents should the system create?",
        addLabel: "Add other",
        getDefaultRows: blankRowPerGroup(primarySystemTypeHeaders),
        groupRowsBy: "__group",
        groupHeadersFor: primarySystemTypeHeaders,
        needHelp: {
          whatToInclude: "List documents the system should produce, such as quotations, job sheets, reports, certificates or invoices.",
          whyWeAsk: "This helps us understand what information and layouts the system must generate.",
          whoMayKnow: "The people creating the documents, administration staff, Finance or Compliance.",
        },
        columns: [
          { key: "documentCreated", header: "Document created", placeholder: "e.g. Job completion certificate" },
          { key: "standardTemplateUsed", header: "Standard template used", placeholder: "Select", width: ".4fr", options: ["Yes", "No", "Not sure"] },
        ],
      },
      {
        id: "templateDetails",
        type: "rep",
        label: "Which existing templates should the system use?",
        addLabel: "Add template",
        needHelp: {
          whatToInclude: "Add each Word, Excel, PDF or other template that must be recreated or used by the new system. Tell us what it is used for and whether it needs approval.",
          whyWeAsk: "This helps us retain the documents and layouts your business already relies on.",
          whoMayKnow: "Administration, Compliance, Finance, Marketing or the template owner.",
        },
        columns: [
          { key: "templateName", header: "Template name", placeholder: "" },
          { key: "format", header: "Format", placeholder: "e.g. Word", width: ".7fr" },
          { key: "usedFor", header: "Used for", placeholder: "" },
          { key: "approvalNeeded", header: "Approval needed", placeholder: "Yes/No", width: ".8fr" },
          { key: "outputType", header: "Output type", placeholder: "e.g. PDF", width: ".7fr" },
        ],
      },
      {
        id: "filesToStore",
        type: "rep",
        label: "Which files will users need to attach or view?",
        addLabel: "Add other",
        getDefaultRows: blankRowPerGroup(primarySystemTypeHeaders),
        groupRowsBy: "__group",
        groupHeadersFor: primarySystemTypeHeaders,
        needHelp: {
          whatToInclude: "List files people need to upload, store or link to a record, such as photographs, drawings, signed forms or supplier documents.",
          whyWeAsk: "This helps us plan where files are stored and who can access them.",
          whoMayKnow: "Day-to-day users, project teams, administration staff or IT.",
        },
        columns: [
          { key: "files", header: "Files", placeholder: "e.g. Site photos" },
          {
            key: "module",
            header: "Module",
            placeholder: "Select module",
            width: ".8fr",
            dynamicOptions: (answers) => (answers.selectedModules as string[] | undefined) || [],
          },
          { key: "storeLink", header: "Store/Link", placeholder: "Select", width: ".8fr", options: ["Stored", "Linked", "Hybrid", "Not sure"] },
          { key: "versionControl", header: "Version control", placeholder: "Select", width: ".8fr", options: ["Yes", "No", "Possibly"] },
        ],
      },
    ],
  },
  {
    name: "Automation and AI",
    shortName: "Automation & AI",
    description: "Identify useful automation while keeping control clear.",
    questions: [
      {
        id: "repetitiveTasks",
        type: "rep",
        label: "Which repeated tasks should the system do automatically?",
        addLabel: "Add task",
        groupRowsBy: "__group",
        groupHeadersFor: primarySystemTypeHeaders,
        needHelp: {
          whatToInclude: "List tasks people currently repeat, what starts each task and what the result should be.",
          whyWeAsk: "Automating suitable tasks can save time and reduce mistakes.",
          whoMayKnow: "The people doing the work and their team manager.",
        },
        columns: [
          { key: "task", header: "Task", placeholder: "e.g. Chase overdue invoices" },
          ...stakeholderAndModulesColumns(),
          { key: "trigger", header: "Trigger", placeholder: "e.g. Invoice 30 days overdue" },
          APPROVAL_COLUMN,
        ],
      },
      {
        id: "repeatedEmails",
        type: "rep",
        label: "Which emails or messages are sent repeatedly?",
        addLabel: "Add email",
        groupRowsBy: "__group",
        groupHeadersFor: primarySystemTypeHeaders,
        needHelp: {
          whatToInclude: "Tell us what is sent, who receives it, what causes it to be sent and whether someone must approve it first.",
          whyWeAsk: "The system may be able to prepare or send these messages automatically.",
          whoMayKnow: "Administration, Customer Service, Operations and the people currently sending them.",
        },
        columns: [
          { key: "message", header: "Email/Message", placeholder: "e.g. Job completion notice" },
          ...stakeholderAndModulesColumns(),
          { key: "trigger", header: "Trigger", placeholder: "e.g. Job marked complete" },
          APPROVAL_COLUMN,
        ],
      },
      {
        id: "repeatedDocuments",
        type: "rep",
        label: "Which documents are created repeatedly?",
        addLabel: "Add document",
        groupRowsBy: "__group",
        groupHeadersFor: primarySystemTypeHeaders,
        needHelp: {
          whatToInclude: "List documents people regularly recreate, who they are for, what causes them to be created and whether approval is required.",
          whyWeAsk: "The system may be able to create these documents automatically using information already entered.",
          whoMayKnow: "Administration, Operations, Finance or Compliance.",
        },
        columns: [
          { key: "document", header: "Document", placeholder: "e.g. Completion certificate" },
          ...stakeholderAndModulesColumns(),
          { key: "trigger", header: "Trigger", placeholder: "e.g. Certificate issued" },
          APPROVAL_COLUMN,
        ],
      },
      {
        id: "aiWhere",
        type: "multi",
        label: "Could AI help with any of these tasks?",
        options: ["Drafting emails", "Drafting reports", "Summarising", "Extracting", "Searching examples", "Categorising", "Notes to text", "Next actions", "Not sure", "None"],
        needHelp: {
          whatToInclude: "Select tasks where AI could prepare a first draft, summary or suggestion for a person to review. Select 'None' if AI is not required.",
          whyWeAsk: "This identifies possible time-saving opportunities without assuming AI should make final decisions.",
          whoMayKnow: "The people doing the work, their manager and the project lead.",
        },
      },
      {
        id: "aiNotDo",
        type: "long",
        label: "Where must a person remain in control?",
        placeholder: "",
        showIf: (a) => ((a.aiWhere as string[] | undefined) || []).some((x) => x !== "Not sure" && x !== "None"),
        needHelp: {
          whatToInclude: "List any decisions, approvals, messages or documents that AI must never complete or send without a person checking them.",
          whyWeAsk: "This establishes clear limits and protects important business decisions.",
          whoMayKnow: "Senior management, Compliance, Legal, HR and the relevant department manager.",
        },
      },
    ],
  },
  {
    name: "Integrations and Existing Tools",
    shortName: "Integrations",
    description: "Understand what the new solution needs to connect with.",
    questions: [
      {
        id: "currentTools",
        type: "multi",
        label: "Which tools do you currently use for this work?",
        required: true,
        options: ["Outlook", "Gmail", "Word", "Excel", "SharePoint", "OneDrive", "Google Drive", "Xero", "Sage", "QuickBooks", "CRM", "Planning Portal", "GIS", "Field app", "Existing database", "Spreadsheet tracker", "Other"],
        needHelp: {
          whatToInclude: "Select the software, spreadsheets and other tools used in this process, including anything you plan to keep using.",
          whyWeAsk: "This shows us where information is held and what the new system needs to replace or work alongside.",
          whoMayKnow: "The people doing the work, department managers or your IT provider.",
        },
      },
      {
        id: "integrationsNeeded",
        type: "choice",
        label: "Does the new system need to share information with another system?",
        required: true,
        options: ["Yes", "No", "Possibly later"],
        needHelp: {
          whatToInclude: "Select 'Yes' if information must pass automatically between systems. Select 'Possibly later' if this is not required in the first version.",
          whyWeAsk: "Connecting systems can significantly affect the project's scope, cost and timescale.",
          whoMayKnow: "IT, Finance, your software administrator or the person responsible for the existing system.",
        },
      },
      {
        id: "integrations",
        type: "rep",
        label: "Which systems need to be connected?",
        addLabel: "Add integration",
        showIf: (a) => a.integrationsNeeded === "Yes" || a.integrationsNeeded === "Possibly later",
        needHelp: {
          whatToInclude: "Add each system, what information needs to move, which direction it travels and how often it should update.",
          whyWeAsk: "This allows us to confirm whether the connection is possible and what work will be required.",
          whoMayKnow: "IT, your software provider, Finance or the existing system administrator.",
        },
        columns: [
          { key: "system", header: "System", placeholder: "e.g. Xero" },
          { key: "direction", header: "Direction", placeholder: "In / out / both", width: ".8fr" },
          { key: "authentication", header: "Authentication", placeholder: "If known", width: ".9fr" },
          { key: "frequency", header: "Frequency", placeholder: "e.g. Daily", width: ".7fr" },
          { key: "apiDocs", header: "API docs", placeholder: "Link or TBC", width: ".8fr" },
          { key: "notes", header: "Notes", placeholder: "" },
        ],
      },
      {
        id: "mustConnectDayOne",
        type: "multi",
        label: "Which tools must share information automatically with the new system from the start?",
        help: "Choose from the tools you selected earlier.",
        showIf: (a) => a.integrationsNeeded === "Yes" && ((a.currentTools as string[] | undefined) || []).length > 0,
        dynamicOptions: (a) => (a.currentTools as string[] | undefined) || [],
        needHelp: {
          whatToInclude: "Identify the tools that must send or receive information automatically when the new system launches. Only include connections essential to the first version.",
          whyWeAsk: "These connections need to be included in the initial scope, cost and delivery plan.",
          whoMayKnow: "The project lead, Finance, your IT provider or the people using those tools.",
        },
      },
      {
        id: "canStayManual",
        type: "multi",
        label: "Which tools can you keep using without an automatic connection for now?",
        help: "Choose from the tools you selected earlier.",
        showIf: (a) => a.integrationsNeeded === "Yes" && ((a.currentTools as string[] | undefined) || []).length > 0,
        dynamicOptions: (a) => (a.currentTools as string[] | undefined) || [],
        needHelp: {
          whatToInclude: "Identify tools that can remain separate for the first version. For example, people could enter information themselves or move files between systems.",
          whyWeAsk: "This helps us identify connections that can wait until later.",
          whoMayKnow: "The people using those tools, their managers, Finance or your IT provider.",
        },
      },
    ],
  },
  {
    name: "Data Migration and Existing Files",
    shortName: "Data migration",
    description: "Understand whether historic or live data needs importing.",
    questions: [
      {
        id: "migrationRequired",
        type: "choice",
        label: "Do you need existing information moved into the new system?",
        required: true,
        options: ["Yes", "No", "Possibly", "Not sure"],
        needHelp: {
          whatToInclude: "Select 'Yes' if information from spreadsheets, files or another system must be imported.",
          whyWeAsk: "Moving existing data requires preparation, checking and additional development work.",
          whoMayKnow: "IT, administration staff, Finance or the owner of the current system or spreadsheet.",
        },
      },
      {
        id: "dataSources",
        type: "rep",
        label: "Where is the existing information currently held?",
        addLabel: "Add source",
        showIf: (a) => a.migrationRequired === "Yes" || a.migrationRequired === "Possibly",
        needHelp: {
          whatToInclude: "Add each spreadsheet, database, folder or existing system. Include the approximate amount of information and its condition if known.",
          whyWeAsk: "This helps us understand what can be imported and how much preparation is needed.",
          whoMayKnow: "IT, system administrators, Finance or the people maintaining the existing information.",
        },
        columns: [
          { key: "source", header: "Source", placeholder: "e.g. Jobs spreadsheet" },
          { key: "format", header: "Format", placeholder: "e.g. Excel", width: ".7fr" },
          { key: "volume", header: "Volume", placeholder: "e.g. 3,000 rows", width: ".8fr" },
          { key: "dataQuality", header: "Data quality", placeholder: "Good / messy", width: ".8fr" },
          { key: "migrationPriority", header: "Migration priority", placeholder: "High / low", width: ".8fr" },
        ],
      },
      {
        id: "liveJobsImport",
        type: "choice",
        label: "Should work that is still in progress be moved into the new system?",
        options: ["Yes", "No", "Not sure"],
        needHelp: {
          whatToInclude: "Select the answer that best reflects whether live jobs or projects must continue in the new system after launch.",
          whyWeAsk: "Live work may need special handling so nothing is lost or disrupted during launch.",
          whoMayKnow: "Operations, Project Managers and administration staff.",
        },
      },
      {
        id: "historicRecordsImport",
        type: "choice",
        label: "Should completed or historic records be moved into the new system?",
        options: ["Yes", "No", "Possibly later"],
        needHelp: {
          whatToInclude: "Select 'Possibly later' if historic information is useful but is not needed for launch.",
          whyWeAsk: "Importing historic information can be useful, but it may add time and cost without helping day-to-day work.",
          whoMayKnow: "Senior management, Compliance, Finance, IT or the records owner.",
        },
      },
      {
        id: "dataQualityNotes",
        type: "long",
        label: "Is there anything we should know about the existing information?",
        placeholder: "",
        needHelp: {
          whatToInclude: "Tell us about missing information, duplicates, inconsistent names, old records or anything that may need cleaning.",
          whyWeAsk: "Poor-quality information can cause problems when it is moved into the new system.",
          whoMayKnow: "The people maintaining the data, IT or the current system administrator.",
        },
      },
    ],
  },
  {
    name: "Security, Controls and Compliance",
    shortName: "Security & compliance",
    description: "Capture approval, audit, access and regulatory requirements.",
    questions: [
      {
        id: "complianceRequirements",
        type: "long",
        label: "Are there any rules or standards the system must support?",
        placeholder: "",
        needHelp: {
          whatToInclude: "List any legal, industry, customer or internal requirements, such as ISO standards, GDPR or record-retention rules.",
          whyWeAsk: "These requirements may affect how information is collected, approved, stored and deleted.",
          whoMayKnow: "Compliance, HSEQ, Legal, HR, IT or your Data Protection lead.",
        },
      },
      {
        id: "approvalsRequired",
        type: "choice",
        label: "Does any work need to be checked or approved before it can continue?",
        required: true,
        options: ["Yes", "No", "Not sure"],
        needHelp: {
          whatToInclude: "Select 'Yes' if a person must review or approve work, documents or decisions before the next step.",
          whyWeAsk: "Approval stages may control who can complete, issue or change important records.",
          whoMayKnow: "Department managers, Compliance, Finance or senior management.",
        },
      },
      {
        id: "approvalProcess",
        type: "long",
        label: "Who needs to approve each important action?",
        placeholder: "",
        showIf: (a) => a.approvalsRequired === "Yes",
        needHelp: {
          whatToInclude: "List what needs approval, who approves it and at what point in the process.",
          whyWeAsk: "This allows us to build the correct checks and prevent work progressing too early.",
          whoMayKnow: "Department managers, Compliance, Finance and senior management.",
        },
      },
      {
        id: "auditTrail",
        type: "choice",
        label: "Do you need a record of who changed what and when?",
        options: ["Yes", "No", "Not sure"],
        needHelp: {
          whatToInclude: "Select 'Yes' if the system must record changes, approvals or user actions for later review.",
          whyWeAsk: "This may be required for compliance, accountability or investigating mistakes.",
          whoMayKnow: "Compliance, HSEQ, Legal, Finance or IT.",
        },
      },
      {
        id: "finalRecordsLocked",
        type: "choice",
        label: "Should approved records or documents be locked from further changes?",
        options: ["Yes", "No", "Not sure"],
        needHelp: {
          whatToInclude: "Select 'Yes' if approved or issued records must not be changed without being reopened or creating a new version.",
          whyWeAsk: "Locking final records protects the agreed version and prevents accidental changes.",
          whoMayKnow: "Compliance, Legal, Finance or the document owner.",
        },
      },
      {
        id: "businessRules",
        type: "long",
        label: "Which rules must the system prevent users from breaking?",
        placeholder: "",
        needHelp: {
          whatToInclude: "List any conditions that must be met before an action can happen. For example, a job cannot be invoiced until it has been approved.",
          whyWeAsk: "These rules help prevent mistakes and keep the correct process in place.",
          whoMayKnow: "Operations, Finance, Compliance and department managers.",
        },
      },
      {
        id: "riskIfWrong",
        type: "long",
        label: "Which information or actions could cause a serious problem if they are wrong?",
        required: true,
        placeholder: "",
        needHelp: {
          whatToInclude: "Identify anything that could create a safety, legal, financial, compliance or customer risk.",
          whyWeAsk: "These areas may need additional checks, warnings or approvals.",
          whoMayKnow: "Senior management, Compliance, HSEQ, Finance and Legal.",
        },
      },
    ],
  },
  {
    name: "Devices and Non-Functional Requirements",
    shortName: "Devices & performance",
    description: "Capture how the system will be used and quality expectations.",
    questions: [
      {
        id: "devicesRequired",
        type: "multi",
        label: "Which devices will people use?",
        required: true,
        options: ["Desktop/web", "Tablet", "Mobile", "Offline mobile", "Not sure"],
        needHelp: {
          whatToInclude: "Select every device that users will need, including office computers, tablets and mobile phones. Select offline mobile if people work without a reliable signal.",
          whyWeAsk: "Different devices and working conditions affect how the system must be designed.",
          whoMayKnow: "Day-to-day users, site teams, Operations and IT.",
        },
      },
      {
        id: "expectedUsers",
        type: "number",
        label: "Approximately how many people will use the system when it launches?",
        help: "Include everyone who will need access, both inside and outside your business. An estimate is fine.",
        placeholder: "e.g. 12",
        needHelp: {
          whatToInclude: "Enter the expected total number of users at launch, including both internal staff and external users. Do not add this to the external user number below — it should already include them.",
          whyWeAsk: "This helps us plan access, performance, support and hosting.",
          whoMayKnow: "HR, IT, department managers or the project lead.",
        },
      },
      {
        id: "expectedExternalUsers",
        type: "number",
        label: "How many people outside your business will need access when the system launches?",
        help: "An estimate is fine. Count people, not companies.",
        placeholder: "e.g. 30",
        showIf: (a) => a.external !== "No",
        needHelp: {
          whatToInclude: "Estimate how many customers, suppliers, subcontractors or other external people will need access.",
          whyWeAsk: "This helps us plan external access, hosting and support.",
          whoMayKnow: "Customer service, account managers, Operations or the project lead.",
        },
      },
      {
        id: "expectedUsage",
        type: "choice",
        label: "How much will the system be used?",
        help: "Choose the option that best matches the activity you expect.",
        options: ["Occasional", "Daily", "Heavy daily", "High-volume operational", "Not sure"],
        needHelp: {
          whatToInclude: "Think about how often people will use the system and how much work it will handle. Choose the closest option.",
          whyWeAsk: "This helps us plan enough capacity for normal work and busy periods.",
          whoMayKnow: "Operations, team managers or the people managing the current workload.",
        },
      },
      {
        id: "performanceExpectations",
        type: "long",
        label: "When and where must the system work reliably?",
        placeholder: "",
        needHelp: {
          whatToInclude: "Tell us about working hours, busy periods, poor-signal locations, urgent processes or any times when the system being unavailable would cause a serious problem.",
          whyWeAsk: "This helps us plan the appropriate performance, hosting and availability.",
          whoMayKnow: "Operations, IT, site teams and senior management.",
        },
      },
    ],
  },
  {
    name: "Supporting Documents",
    shortName: "Supporting documents",
    description: "Collect files and links that help scope the work. Helpful examples: spreadsheets, templates, workflow diagrams, screenshots, forms, RFPs, API docs, dashboard examples, wireframes, exports.",
    questions: [
      {
        id: "supportingLinks",
        type: "rep",
        label: "Add links that will help us understand the project.",
        addLabel: "Add link",
        needHelp: {
          whatToInclude: "Link to existing systems, shared documents, example forms or other relevant information. Do not include passwords or private login details.",
          whyWeAsk: "Examples help us understand the current process and expected result.",
          whoMayKnow: "The project lead, document owners, IT or department managers.",
        },
        columns: descriptionAndLinkColumns("description", "url"),
      },
      {
        id: "documentUploads",
        type: "rep",
        label: "Upload documents that will help us understand the project.",
        addLabel: "Add document",
        needHelp: {
          whatToInclude: "Add useful forms, spreadsheets, reports, process maps, screenshots or example outputs. Remove sensitive information if it is not needed.",
          whyWeAsk: "Real examples help us scope the system accurately and avoid assumptions.",
          whoMayKnow: "The people who use or own the documents, administration staff and department managers.",
        },
        columns: descriptionAndLinkColumns("documentDescription", "file"),
      },
    ],
  },
  {
    name: "Final Prioritisation",
    shortName: "Final prioritisation",
    description: "Lock in scope clarity before submission.",
    questions: [
      {
        id: "topOutcomes",
        type: "group",
        label: "Final check: what are the three most important results the first version must deliver?",
        required: true,
        needHelp: {
          whatToInclude: "Review your earlier answers and list only the three outcomes that matter most.",
          whyWeAsk: "These outcomes will be used to keep the first version focused.",
          whoMayKnow: "The project sponsor, senior management and Operations Manager.",
        },
        fields: [
          { key: "outcome1", label: "Outcome 1", placeholder: "e.g. One place to see the status of every job" },
          { key: "outcome2", label: "Outcome 2" },
          { key: "outcome3", label: "Outcome 3" },
        ],
      },
      {
        id: "mustHaveFeatures",
        type: "long",
        label: "Final check: which features must be included in the first version?",
        required: true,
        help: "Bullet points are fine.",
        placeholder: "",
        needHelp: {
          whatToInclude: "Only list features without which the first version would not be usable or successful.",
          whyWeAsk: "These features will receive the highest priority when the scope is prepared.",
          whoMayKnow: "The project sponsor, department managers and main users.",
        },
      },
      {
        id: "niceToHaveFeatures",
        type: "long",
        label: "Which features would be useful but are not essential?",
        help: "Bullet points are fine.",
        placeholder: "",
        needHelp: {
          whatToInclude: "List anything that could be delayed if the budget or timescale requires it.",
          whyWeAsk: "This gives us flexibility while protecting the essential parts of the project.",
          whoMayKnow: "Department managers and day-to-day users.",
        },
      },
      {
        id: "futurePhaseIdeas",
        type: "long",
        label: "What would you like to add in a later version?",
        help: "List ideas that can wait until after the first version.",
        placeholder: "",
        needHelp: {
          whatToInclude: "Note any features, connections or business areas you would like to add later. You can refer to ideas already listed.",
          whyWeAsk: "This helps us consider future plans without adding them to the first version.",
          whoMayKnow: "The project lead, department managers or the people who will use the system.",
        },
      },
      {
        id: "outOfScope",
        type: "long",
        label: "Final check: what must not be included in the first version?",
        placeholder: "",
        needHelp: {
          whatToInclude: "Confirm any features, departments, processes or integrations that should be left until later.",
          whyWeAsk: "This prevents assumptions and makes the boundary of the project clear.",
          whoMayKnow: "The project sponsor and department managers.",
        },
      },
      {
        id: "openQuestions",
        type: "long",
        label: "Is there anything you are unsure or worried about?",
        placeholder: "",
        needHelp: {
          whatToInclude: "Tell us about anything still unclear, such as budget, timing, training or changing the way people work. You do not need to have the answer.",
          whyWeAsk: "This helps us prepare for the workshop and address concerns before agreeing the scope.",
          whoMayKnow: "Anyone involved in the project or affected by the change.",
        },
      },
    ],
  },
];

export type Step =
  | { kind: "intro" }
  | { kind: "sintro"; sectionIndex: number }
  | { kind: "question"; sectionIndex: number; question: Question }
  | { kind: "end" };

function buildSteps(sections: Section[]): Step[] {
  const steps: Step[] = [{ kind: "intro" }];
  sections.forEach((section, sectionIndex) => {
    steps.push({ kind: "sintro", sectionIndex });
    section.questions.forEach((question) => steps.push({ kind: "question", sectionIndex, question }));
  });
  steps.push({ kind: "end" });
  return steps;
}

export const STEPS = buildSteps(SECTIONS);

export function isStepVisible(step: Step, answers: Answers): boolean {
  if (step.kind !== "question") return true;
  return !step.question.showIf || step.question.showIf(answers);
}

// The section-jump dropdown doesn't make sense before the user has seen any
// section — hide it on the opening screen and the first section's intro.
export function isSectionJumpVisible(step: Step): boolean {
  return !(step.kind === "intro" || (step.kind === "sintro" && step.sectionIndex === 0));
}

// The opening screen has its own "Start →" button, so the count/prev-next
// bar would be redundant there.
export function isBottomBarVisible(step: Step): boolean {
  return step.kind !== "intro";
}

const MULTI_ANSWER_QUESTION_IDS = new Set(
  SECTIONS.flatMap((s) => s.questions).filter((q) => q.type === "multi" || q.type === "groupedMulti").map((q) => q.id)
);

// Drafts saved before a question's type changed from single- to multi-select
// (or vice versa) can have the wrong shape in localStorage. Coerce on load so
// a leftover string doesn't crash the first multi-select toggle, and a
// leftover array doesn't break a since-reverted single-select.
export function sanitizeAnswers(raw: Answers): Answers {
  const sanitized: Answers = { ...raw };
  Object.keys(sanitized).forEach((id) => {
    const value = sanitized[id];
    const expectsArray = MULTI_ANSWER_QUESTION_IDS.has(id);
    if (expectsArray && typeof value === "string") {
      sanitized[id] = value ? [value] : [];
    } else if (!expectsArray && Array.isArray(value)) {
      sanitized[id] = value[0];
    }
  });
  return sanitized;
}

const DYNAMIC_MULTI_QUESTIONS = SECTIONS.flatMap((s) => s.questions).filter(
  (q): q is Question & { dynamicOptions: (answers: Answers) => string[] } => q.type === "multi" && !!q.dynamicOptions
);

// A `multi` question whose choices mirror another answer via `dynamicOptions`
// (e.g. "Must connect from day one" mirroring "Current tools") can end up
// holding a selection that's no longer offered once the source answer
// changes. Pruning it immediately — rather than leaving it to linger
// invisibly in storage — means removing a tool from "Current tools" cleanly
// forgets any downstream picks tied to it, instead of the pick silently
// reappearing pre-selected if the tool is added back later.
export function reconcileDynamicMultiAnswers(answers: Answers): Answers {
  let changed = false;
  const next: Answers = { ...answers };
  DYNAMIC_MULTI_QUESTIONS.forEach((question) => {
    const value = answers[question.id] as string[] | undefined;
    if (!value || value.length === 0) return;
    const visible = new Set(question.dynamicOptions(answers));
    const pruned = value.filter((v) => visible.has(v));
    if (pruned.length !== value.length) {
      next[question.id] = pruned;
      changed = true;
    }
  });
  return changed ? next : answers;
}

export function hasText(value: string | string[] | undefined): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === "string" && value.trim().length > 0;
}

// Catalog-generated rows carry a "header::module" key (see
// `defaultProposedModuleRows`); manually-added rows always get a plain "rN"
// key. That distinction is how reconciliation below tells "auto-populated,
// keep in sync with answers" apart from "the user added this by hand, leave
// it alone".
export function isGeneratedRowKey(key: string | undefined): boolean {
  return typeof key === "string" && key.includes("::");
}

// A generated row the user has typed real content into (any column besides
// the ones `getDefaultRows` itself seeds) has become the user's own data, not
// just a disposable stand-in for their earlier selection — see `seedColumns`.
function isRowEdited(question: Question, row: RepRow): boolean {
  if (!question.seedColumns) return false;
  return Object.entries(row).some(
    ([key, value]) => !key.startsWith("__") && !question.seedColumns!.includes(key) && hasText(value)
  );
}

// Single source of truth for "what rows does this rep question actually have
// right now", shared by the answered-check below and the wizard's renderer
// (DiscoveryWizard.tsx's `rowsFor` calls this too) — so the section-nav
// "done" state and the active question's own completeness check never
// disagree about which rows exist.
//
// Reconciles instead of freezing: drops generated rows whose module/system
// was since deselected, adds rows for newly selected ones, and keeps every
// other saved row (including any edits, and any row the user added by hand)
// untouched — so going back and changing an earlier answer keeps this table
// in sync instead of getting stuck at the first edit. A generated row the
// user has since edited (see `isRowEdited`) is kept even if its source was
// deselected. A generated row that already matches a hand-typed row's seed
// values (e.g. a "Site" row someone typed in before this question had a
// generator) isn't added a second time.
export function reconcileRepRows(question: Question, answers: Answers, saved: RepRow[] | undefined): RepRow[] {
  const generated = question.getDefaultRows?.(answers);
  if (saved === undefined) return generated && generated.length > 0 ? generated : [];
  if (!generated) return saved;
  const generatedKeys = new Set(generated.map((r) => r.__key));
  const kept = saved.filter(
    (r) =>
      !isGeneratedRowKey(r.__key as string | undefined) ||
      generatedKeys.has(r.__key) ||
      isRowEdited(question, r)
  );
  const keptKeys = new Set(kept.map((r) => r.__key));
  const seedValueOf = (row: RepRow) => question.seedColumns?.map((c) => row[c]).join(" ");
  const keptSeedValues = question.seedColumns ? new Set(kept.map(seedValueOf)) : null;
  const added = generated.filter(
    (r) => !keptKeys.has(r.__key) && !(keptSeedValues && keptSeedValues.has(seedValueOf(r)))
  );
  return [...kept, ...added];
}

// `__`-prefixed keys (`__key`, `__group`, …) are structural bookkeeping the
// renderer needs, not user-typed content, and never count toward "answered".
export function hasNonKeyValue(row: RepRow): boolean {
  return Object.entries(row).some(([key, value]) => !key.startsWith("__") && hasText(value));
}

// Default rep validation is lenient (any cell anywhere has text). Questions
// that set `requiredColumns` (e.g. proposedModules) instead require every
// row to have those specific columns filled in — half-finished rows don't
// count as done.
export function isRepFullyAnswered(question: Question, rows: RepRow[]): boolean {
  if (question.requiredColumns && question.requiredColumns.length > 0) {
    return rows.length > 0 && rows.every((row) => question.requiredColumns!.every((key) => hasText(row[key])));
  }
  return rows.some(hasNonKeyValue);
}

// A `groupedMulti` question's options are scoped to whichever `filterBy`
// groups are currently selected (e.g. only modules under a chosen system
// type) — this is the one calculation both "is it answered" and "what do we
// show in review" need, so it's shared instead of each re-deriving it.
// Returns null when the question has no `filterBy` (every option is always
// visible, so there's nothing to filter against).
function groupedMultiVisibleOptions(question: Question, answers: Answers): Set<string> | null {
  if (!question.filterBy) return null;
  return new Set(
    (question.groups || [])
      .filter((g) => ((answers[question.filterBy!] as string[] | undefined) || []).includes(g.header))
      .flatMap((g) => g.options)
  );
}

// Shared answered-check for a question given its (already-resolved, for rep
// questions) rows — used directly by the active question screen, which
// already has its rows resolved via `rowsFor`.
export function isQuestionComplete(question: Question, answers: Answers, rows: RepRow[]): boolean {
  switch (question.type) {
    case "text":
    case "number":
    case "long":
      return hasText(answers[question.id] as string | undefined);
    case "choice":
      return hasText(answers[question.id] as string | undefined);
    case "multi": {
      const value = answers[question.id] as string[] | undefined;
      if (!value || value.length === 0) return false;
      // dynamicOptions questions (e.g. "Must connect from day one" mirroring
      // "Current tools") don't prune stale selections when their source
      // answer changes — so a value only counts as answered if at least one
      // selected option is still actually offered.
      if (!question.dynamicOptions) return true;
      const visibleOptions = new Set(question.dynamicOptions(answers));
      return value.some((v) => visibleOptions.has(v));
    }
    case "groupedMulti": {
      const value = (answers[question.id] as string[] | undefined) || [];
      if (value.length === 0) return false;
      const visibleOptions = groupedMultiVisibleOptions(question, answers);
      // A selection only counts if it's still one of the currently-visible
      // options — `filterBy` (e.g. which systems are picked) isn't pruned
      // from this answer when it changes later, so without this a stale
      // selection from a since-deselected group would still read as
      // "answered" even though nothing the user can currently see is
      // actually selected.
      return !visibleOptions || value.some((v) => visibleOptions.has(v));
    }
    case "group":
      return (question.fields || []).some((field) => hasText(answers[`${question.id}.${field.key}`] as string | undefined));
    case "rep":
      return isRepFullyAnswered(question, rows);
    default:
      return false;
  }
}

export function isQuestionAnswered(
  question: Question,
  answers: Answers,
  repRows: Record<string, RepRow[]>
): boolean {
  const rows = question.type === "rep" ? reconcileRepRows(question, answers, repRows[question.id]) : [];
  return isQuestionComplete(question, answers, rows);
}

// A section counts as "done" once its required questions (that are currently
// visible given `answers`) are all answered. Sections with no required
// questions instead need at least one visible question answered — otherwise
// they'd read as "done" before the user ever opens them.
export function isSectionAnswered(
  section: Section,
  answers: Answers,
  repRows: Record<string, RepRow[]>
): boolean {
  const visibleQuestions = section.questions.filter((q) => !q.showIf || q.showIf(answers));
  const requiredQuestions = visibleQuestions.filter((q) => q.required);
  const toCheck = requiredQuestions.length > 0 ? requiredQuestions : visibleQuestions;
  if (toCheck.length === 0) return false;
  return requiredQuestions.length > 0
    ? toCheck.every((q) => isQuestionAnswered(q, answers, repRows))
    : toCheck.some((q) => isQuestionAnswered(q, answers, repRows));
}

// --- Review sheet / discovery brief -----------------------------------

// Shared display formatting — used by the wizard's own section nav as well
// as the review sheet (1a) and discovery brief (1c).
export function padSectionNumber(sectionIndex: number): string {
  return String(sectionIndex + 1).padStart(2, "0");
}

// RepRow cells are string for most columns, string[] for multiSelect ones —
// these normalize a cell to the shape the caller expects instead of
// scattering `as string`/`as string[]` casts at each read site.
export function cellText(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}
export function cellArray(value: string | string[] | undefined): string[] {
  return Array.isArray(value) ? value : [];
}

// How a single question's current answer should render in the review sheet
// (1a) and the discovery brief (1c) — both read this the same way, so the
// two views never disagree about what counts as "skipped".
export type ReviewValue =
  | { kind: "text"; text: string }
  | { kind: "chips"; chips: string[] }
  | { kind: "table"; columns: RepColumn[]; rows: RepRow[] }
  | { kind: "skipped" };

// `repRows` here should be the *reconciled* map (rows already synced against
// `answers` for every `getDefaultRows` question) — see `reconciledRepRows` in
// DiscoveryWizard.tsx — since a rep question's generated rows can otherwise
// lag behind an answer that was just changed.
export function getReviewValue(question: Question, answers: Answers, repRows: Record<string, RepRow[]>): ReviewValue {
  switch (question.type) {
    case "text":
    case "number":
    case "long":
    case "choice": {
      const text = (answers[question.id] as string | undefined) || "";
      return hasText(text) ? { kind: "text", text } : { kind: "skipped" };
    }
    case "multi": {
      const chips = (answers[question.id] as string[] | undefined) || [];
      return chips.length > 0 ? { kind: "chips", chips } : { kind: "skipped" };
    }
    case "groupedMulti": {
      const selected = (answers[question.id] as string[] | undefined) || [];
      // Drop any selection whose group is no longer visible (its
      // `filterBy` source was since deselected) — same rule
      // `isQuestionComplete` uses to decide "answered".
      const visibleOptions = groupedMultiVisibleOptions(question, answers);
      const chips = visibleOptions ? selected.filter((v) => visibleOptions.has(v)) : selected;
      return chips.length > 0 ? { kind: "chips", chips } : { kind: "skipped" };
    }
    case "group": {
      const parts = (question.fields || [])
        .map((field) => (answers[`${question.id}.${field.key}`] as string | undefined) || "")
        .filter(hasText);
      return parts.length > 0 ? { kind: "text", text: parts.join(" · ") } : { kind: "skipped" };
    }
    case "rep": {
      // `repRows` is already the reconciled map (see the note above), so
      // there's no need to run it through `reconcileRepRows` a second time.
      const rows = (repRows[question.id] || []).filter(hasNonKeyValue);
      return rows.length > 0 ? { kind: "table", columns: question.columns || [], rows } : { kind: "skipped" };
    }
    default:
      return { kind: "skipped" };
  }
}

export type ReviewItem = { question: Question; value: ReviewValue };

export type ReviewSectionData = {
  section: Section;
  sectionIndex: number;
  items: ReviewItem[];
  total: number;
  answeredCount: number;
  tbcCount: number;
};

// Full transcript for the review sheet (1a) and discovery brief (1c): every
// section, in wizard order, with only its currently-visible questions (a
// hidden `showIf` question is excluded exactly as it is from the wizard's
// own navigation) and each question's renderable value.
export function buildReviewData(answers: Answers, repRows: Record<string, RepRow[]>): ReviewSectionData[] {
  return SECTIONS.map((section, sectionIndex) => {
    const items = section.questions
      .filter((q) => !q.showIf || q.showIf(answers))
      .map((question) => ({ question, value: getReviewValue(question, answers, repRows) }));
    const tbcCount = items.filter((i) => i.value.kind === "skipped").length;
    return { section, sectionIndex, items, total: items.length, answeredCount: items.length - tbcCount, tbcCount };
  });
}
