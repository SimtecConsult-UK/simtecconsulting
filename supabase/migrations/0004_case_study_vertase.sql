-- The third case study: Vertase / VertaVerse.
--
-- The logo is a black version of the partner-band mark, made for this section:
-- '/logos/vertase-fli.svg' is a white knockout and would be invisible here,
-- which is the same reason the other two use their '-color' variants. It lives
-- in /public alongside them, so do not sweep it up as an unused asset.
--
-- The recording is the same stand-in the other two use, until Vertase's own
-- screen capture is ready.
--
-- The chapters are dollar-quoted and wrapped rather than held on one very long
-- line: a 3,800-character line is the kind of thing a paste truncates, and a
-- cut string literal turns the rest of the file into nonsense SQL.
--
-- Re-running is a no-op: the guard is on position 3, so this is safe against a
-- database that already holds the first two.

insert into public.case_studies (
  position, tab_label, headline, client_name, system_name, project_type,
  logo_path, logo_width, logo_height, video_path, video_poster_path,
  quote, quote_attribution, chapters
)
select
  3,
  'Vertase',
  'Improved compliance visibility across complex remediation projects',
  'Vertase FLI Ltd',
  'VertaVerse',
  'Digital materials management / brownfield remediation / compliance platform',
  '/logos/vertase-fli-black.svg', 113, 88,
  '/video1-section1.webm',
  null::text,
  'Simtec listens, understands the requirement and delivers. Rare these days.',
  'Steve Edgar · MD, Vertase FLI',
  $json$
{
  "summary": {
    "paragraphs": [
      "VertaVerse is a digital materials management platform designed to help Vertase manage complex remediation projects with better visibility, consistency and control.",
      "The system brings key project information, soil and material movement data, testing records, compliance information and reporting workflows into one connected platform. This helps project teams reduce manual admin, improve audit readiness and provide clients with a smarter, faster and more transparent way of working.",
      "Vertase is now part of the Adler & Allan Group."
    ],
    "bullets": [],
    "closing": []
  },
  "problem": {
    "paragraphs": [
      "Before VertaVerse, Vertase already had strong processes and experienced teams managing complex brownfield remediation projects. However, as project demands grew, the administrative burden also increased.",
      "Tracking material movements, managing test data, producing audit-ready reports and maintaining compliance visibility across projects required significant manual effort. Information could sit across spreadsheets, documents, individual users and disconnected workflows, making it harder to maintain consistency, reduce duplication and provide real-time visibility to teams and clients.",
      "The main challenges included:"
    ],
    "bullets": [
      "Tracking soil and material movements across projects",
      "Managing test data and environmental records",
      "Producing audit-ready reports",
      "Reducing double entry and manual admin",
      "Improving consistency across project teams",
      "Maintaining visibility of DoWCoP / MMP compliance",
      "Giving clients clearer access to project and compliance information",
      "Using environmental data to support sustainability and better decision-making"
    ],
    "closing": []
  },
  "solution": {
    "paragraphs": [
      "VertaVerse helps Vertase manage materials, compliance and reporting through one connected digital platform.",
      "The system gives project teams a clearer view of material movements, project progress, testing information, compliance status and reporting requirements. By centralising the information that matters, VertaVerse reduces reliance on manual processes and makes it easier for teams to work consistently across projects.",
      "The system supports:"
    ],
    "bullets": [
      "Live tracking of material movements",
      "Centralised project and environmental data",
      "Test result management",
      "Breach notifications and compliance visibility",
      "Project dashboards",
      "Click-to-generate reporting",
      "Secure user permissions",
      "Improved collaboration across project teams and stakeholders",
      "Optional carbon and sustainability reporting"
    ],
    "closing": [
      "Rather than forcing the business into a rigid off-the-shelf platform, VertaVerse was developed around how Vertase actually manages complex remediation work."
    ]
  },
  "value": {
    "paragraphs": [
      "VertaVerse has helped Vertase reduce admin, improve visibility and strengthen the way project information is managed across the business.",
      "By bringing material movements, testing information, compliance data and reporting workflows into one platform, teams can access the information they need more quickly and manage projects with greater consistency.",
      "The impact includes:"
    ],
    "bullets": [
      "Reduced manual admin and duplicated data entry",
      "Improved visibility of live compliance information",
      "Faster access to project and materials data",
      "Stronger audit readiness",
      "More consistent project delivery",
      "Reduced risk around reporting and compliance",
      "Better information for clients and stakeholders",
      "A stronger tech-enabled proposition for tenders and client conversations",
      "Improved ability to manage complex projects at scale"
    ],
    "closing": [
      "VertaVerse has also helped position Vertase as a forward-thinking business using digital systems to improve transparency, sustainability and compliance in brownfield remediation."
    ]
  }
}
  $json$::jsonb
where not exists (
  select 1 from public.case_studies where position = 3
);
