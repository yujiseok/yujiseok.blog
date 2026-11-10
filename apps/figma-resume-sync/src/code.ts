/*
 * Resume Sync: 개발 서버의 /resume.json(원본은 app/[locale]/resume/resume*.ts)을 읽어
 * 「Resume KO」「Resume EN」 페이지에 A4 프레임을 다시 그린다.
 *
 * 디자인의 원본은 「Resume Template」 페이지다. 컴포넌트, 텍스트 스타일 Resume/*, 간격 변수
 * Resume/*가 들어 있고, 없을 때만 처음 한 번 만든다. 그 뒤로는 사람이 Figma에서 고친 값을
 * 그대로 쓴다. 생성된 프레임은 매번 지우고 다시 그리므로, 내용은 Figma가 아니라 resume.ts에서 고친다.
 */
import { paginate, type Block } from "./paginate";

const DATA_URL = "http://localhost:3000/resume.json";
const MARK = "resume-sync";
const TEMPLATE_PAGE = "Resume Template";
const PAGE = { width: 794, height: 1123 };
const FONT = "Pretendard";

type Link = { text: string; url?: string };
type Resume = {
  profile: { name: string; title: string; introduction: string[] };
  contact: { email: string; github: string; blog: string };
  workExperience: {
    company: string;
    period: string;
    projects: {
      title: string;
      summary?: string;
      achievements: string[];
      postUrl?: string;
      linkText?: string;
    }[];
  }[];
  openSource: {
    title: string;
    period: string;
    description: string;
    link: string;
  }[];
  otherExperience: {
    title: string;
    period: string;
    description: string;
    details: string[];
  }[];
  education: { school: string; period: string }[];
};
type Payload = {
  sectionTitles: Record<
    "experience" | "openSource" | "otherExperience" | "education",
    string
  >;
  ko: Resume;
  en: Resume;
};

/* ---------- 템플릿: 텍스트 스타일 · 간격 변수 · 컴포넌트 ---------- */

const STYLES = {
  Name: { size: 29, style: "Bold", lh: 130 },
  Title: { size: 15, style: "Medium", lh: 150 },
  Section: { size: 18, style: "Bold", lh: 140 },
  Company: { size: 16, style: "Bold", lh: 150 },
  Heading: { size: 14, style: "Bold", lh: 160 },
  Intro: { size: 14, style: "Regular", lh: 160 },
  Body: { size: 13, style: "Regular", lh: 160 },
  Link: { size: 12, style: "Regular", lh: 160 },
} as const;
type StyleName = keyof typeof STYLES;

const SPACES = {
  "page/padding-x": 60,
  "page/padding-y": 56,
  section: 40,
  "section-body": 16,
  project: 20,
  entry: 12,
} as const;
type SpaceName = keyof typeof SPACES;

const COLOR = {
  ink: { r: 0.09, g: 0.09, b: 0.09 },
  sub: { r: 0.42, g: 0.42, b: 0.42 },
  line: { r: 0.88, g: 0.88, b: 0.88 },
};

const COMPONENTS = [
  "Resume/Profile",
  "Resume/Section Head",
  "Resume/Company Head",
  "Resume/Project Head",
  "Resume/Summary",
  "Resume/Bullet",
  "Resume/Entry",
] as const;
type ComponentName = (typeof COMPONENTS)[number];

type Template = {
  components: Record<ComponentName, ComponentNode>;
  spaces: Record<SpaceName, Variable>;
  spaceValue: (name: SpaceName) => number;
};

const solid = (color: RGB): SolidPaint => ({ type: "SOLID", color });

