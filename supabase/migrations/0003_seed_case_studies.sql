-- Seeds the two real case studies, so a new project starts with the content
-- the site is already showing.
--
-- Two things worth knowing about the media it points at:
--
--   * Both rows share '/video1-section1.webm', a stand-in recording used until
--     each client's own screen capture is ready.
--   * The logos are the '-color' variants on purpose. The plain
--     'jackson-geo-services.svg' is a white knockout for the dark hero band and
--     would be invisible on this section, which sits on white and pale blue.
--
-- All three files live in /public rather than storage, and publicUrl() passes
-- any path starting with "/" straight through. They are referenced only from
-- here, so do not delete them as unused assets. Replacing a logo or recording
-- through the editor uploads it properly and stops using the /public copy.
--
-- Guarded rather than ON CONFLICT, because the position constraint is
-- deferrable and so cannot arbitrate a conflict. Re-running is a no-op.

do $seed$
begin
  if exists (select 1 from public.case_studies) then
    raise notice 'case_studies already has rows; nothing seeded.';
    return;
  end if;

  insert into public.case_studies (
    position, tab_label, headline, client_name, system_name, project_type,
    logo_path, logo_width, logo_height, video_path, video_poster_path,
    quote, quote_attribution, chapters
  ) values
    (
      1,
      'Compli Digital',
      'Compliance, reporting and best practice for the waste sector.',
      'Compli Digital Ltd',
      'Compli Digital / TCMF System',
      'Waste management compliance platform / TCM reporting portal / client portal / knowledge-sharing platform',
      '/logos/compli-digital-color.png', 281, 218,
      '/video1-section1.webm',
      null,
      'Compli Digital is about more than digitising compliance. It gives TCMs and waste professionals a place to manage reporting, share knowledge, promote best practice and support better standards across the industry.',
      'Tina · Compli Digital',
      '{"summary":{"paragraphs":["Compli Digital is a software, compliance and knowledge-sharing platform designed specifically for the waste management industry.","It helps waste operators, Technical Competent Managers and clients move away from fragmented paper records, spreadsheets and emails by bringing site reporting, compliance tasks, operational checks, client visibility, knowledge sharing and best practice into one digital platform.","Tina’s vision was to create more than a reporting tool. The platform is designed to support better compliance management, better access to information and better sharing of knowledge across the waste sector."],"bullets":[],"closing":[]},"problem":{"paragraphs":["The waste sector relies on accurate records, repeatable checks, evidence capture, environmental task tracking and audit-ready reporting.","For many operators and TCMs, this information is often managed through paper records, spreadsheets, emails and disconnected documents. This makes it harder to keep information consistent, track actions, manage site activity and give clients clear visibility of what has been done.","Compli Digital needed a platform that could support both the practical compliance workflows of TCMs and the wider goal of improving knowledge sharing and best practice across the industry.","The main challenges included:"],"bullets":["Replacing paper records, spreadsheets and email trails","Supporting TCMs working across multiple clients and sites","Creating flexible report templates for different checks and site types","Managing site reports, actions, evidence and follow-up tasks","Giving clients clear access to reports, dashboards and outstanding actions","Supporting mobile use for users working on site","Creating a central place for TCMs to share knowledge and best practice","Building a scalable platform for the waste management industry"],"closing":[]},"solution":{"paragraphs":["Simtec developed a custom digital platform for Compli Digital, designed around the needs of waste-sector operators, TCMs and their clients.","The system combines a professional web forum, reporting portal and client portal in one platform. Users can create and manage reports, build templates, assign actions, upload evidence, export reports and give clients controlled access to relevant site information.","The platform also includes a knowledge-sharing area where TCMs and waste professionals can ask questions, share practical experience and promote best practice.","The system supports:"],"bullets":["Professional TCM forum","Topic-based discussions","Searchable posts and tags","Bookmarked content","Pinned best-practice updates","Report template builder","Site report creation","Client and site management","Action tracking","Evidence uploads","Client dashboards","Site data exports","Time-on-site tracking","Client portal access","User permissions and administration","Audit logging","Mobile-first access for users working on site"],"closing":[]},"value":{"paragraphs":["The intended value is to help Compli Digital:"],"bullets":["Give waste operators one digital place to manage compliance activity","Help TCMs create reports, manage actions and capture evidence more consistently","Give clients clearer access to reports, site information and outstanding actions","Reduce reliance on paper, spreadsheets and email trails","Support audit-ready compliance management","Create a professional knowledge-sharing space for the waste sector","Promote best practice across TCMs, operators and clients","Build a scalable platform that can grow with the business"],"closing":[]}}'::jsonb
    ),
    (
      2,
      'Jackson Geo-Services',
      'Simtec made 100% growth in 12 months possible.',
      'Jackson Geo-Services Ltd',
      'CORE',
      'Operational management / H&S / scheduling / training / plant / project management system',
      '/logos/jackson-geo-services-color.svg', 470, 166,
      '/video1-section1.webm',
      null,
      E'Creating a holistic business management system has been my dream for a decade.\n\nSimtec helped us turn that dream into reality.',
      'Jackson Geo-Services',
      '{"summary":{"paragraphs":["CORE is a central operational management system designed to help Jackson manage key business workflows in one connected platform.","The system brings together project management, H&S, scheduling, training, plant, enquiries and operational data, giving the team better visibility, more consistent information and a stronger foundation for growth."],"bullets":[],"closing":[]},"problem":{"paragraphs":["Before CORE, Jackson had a growing business with multiple operational areas that needed to be managed consistently across teams, projects and departments.","As the business scaled, it became harder to rely on separate spreadsheets, manual processes, disconnected systems and knowledge held by individuals. Key information around projects, plant, training, scheduling, H&S and enquiries needed to be easier to capture, manage and access.","The main challenges included:"],"bullets":["Managing project information across multiple teams","Keeping operational data consistent","Tracking H&S information and actions","Managing scheduling and resource planning","Tracking training, competencies and certification","Managing plant and equipment visibility","Handling enquiries and project information in a structured way","Reducing reliance on spreadsheets and manual admin","Giving management better visibility across the business","Creating a system that could support growth"],"closing":[]},"solution":{"paragraphs":["CORE helps Jackson manage key operational workflows through one integrated system.","The platform gives teams a central place to manage projects, actions, scheduling, H&S, training, plant, enquiries and wider operational information. By standardising how data is captured and shared, CORE helps create a more consistent way of working across the business.","The system supports:"],"bullets":["Project and operational management","H&S workflows and records","Scheduling and planning","Training and certification tracking","Plant and equipment management","Enquiry and opportunity management","Project records and status tracking","Dashboards and management visibility","Standardised data capture","Reduced reliance on disconnected spreadsheets"],"closing":["Rather than forcing Jackson into a rigid off-the-shelf platform, CORE was developed around the way the business actually operates and the workflows needed to support continued growth."]},"value":{"paragraphs":["CORE has helped Jackson create a more connected and scalable operational structure.","By bringing key workflows into one system, the business has improved visibility, reduced fragmentation and created a stronger foundation for managing growth. Teams can access information more consistently, managers have a clearer view of what is happening across the business, and operational processes are better standardised.","The impact includes:"],"bullets":["Improved visibility across projects, teams and departments","More consistent operational data","Reduced reliance on spreadsheets and manual processes","Better tracking of H&S, training, plant and project information","Clearer scheduling and resource planning","Improved management oversight","Stronger internal processes to support business growth","A more scalable way to manage operational information"],"closing":["CORE has helped Jackson move from disconnected information and manual workflows towards a more structured, integrated and data-led way of operating."]}}'::jsonb
    );

end;
$seed$;
