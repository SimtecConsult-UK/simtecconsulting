// Category grouping and display names come from the design handover.
import type { PolicyCategory, PolicyEntry } from "./types";

export const POLICY_CATEGORIES: PolicyCategory[] = [
  {
    id: "security-it",
    label: "Security & IT",
    subtitle: "Governance of systems, devices, and access",
    policies: [
      { slug: "access-control-policy", name: "Access Control" },
      { slug: "acceptable-use-policy", name: "Acceptable Use" },
      { slug: "ai-use-policy", name: "AI Use" },
      { slug: "approved-software-and-cloud-services-policy", name: "Approved Software and Cloud Services" },
      { slug: "asset-and-change-management-policy", name: "Asset and Change Management" },
      { slug: "backup-and-business-continuity-policy", name: "Backup and Business Continuity" },
      { slug: "cyber-governance-policy", name: "Cyber Governance" },
      { slug: "firewall-management-policy", name: "Firewall Management" },
      { slug: "incident-and-compromise-response-policy", name: "Incident and Compromise Response" },
      { slug: "malware-protection-policy", name: "Malware Protection" },
      { slug: "passwords-and-mfa-policy", name: "Passwords and MFA" },
      { slug: "remote-and-byod-working-policy", name: "Remote and BYOD Working" },
      { slug: "secure-configuration-policy", name: "Secure Configuration" },
      { slug: "secure-software-development-policy", name: "Secure Software Development" },
      { slug: "security-update-policy", name: "Security Update" },
      { slug: "supplier-and-cloud-service-security-policy", name: "Supplier and Cloud Service Security" },
    ],
  },
  {
    id: "data-protection",
    label: "Data protection",
    subtitle: "How client and personal data is handled",
    policies: [
      { slug: "customer-data-and-security-overview", name: "Customer Data and Security Overview" },
      { slug: "customer-subprocessor-list", name: "Customer Subprocessor List" },
      { slug: "data-processing-agreement-and-schedule", name: "Data Processing Agreement and Schedule" },
      { slug: "data-protection-and-retention-policy", name: "Data Protection and Retention" },
      { slug: "incident-response-and-personal-data-breach-plan", name: "Incident Response and Personal Data Breach Plan" },
    ],
  },
  {
    id: "people-workplace",
    label: "People & workplace",
    subtitle: "Standards for how we work together",
    policies: [
      { slug: "equality-diversity-and-inclusion-policy", name: "Equality, Diversity and Inclusion" },
      { slug: "health-and-safety-policy", name: "Health and Safety" },
      { slug: "stress-and-mental-wellbeing-at-work-policy", name: "Stress and Mental Wellbeing at Work" },
    ],
  },
  {
    id: "ethics-responsibility",
    label: "Ethics & responsibility",
    subtitle: "Conduct, transparency, and environmental commitments",
    policies: [
      { slug: "anti-corruption-and-bribery-policy", name: "Anti-Corruption and Bribery" },
      { slug: "anti-slavery-and-human-trafficking-policy", name: "Anti-Slavery and Human Trafficking" },
      { slug: "slavery-and-human-trafficking-statement", name: "Slavery and Human Trafficking Statement" },
      { slug: "whistleblowing-policy", name: "Whistleblowing" },
      { slug: "environmental-and-corporate-responsibility-policy", name: "Environmental and Corporate Responsibility" },
    ],
  },
];

export const ALL_POLICIES: PolicyEntry[] = POLICY_CATEGORIES.flatMap(
  (category) => category.policies
);

export const POLICY_COUNT = ALL_POLICIES.length;