async function ensureStyles() {
  const existing = await figma.getLocalTextStylesAsync();
  const byName = new Map(existing.map((s) => [s.name, s]));
  const styles = {} as Record<StyleName, TextStyle>;

  for (const [name, spec] of Object.entries(STYLES) as [
    StyleName,
    (typeof STYLES)[StyleName],
  ][]) {
    let style = byName.get(`Resume/${name}`);
    if (!style) {
      const fontName = { family: FONT, style: spec.style };
      await figma.loadFontAsync(fontName);
      style = figma.createTextStyle();
      style.name = `Resume/${name}`;
      style.fontName = fontName;
      style.fontSize = spec.size;
      style.lineHeight = { unit: "PERCENT", value: spec.lh };
    }
    styles[name] = style;
  }

  // 사람이 Figma에서 바꾼 글꼴까지 포함해 실제로 쓰이는 글꼴을 모두 불러 둔다
  await Promise.all(
    Object.values(styles).map((s) => figma.loadFontAsync(s.fontName)),
  );
  return styles;
}

async function ensureSpaces() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const collection =
    collections.find((c) => c.name === "Resume") ??
    figma.variables.createVariableCollection("Resume");
  const modeId = collection.modes[0].modeId;
  const variables = await figma.variables.getLocalVariablesAsync("FLOAT");
  const spaces = {} as Record<SpaceName, Variable>;

  for (const [name, value] of Object.entries(SPACES) as [SpaceName, number][]) {
    let variable = variables.find(
      (v) =>
        v.name === `space/${name}` && v.variableCollectionId === collection.id,
    );
    if (!variable) {
      variable = figma.variables.createVariable(
        `space/${name}`,
        collection,
        "FLOAT",
      );
      variable.scopes = ["GAP"];
      variable.setValueForMode(modeId, value);
    }
    spaces[name] = variable;
  }

  return {
    spaces,
    spaceValue: (name: SpaceName) =>
      spaces[name].valuesByMode[modeId] as number,
  };
}

async function text(
  styles: Record<StyleName, TextStyle>,
  style: StyleName,
  characters: string,
  color: RGB = COLOR.ink,
) {
  const node = figma.createText();
  await node.setTextStyleIdAsync(styles[style].id);
  node.characters = characters;
  node.fills = [solid(color)];
  return node;
}

function autoLayout<T extends FrameNode | ComponentNode>(
  node: T,
  direction: "VERTICAL" | "HORIZONTAL",
  gap: number,
): T {
  node.layoutMode = direction;
  node.itemSpacing = gap;
  node.primaryAxisSizingMode = "AUTO";
  node.counterAxisSizingMode = "AUTO";
  node.fills = [];
  return node;
}

function fill(parent: FrameNode | ComponentNode, child: SceneNode) {
  parent.appendChild(child);
  if ("layoutSizingHorizontal" in child) child.layoutSizingHorizontal = "FILL";
  if (child.type === "TEXT") child.textAutoResize = "HEIGHT";
  return child;
}

/* 컴포넌트 하나: 폭은 쪽 본문 폭, 텍스트는 컴포넌트 속성으로 바꿀 수 있게 연결한다 */
function component(name: ComponentName, width: number) {
  const node = figma.createComponent();
  node.name = name;
  autoLayout(node, "VERTICAL", 4);
  node.counterAxisSizingMode = "FIXED";
  node.resize(width, 10);
  return node;
}

function bindText(node: ComponentNode, prop: string, target: TextNode) {
  const key = node.addComponentProperty(prop, "TEXT", target.characters);
  target.componentPropertyReferences = { characters: key };
}

function bindVisible(node: ComponentNode, prop: string, target: SceneNode) {
  const key = node.addComponentProperty(prop, "BOOLEAN", true);
  target.componentPropertyReferences = { visible: key };
}

/* 왼쪽 글 + 오른쪽 보조 글(기간, 링크) 한 줄 */
async function headRow(
  styles: Record<StyleName, TextStyle>,
  left: TextNode,
  right: TextNode,
) {
  const row = autoLayout(figma.createFrame(), "HORIZONTAL", 12);
  row.name = "Head";
  row.counterAxisAlignItems = "MIN";
  fill(row, left);
  row.appendChild(right);
  return row;
}

