export const RESUME_SECTIONS = [
  { id: "experience", number: "01", title: "Experience" },
  { id: "open-source", number: "02", title: "Open Source" },
  { id: "other-experience", number: "03", title: "Other Experience" },
  { id: "education", number: "04", title: "Education" },
] as const;

export type ResumeSectionId = (typeof RESUME_SECTIONS)[number]["id"];
