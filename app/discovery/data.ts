// Discovery Workshop Wizard — question schema.
// Ported from design_handoff_discovery_wizard/reference/Discovery Wizard.dc.html (the `DEF` array).
// Copy, options, column definitions and conditional (`showIf`) rules are transcribed verbatim.

export type Answers = Record<string, string | string[] | undefined>;

export type RepRow = Record<string, string>;

export type RepColumn = {
  key: string;
  header: string;
  placeholder?: string;
  width?: string;
  chips?: boolean;
  file?: boolean;
};

export type GroupField = {
  key: string;
  label: string;
  placeholder?: string;
};

export type QuestionType = "text" | "long" | "choice" | "multi" | "group" | "rep";

export type Question = {
  id: string;
  type: QuestionType;
  label: string;
  help?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  fields?: GroupField[];
  columns?: RepColumn[];
  addLabel?: string;
  showIf?: (answers: Answers) => boolean;
};

export type Section = {
  name: string;
  description: string;
  questions: Question[];
};

export const SECTIONS: Section[] = [
  {
    name: "Project Basics",
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
      { id: "budgetRange", type: "choice", label: "Budget range", help: "Not binding — it helps us size Phase 1 sensibly.", options: ["<£20k", "£20k–£50k", "£50k–£100k", "£100k+", "Not confirmed"] },
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
        columns: [
          { key: "userType", header: "User type", placeholder: "e.g. Site manager" },
          { key: "internalExternal", header: "Internal/external", placeholder: "Internal" },
          { key: "mainTasks", header: "Main tasks", placeholder: "What they do in the system", width: "1.4fr" },
          { key: "accessLevel", header: "Access level", placeholder: "e.g. Full, read-only" },
        ],
      },
      { id: "external", type: "choice", label: "External access needed?", required: true, options: ["Yes", "No", "Possibly later"] },
      { id: "permissionRestrictions", type: "long", label: "Permission restrictions", help: "Anything certain users must not see or do.", placeholder: "" },
    ],
  },
  {
    name: "Current Process / Workflow Overview",
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
    description: "Break the project into functional areas and prioritise Phase 1.",
    questions: [
      { id: "primarySystemType", type: "choice", label: "Primary system type", required: true, options: ["Job/project management", "Client portal", "Field app", "Compliance", "Document management", "Reporting dashboard", "Materials/waste", "Plant/equipment", "Finance", "Scheduling", "AI/document automation", "Other"] },
      {
        id: "proposedModules",
        type: "rep",
        label: "Proposed modules",
        required: true,
        help: "One row per module. Priority: Must for Phase 1, Nice, or Future.",
        addLabel: "Add module",
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
          { key: "appliesTo", header: "Applies to", placeholder: "e.g. Site", width: ".8fr" },
          { key: "howSet", header: "How set", placeholder: "Manual / calculated", width: ".9fr" },
          { key: "reminder", header: "Reminder?", placeholder: "Yes/No", width: ".6fr" },
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
    description: "Define what users need to see to manage the business.",
    questions: [
      { id: "firstThingUsersSee", type: "long", label: "First thing users need to see", required: true, help: "When they log in on a normal morning.", placeholder: "" },
      {
        id: "dashboardsReports",
        type: "rep",
        label: "Dashboards/reports",
        required: true,
        addLabel: "Add report",
        columns: [
          { key: "name", header: "Name", placeholder: "" },
          { key: "audience", header: "Audience", placeholder: "e.g. Directors", width: ".8fr" },
          { key: "purpose", header: "Purpose", placeholder: "", width: "1.3fr" },
          { key: "frequency", header: "Frequency", placeholder: "e.g. Weekly", width: ".7fr" },
          { key: "exportRequired", header: "Export required", placeholder: "Yes/No", width: ".7fr" },
        ],
      },
      { id: "kpis", type: "long", label: "KPIs/key numbers", help: "Bullet points are fine.", placeholder: "" },
      { id: "viewsRequired", type: "multi", label: "Views required", options: ["List", "Board", "Calendar", "Map", "Dashboard cards", "Table/register", "Detail page", "Mobile", "Client", "Export"] },
    ],
  },
  {
    name: "Documents, Templates and Outputs",
    description: "Capture documents created, reused, stored or issued.",
    questions: [
      { id: "documentsCreated", type: "long", label: "Documents created during the process", help: "Bullet points are fine.", placeholder: "" },
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
      { id: "filesToStore", type: "long", label: "Files to upload, store or link", placeholder: "" },
      { id: "versionControl", type: "choice", label: "Version control needed?", options: ["Yes", "No", "Possibly"] },
      { id: "storageMethod", type: "choice", label: "Store documents or link folders?", options: ["Stored", "Linked", "Hybrid", "Not sure"] },
    ],
  },
  {
    name: "Automation and AI",
    description: "Identify useful automation while keeping control clear.",
    questions: [
      { id: "repetitiveTasks", type: "long", label: "Repetitive tasks to automate", help: "Bullet points are fine.", placeholder: "" },
      { id: "repeatedEmails", type: "long", label: "Repeated emails/messages", help: "Bullet points are fine.", placeholder: "" },
      { id: "repeatedDocuments", type: "long", label: "Repeated documents", help: "Bullet points are fine.", placeholder: "" },
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
      { id: "mustConnectDayOne", type: "long", label: "Must connect from day one", placeholder: "" },
      { id: "canStayManual", type: "long", label: "Can stay manual for Phase 1", placeholder: "" },
    ],
  },
  {
    name: "Data Migration and Existing Files",
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
    description: "Capture how the system will be used and quality expectations.",
    questions: [
      { id: "devicesRequired", type: "multi", label: "Devices required", required: true, options: ["Desktop/web", "Tablet", "Mobile", "Offline mobile", "Not sure"] },
      { id: "expectedUsers", type: "text", label: "Expected users", placeholder: "e.g. 12 internal users" },
      { id: "expectedExternalUsers", type: "text", label: "Expected external users", placeholder: "e.g. 30 client users", showIf: (a) => a.external !== "No" },
      { id: "expectedUsage", type: "choice", label: "Expected usage", options: ["Occasional", "Daily", "Heavy daily", "High-volume operational", "Not sure"] },
      { id: "performanceExpectations", type: "long", label: "Performance/reliability expectations", placeholder: "" },
      { id: "hostingPreference", type: "choice", label: "Hosting preference", options: ["Cloud", "On-premise", "No preference", "Not sure"] },
      { id: "techStackPreference", type: "choice", label: "Preferred tech stack", help: "Do you have one?", options: ["Yes", "No", "No preference"] },
    ],
  },
  {
    name: "Supporting Documents",
    description: "Collect files and links that help scope the work. Helpful examples: spreadsheets, templates, workflow diagrams, screenshots, forms, RFPs, API docs, dashboard examples, wireframes, exports.",
    questions: [
      {
        id: "supportingLinks",
        type: "rep",
        label: "Links",
        addLabel: "Add link",
        columns: [
          { key: "url", header: "URL", placeholder: "https://…" },
          { key: "description", header: "Description", placeholder: "What it shows", width: "1.4fr" },
        ],
      },
      {
        id: "documentUploads",
        type: "rep",
        label: "Document uploads",
        addLabel: "Add document",
        columns: [
          { key: "documentDescription", header: "Document description", placeholder: "What it shows", width: "1.4fr" },
          { key: "file", header: "File", file: true, width: "180px" },
        ],
      },
    ],
  },
  {
    name: "Final Prioritisation",
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
