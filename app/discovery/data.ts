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

export type Question = {
  id: string;
  type: QuestionType;
  label: string;
  help?: string;
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
      { id: "businessDescription", type: "long", label: "What does your business do?", placeholder: "A sentence or two is plenty…" },
      { id: "trigger", type: "long", label: "What has triggered the need now?", required: true, help: "Bullet points are fine.", placeholder: "" },
      { id: "problem", type: "long", label: "What problem are you trying to solve?", required: true, placeholder: "" },
      { id: "painPoints", type: "long", label: "Current pain points", required: true, help: "Bullet points are fine.", placeholder: "e.g. double data entry, chasing paperwork, no live status…" },
      { id: "costOfInaction", type: "long", label: "What happens if nothing changes?", placeholder: "" },
      { id: "successDefinition", type: "long", label: "What does success look like 3-6 months after go-live?", required: true, help: "Bullet points are fine.", placeholder: "" },
      { id: "successMetrics", type: "long", label: "How will success be measured?", help: "Bullet points are fine — TBC if unsure.", placeholder: "" },
    ],
  },
  {
    name: "Users and Access",
    shortName: "Users & access",
    description: "Identify who uses the system and what permissions are needed.",
    questions: [
      { id: "dayOneUsers", type: "multi", label: "Day-one users", required: true, help: "Select everyone who will use the system from day one.", options: ["Admin", "Manager", "Director", "Office", "Site", "Field", "Client", "Consultant", "Supplier", "Finance", "Other"] },
      {
        id: "userRoles",
        type: "rep",
        label: "User roles",
        required: true,
        help: "One row per user type.",
        addLabel: "Add user type",
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
      { id: "external", type: "choice", label: "External access needed?", required: true, options: ["Yes", "No", "Possibly later"] },
      { id: "permissionRestrictions", type: "long", label: "Permission restrictions", help: "Anything certain users must not see or do.", placeholder: "" },
    ],
  },
  {
    name: "Current Process / Workflow Overview",
    shortName: "Current workflow",
    description: "Capture the real workflow from start to finish.",
    questions: [
      { id: "mainProcess", type: "long", label: "Main process the system supports", required: true, help: "In plain words, start to finish.", placeholder: "" },
      { id: "processStart", type: "text", label: "Where does the process start?", required: true, placeholder: "e.g. Enquiry arrives by email" },
      { id: "processEnd", type: "text", label: "Where does the process end?", placeholder: "e.g. Invoice paid" },
      {
        id: "workflowSteps",
        type: "rep",
        label: "Workflow steps",
        required: true,
        help: "One row per step, in order.",
        addLabel: "Add step",
        columns: [
          { key: "stepNumber", header: "No.", placeholder: "1", width: "48px" },
          { key: "stepName", header: "Step name", placeholder: "e.g. Quote" },
          { key: "whatHappens", header: "What happens", placeholder: "", width: "1.3fr" },
          { key: "whoDoesIt", header: "Who does it", placeholder: "" },
          { key: "currentTool", header: "Current tool", placeholder: "e.g. Excel", width: ".8fr" },
          { key: "painPoint", header: "Pain point", placeholder: "" },
        ],
      },
      { id: "processBreakdown", type: "long", label: "Where does it slow down or go wrong?", required: true, placeholder: "" },
      { id: "manualOrRepeated", type: "long", label: "What is manual or repeated?", required: true, placeholder: "" },
    ],
  },
  {
    name: "Scope and Modules",
    shortName: "Scope & modules",
    description: "Break the project into functional areas and prioritise Phase 1.",
    questions: [
      { id: "primarySystemType", type: "multi", label: "Primary system type", required: true, options: ["Project Management & Field Productivity", "Fleet, Asset & Logistics", "Compliance, HSEQ & Environmental", "Commercial, Finance & Client", "Admin Systems & Integrations"] },
      {
        id: "selectedModules",
        type: "groupedMulti",
        label: "Choose the modules that you want",
        required: true,
        filterBy: "primarySystemType",
        groups: MODULE_CATALOG.map((g) => ({ header: g.header, options: g.modules.map((m) => m.name) })),
      },
      {
        id: "proposedModules",
        type: "rep",
        label: "Proposed modules",
        required: true,
        help: "One row per module. Priority: Must for Phase 1, Nice, or Future.",
        addLabel: "Add module",
        getDefaultRows: defaultProposedModuleRows,
        groupRowsBy: "__group",
        groupHeadersFor: primarySystemTypeHeaders,
        requiredColumns: ["moduleTitle", "priority"],
        columns: [
          { key: "moduleTitle", header: "Module title", placeholder: "e.g. Job tracker" },
          { key: "description", header: "Description", placeholder: "What it does, in a sentence", width: "1.5fr" },
          { key: "priority", header: "Priority", chips: true },
          { key: "notes", header: "Notes", placeholder: "Optional" },
        ],
      },
      { id: "smallestUsefulVersion", type: "long", label: "Smallest useful first version", required: true, help: "If we could only build one thing first, what would be genuinely useful?", placeholder: "" },
      { id: "phase1Exclusions", type: "long", label: "Explicit Phase 1 exclusions", help: "Anything we should deliberately leave out for now.", placeholder: "" },
    ],
  },
  {
    name: "Records and Data Model",
    shortName: "Records & data",
    description: "Identify what the system needs to track and how records relate.",
    questions: [
      { id: "mainRecords", type: "multi", label: "Main records to track", required: true, options: ["Clients", "Sites", "Projects", "Jobs", "Enquiries", "Tasks", "Documents", "Users", "Vehicles", "Plant", "Materials", "Forms", "Quotes", "Invoices", "Emails", "Compliance records", "Other"] },
      {
        id: "dataEntities",
        type: "rep",
        label: "Data entities",
        help: "Optional — skip if unsure, we'll map this together in the workshop.",
        addLabel: "Add entity",
        columns: [
          { key: "entityName", header: "Entity name", placeholder: "e.g. Job" },
          { key: "uniqueId", header: "Unique ID/reference", placeholder: "e.g. Job number" },
          { key: "keyFields", header: "Key fields", placeholder: "", width: "1.3fr" },
          { key: "relationships", header: "Relationships", placeholder: "e.g. belongs to a Site", width: "1.2fr" },
          { key: "notes", header: "Notes", placeholder: "" },
        ],
      },
      { id: "searchableFields", type: "long", label: "What must be searchable?", placeholder: "" },
      { id: "mandatoryFields", type: "long", label: "Mandatory fields", help: "Fields that must be completed before a record can be saved.", placeholder: "" },
      { id: "sensitiveData", type: "multi", label: "Sensitive data involved?", required: true, options: ["Personal", "Financial", "H&S", "Confidential", "Employee", "Location/site", "None", "Not sure"] },
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
        label: "Statuses",
        required: true,
        help: "e.g. Job — In progress — work has started — next: schedule inspection.",
        addLabel: "Add status",
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
        label: "Important dates/deadlines",
        required: true,
        addLabel: "Add date",
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
      { id: "triggers", type: "long", label: "Triggers for reminders, tasks or notifications", required: true, help: "What should the system chase automatically?", placeholder: "" },
      { id: "calculatedDates", type: "long", label: "Automatically calculated dates", help: "e.g. Expiry = issue date + 12 months.", placeholder: "" },
      { id: "urgentRules", type: "long", label: "Urgent/overdue rules", help: "When should something turn red?", placeholder: "" },
    ],
  },
  {
    name: "Dashboards, Reports and KPIs",
    shortName: "Dashboards & KPIs",
    description: "Define what users need to see to manage the business.",
    questions: [
      { id: "firstThingUsersSee", type: "long", label: "First thing users need to see", required: true, help: "When they log in on a normal morning.", placeholder: "" },
      {
        id: "dashboardsReports",
        type: "rep",
        label: "Dashboards/reports",
        required: true,
        help: "One row per report, grouped by the module it belongs to.",
        addLabel: "Add report",
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
      { id: "kpis", type: "long", label: "KPIs/key numbers", required: true, help: "Bullet points are fine.", placeholder: "" },
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
        label: "Documents created during the process",
        help: "One row per document, grouped by system type.",
        addLabel: "Add other",
        getDefaultRows: blankRowPerGroup(primarySystemTypeHeaders),
        groupRowsBy: "__group",
        groupHeadersFor: primarySystemTypeHeaders,
        columns: [
          { key: "documentCreated", header: "Document created", placeholder: "e.g. Job completion certificate" },
          { key: "standardTemplateUsed", header: "Standard template used", placeholder: "Select", width: ".8fr", options: ["Yes", "No", "Not sure"] },
        ],
      },
      { id: "templatesUsed", type: "choice", label: "Standard templates used?", options: ["Yes", "No", "Some", "Not sure"] },
      {
        id: "templateDetails",
        type: "rep",
        label: "Template details",
        help: "One row per template.",
        addLabel: "Add template",
        showIf: (a) => a.templatesUsed === "Yes" || a.templatesUsed === "Some",
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
        label: "Files to upload, store or link",
        help: "One row per file, grouped by system type.",
        addLabel: "Add other",
        getDefaultRows: blankRowPerGroup(primarySystemTypeHeaders),
        groupRowsBy: "__group",
        groupHeadersFor: primarySystemTypeHeaders,
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
        label: "Repetitive tasks to automate",
        help: "One row per task, grouped by system type.",
        addLabel: "Add task",
        groupRowsBy: "__group",
        groupHeadersFor: primarySystemTypeHeaders,
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
        label: "Repeated emails/messages",
        help: "One row per email/message, grouped by system type.",
        addLabel: "Add email",
        groupRowsBy: "__group",
        groupHeadersFor: primarySystemTypeHeaders,
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
        label: "Repeated documents",
        help: "One row per document, grouped by system type.",
        addLabel: "Add document",
        groupRowsBy: "__group",
        groupHeadersFor: primarySystemTypeHeaders,
        columns: [
          { key: "document", header: "Document", placeholder: "e.g. Completion certificate" },
          ...stakeholderAndModulesColumns(),
          { key: "trigger", header: "Trigger", placeholder: "e.g. Certificate issued" },
          APPROVAL_COLUMN,
        ],
      },
      { id: "aiWhere", type: "multi", label: "Where could AI save time?", options: ["Drafting emails", "Drafting reports", "Summarising", "Extracting", "Searching examples", "Categorising", "Notes to text", "Next actions", "Not sure", "None"] },
      {
        id: "aiNotDo",
        type: "long",
        label: "What should AI not do?",
        help: "Keeping control clear.",
        placeholder: "",
        showIf: (a) => ((a.aiWhere as string[] | undefined) || []).some((x) => x !== "Not sure" && x !== "None"),
      },
      { id: "humanApprovalNeeded", type: "long", label: "What always needs human approval?", placeholder: "" },
      { id: "autoSend", type: "choice", label: "Should anything be sent automatically?", required: true, options: ["Yes", "No", "Not sure"] },
    ],
  },
  {
    name: "Integrations and Existing Tools",
    shortName: "Integrations",
    description: "Understand what the new solution needs to connect with.",
    questions: [
      { id: "currentTools", type: "multi", label: "Current tools", required: true, options: ["Outlook", "Gmail", "Word", "Excel", "SharePoint", "OneDrive", "Google Drive", "Xero", "Sage", "QuickBooks", "CRM", "Planning Portal", "GIS", "Field app", "Existing database", "Spreadsheet tracker", "Other"] },
      { id: "integrationsNeeded", type: "choice", label: "Integrations needed?", required: true, options: ["Yes", "No", "Possibly later"] },
      {
        id: "integrations",
        type: "rep",
        label: "Integrations",
        help: "One row per system to connect.",
        addLabel: "Add integration",
        showIf: (a) => a.integrationsNeeded === "Yes" || a.integrationsNeeded === "Possibly later",
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
        label: "Must connect from day one",
        help: "Of the tools selected above, which need to be connected as soon as the new solution goes live?",
        showIf: (a) => a.integrationsNeeded === "Yes" && ((a.currentTools as string[] | undefined) || []).length > 0,
        dynamicOptions: (a) => (a.currentTools as string[] | undefined) || [],
      },
      {
        id: "canStayManual",
        type: "multi",
        label: "Can stay manual for Phase 1",
        help: "Of the tools selected above, which can stay a manual, non-integrated process for now?",
        showIf: (a) => a.integrationsNeeded === "Yes" && ((a.currentTools as string[] | undefined) || []).length > 0,
        dynamicOptions: (a) => (a.currentTools as string[] | undefined) || [],
      },
    ],
  },
  {
    name: "Data Migration and Existing Files",
    shortName: "Data migration",
    description: "Understand whether historic or live data needs importing.",
    questions: [
      { id: "migrationRequired", type: "choice", label: "Data migration required?", required: true, options: ["Yes", "No", "Possibly", "Not sure"] },
      {
        id: "dataSources",
        type: "rep",
        label: "Data sources",
        help: "One row per source.",
        addLabel: "Add source",
        showIf: (a) => a.migrationRequired === "Yes" || a.migrationRequired === "Possibly",
        columns: [
          { key: "source", header: "Source", placeholder: "e.g. Jobs spreadsheet" },
          { key: "format", header: "Format", placeholder: "e.g. Excel", width: ".7fr" },
          { key: "volume", header: "Volume", placeholder: "e.g. 3,000 rows", width: ".8fr" },
          { key: "dataQuality", header: "Data quality", placeholder: "Good / messy", width: ".8fr" },
          { key: "migrationPriority", header: "Migration priority", placeholder: "High / low", width: ".8fr" },
        ],
      },
      { id: "liveJobsImport", type: "choice", label: "Live/open jobs need importing?", options: ["Yes", "No", "Not sure"] },
      { id: "historicRecordsImport", type: "choice", label: "Historic/closed records need importing?", options: ["Yes", "No", "Possibly later"] },
      { id: "dataQualityNotes", type: "long", label: "Data quality/mapping notes", placeholder: "" },
    ],
  },
  {
    name: "Security, Controls and Compliance",
    shortName: "Security & compliance",
    description: "Capture approval, audit, access and regulatory requirements.",
    questions: [
      { id: "complianceRequirements", type: "long", label: "Compliance/regulatory requirements", placeholder: "" },
      { id: "approvalsRequired", type: "choice", label: "Approval/sign-off steps required?", required: true, options: ["Yes", "No", "Not sure"] },
      { id: "approvalProcess", type: "long", label: "Approval process", help: "Who approves what, and when.", placeholder: "", showIf: (a) => a.approvalsRequired === "Yes" },
      { id: "auditTrail", type: "choice", label: "Audit trail needed?", options: ["Yes", "No", "Not sure"] },
      { id: "finalRecordsLocked", type: "choice", label: "Final records/documents locked?", options: ["Yes", "No", "Not sure"] },
      { id: "businessRules", type: "long", label: "Business rules to enforce", help: "e.g. A job cannot be invoiced until it's signed off.", placeholder: "" },
      { id: "riskIfWrong", type: "long", label: "What creates risk if wrong?", required: true, placeholder: "" },
    ],
  },
  {
    name: "Devices and Non-Functional Requirements",
    shortName: "Devices & performance",
    description: "Capture how the system will be used and quality expectations.",
    questions: [
      { id: "devicesRequired", type: "multi", label: "Devices required", required: true, options: ["Desktop/web", "Tablet", "Mobile", "Offline mobile", "Not sure"] },
      { id: "expectedUsers", type: "number", label: "Expected users", placeholder: "e.g. 12" },
      { id: "expectedExternalUsers", type: "number", label: "Expected external users", placeholder: "e.g. 30", showIf: (a) => a.external !== "No" },
      { id: "expectedUsage", type: "choice", label: "Expected usage", options: ["Occasional", "Daily", "Heavy daily", "High-volume operational", "Not sure"] },
      { id: "performanceExpectations", type: "long", label: "Performance/reliability expectations", placeholder: "" },
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
        label: "Links",
        addLabel: "Add link",
        columns: descriptionAndLinkColumns("description", "url"),
      },
      {
        id: "documentUploads",
        type: "rep",
        label: "Document uploads",
        addLabel: "Add document",
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
        label: "Top 3 outcomes Phase 1 must deliver",
        required: true,
        fields: [
          { key: "outcome1", label: "Outcome 1", placeholder: "e.g. One place to see the status of every job" },
          { key: "outcome2", label: "Outcome 2" },
          { key: "outcome3", label: "Outcome 3" },
        ],
      },
      { id: "mustHaveFeatures", type: "long", label: "Must-have features", required: true, help: "Bullet points are fine.", placeholder: "" },
      { id: "niceToHaveFeatures", type: "long", label: "Nice-to-have features", help: "Bullet points are fine.", placeholder: "" },
      { id: "futurePhaseIdeas", type: "long", label: "Future phase ideas", help: "Bullet points are fine.", placeholder: "" },
      { id: "outOfScope", type: "long", label: "Explicitly out of scope", placeholder: "" },
      { id: "openQuestions", type: "long", label: "Open questions or concerns", placeholder: "" },
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

function hasText(value: string | string[] | undefined): boolean {
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
function hasNonKeyValue(row: RepRow): boolean {
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
      if (!question.filterBy) return true;
      // A selection only counts if it's still one of the currently-visible
      // options — `filterBy` (e.g. which systems are picked) isn't pruned
      // from this answer when it changes later, so without this a stale
      // selection from a since-deselected group would still read as
      // "answered" even though nothing the user can currently see is
      // actually selected.
      const visibleOptions = new Set(
        (question.groups || [])
          .filter((g) => ((answers[question.filterBy!] as string[] | undefined) || []).includes(g.header))
          .flatMap((g) => g.options)
      );
      return value.some((v) => visibleOptions.has(v));
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
