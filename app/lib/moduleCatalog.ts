// Single source of truth for Simtec's module catalog — the 5 system
// categories and the modules within each. Consumed by:
//  - app/discovery/data.ts (discovery wizard's system/module questions)
//  - app/components/ModulePicker.tsx (homepage module picker)
//
// Pure content only: React keys and tag colors are ModulePicker-specific
// display concerns, not part of the shared catalog — it derives them locally.
//
// `id` is a permanent identifier, independent of display order or wording —
// it must never change once assigned, even if a module's name/description is
// later edited. ModulePicker's RECOMMENDED table anchors on it, so a reorder,
// insert, or rename elsewhere in this file can't silently repoint it.

export type ModuleCatalogEntry = {
  id: string;
  name: string;
  description: string;
};

export type ModuleCategory = {
  header: string;
  modules: ModuleCatalogEntry[];
};

export const MODULE_CATALOG: ModuleCategory[] = [
  {
    header: "Project Management & Field Productivity",
    modules: [
      { id: "project-job-management", name: "Project & Job Management", description: "Projects, jobs and tasks start-to-finish: status, notes and documents." },
      { id: "planning-scheduling", name: "Planning & Scheduling", description: "Plan people, plant and equipment on calendar or Gantt views." },
      { id: "emergency-call-out-management", name: "Emergency Call-Out Management", description: "Log urgent reactive jobs and dispatch the right people fast." },
      { id: "site-diaries-field-reporting", name: "Site Diaries & Field Reporting", description: "Daily diaries, labour, plant, materials, delays and photos." },
      { id: "mobile-operative-driver-workflows", name: "Mobile Operative & Driver Workflows", description: "Mobile forms for job updates, photos, signatures and PODs." },
    ],
  },
  {
    header: "Fleet, Asset & Logistics",
    modules: [
      { id: "dispatch-logistics", name: "Dispatch & Logistics", description: "Collections, deliveries, routes, progress and proof of delivery." },
      { id: "plant-equipment-asset-tracking", name: "Plant, Equipment & Asset Tracking", description: "Live register of vehicles, skips and plant: who has what, and where." },
      { id: "maintenance-servicing-records", name: "Maintenance & Servicing Records", description: "Servicing, repairs, inspections, MOTs and certification reminders." },
      { id: "vehicle-safety-checks", name: "Vehicle Safety Checks", description: "Daily driver checks on mobile, with instant defect flagging." },
    ],
  },
  {
    header: "Compliance, HSEQ & Environmental",
    modules: [
      { id: "hseq-management", name: "HSEQ Management", description: "RAMS, toolbox talks, permits, incidents, NCRs, audits and dashboards." },
      { id: "waste-materials-tracking", name: "Waste & Materials Tracking", description: "Movements, Waste Transfer Notes, Consignment Notes and compliance records." },
      { id: "environmental-carbon-reporting", name: "Environmental & Carbon Reporting", description: "Reuse, transport, emissions and ESG-ready reporting." },
    ],
  },
  {
    header: "Commercial, Finance & Client",
    modules: [
      { id: "quotes-pos-applications-for-payment", name: "Quotes, POs & Applications for Payment", description: "Quotes, POs, dayworks, applications and invoice preparation." },
      { id: "field-to-invoice-workflows", name: "Field-to-Invoice Workflows", description: "Link signed site records straight into commercial processes." },
      { id: "client-portals", name: "Client Portals", description: "Secure client access to progress, reports, documents and history." },
      { id: "automated-forms-pdfs-notifications", name: "Automated Forms, PDFs & Notifications", description: "Forms that trigger approvals, PDFs, emails and SMS alerts." },
    ],
  },
  {
    header: "Admin Systems & Integrations",
    modules: [
      { id: "timesheets-labour-capture", name: "Timesheets & Labour Capture", description: "Time against jobs and cost codes, approvals and payroll export." },
      { id: "training-certification-management", name: "Training & Certification Management", description: "Track training, licences and expiry dates with reminders." },
      { id: "recruitment-applicant-tracking", name: "Recruitment & Applicant Tracking", description: "Manage CVs, applications and vacancies in one dashboard." },
      { id: "system-integrations", name: "System Integrations", description: "Connect Xero, Sage, OneDrive, SharePoint, tracking and HR tools." },
    ],
  },
];