async function createComponents(
  page: PageNode,
  styles: Record<StyleName, TextStyle>,
  width: number,
) {
  const made = {} as Record<ComponentName, ComponentNode>;

  // 프로필: 이름 · 직함 · 연락처 · 소개
  {
    const c = component("Resume/Profile", width);
    c.itemSpacing = 6;
    const name = await text(styles, "Name", "이름");
    const title = await text(styles, "Title", "직함", COLOR.sub);
    const contact = autoLayout(figma.createFrame(), "HORIZONTAL", 10);
    contact.name = "Contact";
    contact.paddingTop = 4;
    const email = await text(styles, "Body", "email@example.com", COLOR.sub);
    email.name = "Email";
    const github = await text(styles, "Body", "GitHub", COLOR.sub);
    github.name = "GitHub";
    const blog = await text(styles, "Body", "Blog", COLOR.sub);
    blog.name = "Blog";
    for (const t of [email, github, blog]) {
      t.textDecoration = "UNDERLINE";
      contact.appendChild(t);
    }
    const intro = await text(styles, "Intro", "소개");
    c.appendChild(name);
    c.appendChild(title);
    c.appendChild(contact);
    fill(c, intro);
    bindText(c, "Name", name);
    bindText(c, "Title", title);
    bindText(c, "Email", email);
    bindText(c, "Intro", intro);
    made["Resume/Profile"] = c;
  }

  // 섹션 제목: 제목 + 구분선
  {
    const c = component("Resume/Section Head", width);
    c.itemSpacing = 8;
    const title = await text(styles, "Section", "Section");
    const line = figma.createRectangle();
    line.name = "Divider";
    line.resize(width, 1);
    line.fills = [solid(COLOR.line)];
    fill(c, title);
    fill(c, line);
    bindText(c, "Title", title);
    made["Resume/Section Head"] = c;
  }

  // 회사 머리: 회사명 + 기간
  {
    const c = component("Resume/Company Head", width);
    const name = await text(styles, "Company", "회사");
    const period = await text(styles, "Body", "2020.01 - 현재", COLOR.sub);
    fill(c, await headRow(styles, name, period));
    bindText(c, "Company", name);
    bindText(c, "Period", period);
    made["Resume/Company Head"] = c;
  }

  // 프로젝트 머리: 제목 + 블로그 글 링크
  {
    const c = component("Resume/Project Head", width);
    const title = await text(styles, "Heading", "프로젝트");
    const link = await text(styles, "Link", "블로그 글", COLOR.sub);
    link.name = "Link";
    link.textDecoration = "UNDERLINE";
    fill(c, await headRow(styles, title, link));
    bindText(c, "Title", title);
    bindText(c, "Link", link);
    bindVisible(c, "Has Link", link);
    made["Resume/Project Head"] = c;
  }

  // 요약 한 줄(회색)
  {
    const c = component("Resume/Summary", width);
    const body = await text(styles, "Body", "요약", COLOR.sub);
    fill(c, body);
    bindText(c, "Text", body);
    made["Resume/Summary"] = c;
  }

  // 불릿
  {
    const c = component("Resume/Bullet", width);
    c.layoutMode = "HORIZONTAL";
    c.itemSpacing = 6;
    c.primaryAxisSizingMode = "FIXED";
    c.counterAxisSizingMode = "AUTO";
    c.resize(width, 10);
    const dot = await text(styles, "Body", "•");
    const body = await text(styles, "Body", "내용");
    c.appendChild(dot);
    fill(c, body);
    bindText(c, "Text", body);
    made["Resume/Bullet"] = c;
  }

  // 항목: 제목 + 기간, 설명(오픈소스·기타 경험·학력)
  {
    const c = component("Resume/Entry", width);
    c.itemSpacing = 2;
    const title = await text(styles, "Heading", "항목");
    const period = await text(styles, "Body", "2020.01", COLOR.sub);
    const description = await text(styles, "Body", "설명");
    description.name = "Description";
    fill(c, await headRow(styles, title, period));
    fill(c, description);
    bindText(c, "Title", title);
    bindText(c, "Period", period);
    bindText(c, "Description", description);
    bindVisible(c, "Has Description", description);
    made["Resume/Entry"] = c;
  }

  let y = 0;
  for (const c of Object.values(made)) {
    page.appendChild(c);
    c.x = 0;
    c.y = y;
    y += c.height + 40;
  }
  return made;
}

