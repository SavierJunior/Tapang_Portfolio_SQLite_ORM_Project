// Static portfolio content lives here. Projects, messages, the profile picture and the resume come from SQLite via the API.

export const profile = {
  fullName: "Andrei Nathaniel Enzio T. Tapang",
  shortName: "Andrei Tapang",
  initials: "AT",
  brandName: "ANDREI",
  brandTagline: "IT • CREATIVE",
  footerName: "ANDREI TAPANG",
  footerTagline: "IT STUDENT • ANIMATION & MOTION GRAPHICS",
  image: "/profile.jpg",
};

export const hero = {
  label: "Information Technology Student",
  titleLine1: "Where Technology",
  titleLine2: "Meets Creativity.",
  focusAreaText: "Animation and Motion Graphics.",
  highlights: ["Creative Focus", "IT Background", "Student Projects"],
  floatingCards: [
    { symbol: "✦", label: "Focus", value: "Animation" },
    { symbol: "◈", label: "Creative", value: "Motion Graphics" },
  ],
  badge: "CREATIVE PORTFOLIO",
};

export const about = {
  titleLine1: "Technology is my foundation.",
  titleLine2: "Creativity is my direction.",
  lead: "Information Technology student",
  leadBefore: "I am an ",
  leadAfter: " interested in combining technical knowledge with visual creativity.",
  body: "My creative interests include animation, motion graphics, 3D design and digital visual production. Through academic and personal projects, I continue to explore how technology can be used to create engaging digital experiences.",
  details: [
    { label: "Field", value: "Information Technology" },
    { label: "Creative area", value: "Animation & Motion Graphics" },
    { label: "Approach", value: "Technology + Visual Creativity" },
    { label: "Portfolio type", value: "Student Creative Portfolio" },
  ],
};

export const skills = {
  titleLine1: "Skills that bring",
  titleLine2: "ideas to life.",
  intro:
    "Technical knowledge and creative interests developed through learning, practice and project work.",
  items: [
    { icon: "animation", title: "Animation", description: "Creative animation and visual storytelling" },
    { icon: "motion", title: "Motion Graphics", description: "Motion, typography and transitions" },
    { icon: "cube", title: "3D Design", description: "3D modeling and visual composition" },
    { icon: "design", title: "Creative Design", description: "Digital and visual design" },
  ],
};

// The project cards themselves now live in SQLite (managed in the Admin Dashboard). The three
// original projects were moved to the database by `npm run db:seed` (backend/prisma/seed-data/projects.json).
export const projects = {
  titleLine1: "Selected",
  titleLine2: "works.",
  intro: "Academic and creative projects representing my current interests and development.",
};

export const education = {
  titleLine1: "Learning today,",
  titleLine2: "creating tomorrow.",
  status: "Current",
  level: "Bachelor's degree",
  degree: "Bachelor of Science in Information Technology",
  school: "Laguna State Polytechnic University",
  progress: "Currently Studying",
};

export const resume = {
  title: "My Resume",
  text: "View my student resume for my education, creative skills, selected projects and academic development.",
  file: "/resume.pdf",
  downloadName: "Andrei_Tapang_Resume.pdf",
};

export const achievements = {
  titleLine1: "Built through",
  titleLine2: "projects and practice.",
  items: [
    {
      title: "Creative Academic Projects",
      text: "Developed creative outputs and system concepts through academic projects in Information Technology.",
    },
    {
      title: "Animation & Motion Graphics",
      text: "Created and explored digital visual outputs involving animation, motion graphics, and creative design.",
    },
    {
      title: "Creative Technology Development",
      text: "Applied technology and creative skills in developing digital projects and visual experiences.",
    },
  ],
};

export const contact = {
  titleLine1: "Let's create",
  titleLine2: "something",
  titleLine3: "meaningful.",
  description: "Have a project, idea or opportunity? Feel free to reach out.",
  // Optional: add a real public email address and set isPlaceholder to false to show it beside the form.
  // Messages sent through the form are saved in the database whether or not this is set.
  email: "your-email@example.com",
  isPlaceholder: true,
};
