import type { Resume } from "./resume";

// resume.ts를 손으로 옮긴 영어판이다(번역 스크립트 대상이 아니다). 수치와 고유명사는
// 원본 그대로 두고, 글 링크는 slug만 같다.
export const resumeData = {
  profile: {
    name: "Yu Jiseok",
    title: "Frontend Developer",
    introduction: [
      "I build the frontend for Coloso's global commerce service. I use agents to raise productivity, and I care about how to keep quality high while doing it.",
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
            "A service built from scratch, including subscription and one-time payments and refunds, on a deadline set by the card payment review",
          achievements: [
            "Designed an agent-based workflow that carried work from requirements review through implementation, QA, and release, and shipped 20 customer-facing screens and 34 admin screens together, on schedule, in about 75 working days",
            "Verified QA's expected test-case results with Vitest and Playwright before QA began, which cut first-round QA defect density by about 56% (8.5 to 3.7 per 1,000 lines) even though the codebase was 2.5x the size of the previous project (the portfolio service)",
            "Automated recurring procedures with 8 Claude Code skills and designed a harness for areas where money and data consistency matter, such as payments, capacity, and refunds",
          ],
          postSlug: "delegate-to-agents",
          linkText: "Trying Out Delegating Work to Agents",
        },
        {
          title:
            "Optimized service performance and infrastructure efficiency by improving the Next.js rendering strategy",
          summary:
            "force-dynamic made every page render through SSR on each request, which put heavy load on the servers",
          achievements: [
            "Replaced the SSR-for-every-page setup with a mixed SSG/SSR/ISR strategy chosen per page, and introduced the Next.js cache",
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
            "CI slowed down as packages grew, while the cache broke on every rebase and couldn't be shared across branches",
          achievements: [
            "Introduced Turborepo and a tsdown-based build setup to manage dependencies between packages more efficiently",
            "Built a Turborepo Remote Cache on GCS to get around the GitHub Actions cache limits (keys tied to the commit SHA, and restrictions on sharing across branches)",
            "Cut CI build time by 96% on a full cache hit (FULL TURBO), from 146s to 6s",
          ],
          postSlug: "turborepo",
          linkText: "Adopting Turborepo Remote Cache",
        },
        {
          title: "Portfolio service development and performance tuning",
          summary:
            "Stacking portfolios of different sizes in a masonry layout while keeping infinite scroll fast",
          achievements: [
            "Added virtual scrolling to the infinite-scroll view, reducing rendering time by 46% and long-task time by 41%",
            "Prevented unnecessary re-renders with memoization, cutting script execution time while scrolling by 42%",
          ],
          postSlug: "how-to-implement-portfolio",
          linkText: "Looking Back on Implementing the Service's Masonry Layout",
        },
        {
          title: "Switching to client-side navigation",
          achievements: [
            "Fixed internal links in dynamically rendered HTML that caused full page reloads (server-side navigation) by building an interception hook that catches link clicks and routes them on the client",
            "Cut script execution time by 78% and total execution time by 46% by removing unnecessary page loads",
          ],
          postSlug: "improve-navigation",
          linkText: "Improving Server-Side Navigation in Our Service",
        },
        {
          title: "Designed and built the foundation of Coloso's design system",
          achievements: [
            "Designed a variants-based architecture and merged the components that had been split by KR/JP/INTL service into one set, for UI consistency",
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