async function pageNamed(name: string) {
  let page = figma.root.children.find((p) => p.name === name);
  if (!page) {
    page = figma.createPage();
    page.name = name;
  }
  await page.loadAsync();
  return page;
}

async function ensureTemplate(
  styles: Record<StyleName, TextStyle>,
): Promise<Template> {
  const { spaces, spaceValue } = await ensureSpaces();
  const width = PAGE.width - 2 * spaceValue("page/padding-x");
  const page = await pageNamed(TEMPLATE_PAGE);
  const found = page.findAllWithCriteria({ types: ["COMPONENT"] });
  const byName = new Map(found.map((c) => [c.name, c]));
  const missing = COMPONENTS.filter((n) => !byName.has(n));

  let components: Record<ComponentName, ComponentNode>;
  if (missing.length === COMPONENTS.length) {
    components = await createComponents(page, styles, width);
  } else if (missing.length > 0) {
    throw new Error(
      `「${TEMPLATE_PAGE}」에 컴포넌트가 빠져 있습니다: ${missing.join(", ")}`,
    );
  } else {
    components = Object.fromEntries(
      COMPONENTS.map((n) => [n, byName.get(n)!]),
    ) as Record<ComponentName, ComponentNode>;
  }

  // 컴포넌트 안의 글꼴을 사람이 바꿨을 수 있으니 실제 글꼴을 모두 불러 둔다
  const fonts = new Map<string, FontName>();
  for (const c of Object.values(components)) {
    for (const t of c.findAllWithCriteria({ types: ["TEXT"] })) {
      for (const f of t.getRangeAllFontNames(0, t.characters.length)) {
        fonts.set(`${f.family}/${f.style}`, f);
      }
    }
  }
  await Promise.all([...fonts.values()].map((f) => figma.loadFontAsync(f)));

  return { components, spaces, spaceValue };
}

/* ---------- 인스턴스 채우기 ---------- */

function setProps(
  instance: InstanceNode,
  values: Record<string, string | boolean>,
) {
  const keys = Object.keys(instance.componentProperties);
  const next: Record<string, string | boolean> = {};
  for (const [name, value] of Object.entries(values)) {
    const key = keys.find((k) => k.split("#")[0] === name);
    if (key) next[key] = value;
  }
  instance.setProperties(next);
}

function linkText(instance: InstanceNode, layer: string, url: string) {
  const node = instance.findOne(
    (n) => n.type === "TEXT" && n.name === layer,
  ) as TextNode | null;
  node?.setRangeHyperlink(0, node.characters.length, {
    type: "URL",
    value: url,
  });
}

/* 설명 끝의 "(PR #123)"처럼 일부에만 링크를 건다 */
function linkRange(instance: InstanceNode, layer: string, link: Link) {
  const node = instance.findOne(
    (n) => n.type === "TEXT" && n.name === layer,
  ) as TextNode | null;
  if (!node || !link.url) return;
  const start = node.characters.lastIndexOf(link.text);
  if (start < 0) return;
  const end = start + link.text.length;
  node.setRangeHyperlink(start, end, { type: "URL", value: link.url });
  node.setRangeTextDecoration(start, end, "UNDERLINE");
}

type Draft = Block & {
  node: FrameNode;
  gapVar: SpaceName | null;
};

function blockFrame(name: string, gap = 4) {
  const frame = autoLayout(figma.createFrame(), "VERTICAL", gap);
  frame.name = name;
  return frame;
}

function instance(
  tpl: Template,
  name: ComponentName,
  values: Record<string, string | boolean>,
) {
  const node = tpl.components[name].createInstance();
  setProps(node, values);
  return node;
}

