// Simple ATS-Friendly Resume Template Names that AI can understand
export const TEMPLATES = [
  {
    id: "jakes-resume",
    name: "Jake's Resume",
    description:
      "The iconic LaTeX template, experience-first, clean, ATS-optimized, and widely used by software engineers and professionals.",
    aiTemplateName: "Jake",
    category: "professional",
    priority: 1,
    previewImage: "/JakeResumePreview.png",
  },
];

export const TEMPLATE_CATEGORIES = {
  PROFESSIONAL: "professional",
};

export const getTemplateById = (id) => {
  return TEMPLATES.find((template) => template.id === id);
};

export const getTemplatesByCategory = (category) => {
  return TEMPLATES.filter((template) => template.category === category);
};

export const getFeaturedTemplates = () => {
  return TEMPLATES.sort((a, b) => a.priority - b.priority).slice(0, 6);
};
