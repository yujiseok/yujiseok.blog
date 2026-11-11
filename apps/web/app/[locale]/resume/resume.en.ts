import type { Resume } from "./resume";

// resume.ts를 손으로 옮긴 영어판이다(번역 스크립트 대상이 아니다). 수치와 고유명사는
// 원본 그대로 두고, 글 링크는 slug만 같다.
export const resumeData = {
  profile: {
    name: "Yu Jiseok",
    title: "Frontend Developer",
    introduction: [
      "I build the frontend for Coloso's global commerce service. I like finding a better way, applying it, and checking what changed.\nI improve the user experience and service performance, and write the technical decisions and what I learned along the way on this blog.",
      "I want a culture where we share what we learn with each other.",
    ],
  },
  workExperience: [
    {
      company: "Day1 Company Coloso",
      period: "Nov 2023 - Present",
      url: "https://coloso.co.kr",
      color: "#ffb200",
      projects: [
        {
          title: "Built and operated the new Creator Membership",
          summary:
            "Built a creator membership service that supports subscription and one-time payments through refunds",
          achievements: [
            "Carried the work from requirements review through implementation, QA, and release, and shipped 20 customer-facing screens and 34 admin screens in about 75 working days",
            "Checked the expected results of QA test cases with Vitest and Playwright beforehand, cutting first-round QA defect density by about 56% compared with the previous project (8.5 to 3.7 per 1,000 lines)",
            "Automated recurring development procedures with 8 agent skills, and built a harness that checks transaction consistency for payments, capacity, and refunds",
          ],
          postSlug: "delegate-to-agents",
          linkText: "Trying Out Delegating Work to Agents",
        },
        {
          title:
            "Built a shared server auth package and moved tokens to HttpOnly cookies",
          summary:
            "Reduced the risk of token theft through XSS, and improved client-side auth handling and the duplicated auth logic across three services",
          achievements: [
            "Moved auth tokens managed on the client into HttpOnly cookies, and relayed API requests through a Route Handler-based BFF",
            "Moved auth checks and page access control off the client and into the Next.js proxy, so the server checks whether the user is signed in",
            "Merged KR, JP, and INTL auth logic into a shared package, cutting per-app auth code by 82% (826 to 148 lines), and split OAuth into a provider adapter",
          ],
        },
        {
          title:
            "Optimized service performance and infrastructure efficiency by improving the Next.js rendering strategy",
          summary:
            "force-dynamic rendered every page dynamically on each request, which put heavy load on the servers",
          achievements: [
            "Split the dynamic rendering forced on every page into SSG, SSR, or ISR by page, and applied the Next.js cache",
            "Cut p95 response time by 75% with caching (800ms to 200ms)",
            "Reduced GCP infrastructure costs by cutting network traffic by 80% and active containers by 60%",
          ],
          postSlug: "nextjs-rendering-optimization",
          linkText: "Improving Our Next.js Rendering Strategy",
        },
        {
          title:
            "Migrated to a Turborepo monorepo and optimized CI build performance",
          summary:
            "CI builds slowed as packages grew, and cache reuse was limited because the cache was tied to commits and branches",
          achievements: [
            "Introduced Turborepo and tsdown, and built a pipeline that builds packages according to their dependencies",
            "Replaced the GitHub Actions cache with a GCS-based Remote Cache so the cache can be reused across branches",
            "Cut CI build time by about 96% on a full cache hit (FULL TURBO), from 146s to 6.5s",
          ],
          postSlug: "turborepo",
          linkText: "Adopting Turborepo Remote Cache",
        },
        {
          title: "Portfolio service development and performance tuning",
          summary:
            "Placing works of different sizes in a masonry layout while reducing the render cost as the data grew",
          achievements: [
            "Built a masonry layout that follows a placement policy per viewport and each image's aspect ratio",
            "Added virtual scrolling, reducing rendering time by 47% and long-task duration by 41%",
            "Reduced unnecessary re-renders with memoization, cutting script execution time while scrolling by 42%",
          ],
          postSlug: "how-to-implement-portfolio",
          linkText: "Looking Back on Implementing the Service's Masonry Layout",
        },
        {
          title: "Switching to client-side navigation",
          summary:
            "Internal links in HTML injected by the CMS reloaded the whole page",
          achievements: [
            "Built a shared hook that catches internal link clicks with event delegation and routes them through the Next.js router as client-side navigation",
            "Removed full page reloads, cutting script execution time by 78% and total time in the measured range by 46%",
          ],
          postSlug: "improve-navigation",
          linkText: "Improving Server-Side Navigation in Our Service",
        },
        {
          title: "Designed and built the foundation of Coloso's design system",
          achievements: [
            "Merged the shared UI components of KR, JP, and INTL, and designed the per-service differences to be managed as variants",
            "Automated design tokens with the Figma MCP, documented components in Storybook, and set up a Vitest test environment",
          ],
        },
        {
          title: "GENCON conference landing page",
          achievements: [
            "Built scroll animation, typewriter interactions, and a survey, contributing to recruiting about 1,000 conference attendees",
          ],
          postSlug: "2024-gencon",
          linkText: "Looking Back on the GENCON Landing Page",
        },
      ],
    },
  ],
  openSource: [
    {
      title: "Turborepo",
      period: "Jan 2026",
      description:
        "Fixed an incorrect path in the docs' run script in package.json",
      link: "https://github.com/vercel/turborepo/pull/11551",
    },
    {
      title: "Supabase Docs",
      period: "May 2025",
      description:
        "Fixed a link related to authentication (Apple REST API) in the official docs",
      link: "https://github.com/supabase/supabase/pull/35404",
    },
    {
      title: "React Docs",
      period: "Mar 2023",
      description:
        "Fixed a syntax error in an example in the official React docs",
      link: "https://github.com/reactjs/react.dev/pull/5791",
      blogSlug: "how-i-contributed-react-docs",
      blogLinkText: "Looking Back on Contributing to the React Docs",
    },
  ],
  otherExperience: [
    {
      title: "Mentor, Kim Min-tae's Dev Camp",
      period: "May 2024 - Jan 2025",
      description:
        "Ran 40+ live mentoring sessions across two cohorts, and gave code reviews and technical feedback on React projects",
      color: "#fc1c49",
      details: [],
    },
  ],
  contact: {
    email: "koesijuy@gmail.com",
    github: "https://github.com/yujiseok",
    blog: "https://yujiseok.blog",
  },
  education: [
    {
      school: "Hansung University, Fashion Design",
      period: "Mar 2015 - Aug 2022",
    },
  ],
} satisfies Resume;