function buildBlocks(
  data: Resume,
  titles: Payload["sectionTitles"],
  tpl: Template,
  stage: FrameNode,
) {
  const drafts: Omit<Draft, "height">[] = [];
  let previousWasHead = false;

  const push = (
    node: FrameNode,
    kind: "profile" | "head" | "company" | "project" | "entry",
    section: string | null,
  ) => {
    const gapVar: SpaceName | null =
      kind === "profile"
        ? null
        : kind === "head"
          ? "section"
          : previousWasHead || kind === "company"
            ? "section-body"
            : kind === "project"
              ? "project"
              : "entry";
    fill(stage, node);
    drafts.push({
      node,
      gapVar,
      gapBefore: gapVar ? tpl.spaceValue(gapVar) : 0,
      keepWithNext: kind === "head" || kind === "company",
      section,
      isSectionHead: kind === "head",
    });
    previousWasHead = kind === "head";
  };

  const single = (inst: InstanceNode, name: string) => {
    const frame = blockFrame(name);
    fill(frame, inst);
    return frame;
  };

  // 프로필
  {
    const { profile, contact } = data;
    const inst = instance(tpl, "Resume/Profile", {
      Name: profile.name,
      Title: profile.title,
      Email: contact.email,
      Intro: profile.introduction.join("\n"),
    });
    linkText(inst, "Email", `mailto:${contact.email}`);
    linkText(inst, "GitHub", contact.github);
    linkText(inst, "Blog", contact.blog);
    push(single(inst, "Profile"), "profile", null);
  }

  const sectionHead = (key: keyof Payload["sectionTitles"]) =>
    push(
      single(
        instance(tpl, "Resume/Section Head", { Title: titles[key] }),
        titles[key],
      ),
      "head",
      key,
    );

  // 경력
  sectionHead("experience");
  for (const career of data.workExperience) {
    push(
      single(
        instance(tpl, "Resume/Company Head", {
          Company: career.company,
          Period: career.period,
        }),
        career.company,
      ),
      "company",
      "experience",
    );
    for (const project of career.projects) {
      const frame = blockFrame(project.title);
      const head = instance(tpl, "Resume/Project Head", {
        Title: project.title,
        Link: project.linkText ?? "",
        "Has Link": Boolean(project.postUrl),
      });
      if (project.postUrl) linkText(head, "Link", project.postUrl);
      fill(frame, head);
      if (project.summary) {
        fill(frame, instance(tpl, "Resume/Summary", { Text: project.summary }));
      }
      for (const achievement of project.achievements) {
        fill(frame, instance(tpl, "Resume/Bullet", { Text: achievement }));
      }
      push(frame, "project", "experience");
    }
  }

  // 오픈소스
  sectionHead("openSource");
  for (const c of data.openSource) {
    const pr = `PR #${c.link.split("/").pop()}`;
    const inst = instance(tpl, "Resume/Entry", {
      Title: c.title,
      Period: c.period,
      Description: `${c.description} (${pr})`,
      "Has Description": true,
    });
    linkRange(inst, "Description", { text: pr, url: c.link });
    push(single(inst, c.title), "entry", "openSource");
  }

  // 기타 경험
  sectionHead("otherExperience");
  for (const item of data.otherExperience) {
    const frame = blockFrame(item.title);
    fill(
      frame,
      instance(tpl, "Resume/Entry", {
        Title: item.title,
        Period: item.period,
        Description: item.description,
        "Has Description": true,
      }),
    );
    for (const detail of item.details) {
      fill(frame, instance(tpl, "Resume/Bullet", { Text: detail }));
    }
    push(frame, "entry", "otherExperience");
  }

  // 학력
  sectionHead("education");
  for (const edu of data.education) {
    push(
      single(
        instance(tpl, "Resume/Entry", {
          Title: edu.school,
          Period: edu.period,
          "Has Description": false,
        }),
        edu.school,
      ),
      "entry",
      "education",
    );
  }

  return drafts.map((d) => ({ ...d, height: d.node.height }));
}

/* ---------- 쪽 그리기 ---------- */

async function render(
  locale: "ko" | "en",
  data: Resume,
  titles: Payload["sectionTitles"],
  tpl: Template,
) {
  const page = await pageNamed(`Resume ${locale.toUpperCase()}`);
  for (const node of page.children) {
    if (node.getPluginData(MARK)) node.remove();
  }

  const padX = tpl.spaceValue("page/padding-x");
  const padY = tpl.spaceValue("page/padding-y");
  const contentWidth = PAGE.width - 2 * padX;

  // 높이를 재기 위한 임시 프레임
  const stage = blockFrame("stage", 0);
  stage.counterAxisSizingMode = "FIXED";
  stage.resize(contentWidth, 10);
  page.appendChild(stage);

  const blocks = buildBlocks(data, titles, tpl, stage);
  const headHeights = new Map(
    blocks.filter((b) => b.isSectionHead).map((b) => [b.section!, b.height]),
  );
  const pages = paginate(blocks, {
    pageHeight: PAGE.height - 2 * padY,
    sectionHeadHeight: (s) => headHeights.get(s) ?? 0,
    continuationGap: tpl.spaceValue("section-body"),
  });

  const frames: FrameNode[] = [];
  pages.forEach((spec, index) => {
    const frame = figma.createFrame();
    frame.name = `${locale.toUpperCase()} ${index + 1}/${pages.length}`;
    frame.setPluginData(MARK, "page");
    frame.layoutMode = "VERTICAL";
    frame.primaryAxisSizingMode = "FIXED";
    frame.counterAxisSizingMode = "FIXED";
    frame.resize(PAGE.width, PAGE.height);
    frame.itemSpacing = 0;
    frame.clipsContent = true;
    frame.fills = [solid({ r: 1, g: 1, b: 1 })];
    frame.setBoundVariable("paddingLeft", tpl.spaces["page/padding-x"]);
    frame.setBoundVariable("paddingRight", tpl.spaces["page/padding-x"]);
    frame.setBoundVariable("paddingTop", tpl.spaces["page/padding-y"]);
    frame.setBoundVariable("paddingBottom", tpl.spaces["page/padding-y"]);
    frame.x = index * (PAGE.width + 80);
    frame.y = 0;
    page.appendChild(frame);

    if (spec.continuedSection) {
      const key = spec.continuedSection as keyof Payload["sectionTitles"];
      const head = blockFrame(titles[key]);
      fill(head, instance(tpl, "Resume/Section Head", { Title: titles[key] }));
      fill(frame, head);
    }

    spec.blocks.forEach((i, k) => {
      const block = blocks[i];
      fill(frame, block.node);
      const first = k === 0 && !spec.continuedSection;
      const gapVar: SpaceName | null = first
        ? null
        : k === 0
          ? "section-body"
          : block.gapVar;
      if (gapVar) block.node.setBoundVariable("paddingTop", tpl.spaces[gapVar]);
      else block.node.paddingTop = 0;
    });
    frames.push(frame);
  });

  stage.remove();
  return frames.length;
}

/* ---------- 실행 ---------- */

async function main() {
  let payload: Payload;
  try {
    const response = await fetch(DATA_URL);
    payload = (await response.json()) as Payload;
  } catch {
    figma.closePlugin(
      `${DATA_URL}을 읽지 못했습니다. bun run dev를 켜 주세요.`,
    );
    return;
  }

  const styles = await ensureStyles();
  const tpl = await ensureTemplate(styles);
  const ko = await render("ko", payload.ko, payload.sectionTitles, tpl);
  const en = await render("en", payload.en, payload.sectionTitles, tpl);
  figma.closePlugin(`이력서 동기화 완료: KO ${ko}쪽, EN ${en}쪽`);
}

main().catch((error: unknown) => {
  figma.closePlugin(
    `실패: ${error instanceof Error ? error.message : String(error)}`,
  );
});
