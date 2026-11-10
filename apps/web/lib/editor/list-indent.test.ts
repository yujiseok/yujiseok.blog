import { describe, expect, it } from "vitest";
import { getSchema } from "@tiptap/core";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { EditorState, TextSelection } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";

import { indentIntoPreviousList } from "./list-indent";
import { docToMarkdown, markdownToDoc } from "./markdown";

const schema = getSchema([
  StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
]);

/** markdown을 열고 text가 처음 나오는 글자 안에 커서를 둔다 */
const stateAt = (markdown: string, text: string) => {
  const doc = ProseMirrorNode.fromJSON(schema, markdownToDoc(markdown));
  let pos = -1;
  doc.descendants((node, nodePos) => {
    if (pos === -1 && node.isText && node.text?.includes(text)) pos = nodePos;
  });
  return EditorState.create({
    doc,
    selection: TextSelection.create(doc, pos + 1),
  });
};

const run = (state: EditorState) => {
  let next = state;
  const ok = indentIntoPreviousList(state, (tr) => {
    next = state.apply(tr);
  });
  return { ok, next, markdown: docToMarkdown(next.doc.toJSON()) };
};

describe("indentIntoPreviousList", () => {
  it("번호 목록 바로 뒤 불릿의 첫 항목을 마지막 번호 항목 아래로 넣는다", () => {
    const { ok, next, markdown } = run(
      stateAt("1. 하나\n2. 둘\n\n- 셋\n", "셋"),
    );

    expect(ok).toBe(true);
    expect(next.doc.childCount).toBe(1);
    expect(markdown).toBe("1. 하나\n2. 둘\n   - 셋\n");
  });

  it("커서가 옮겨 간 항목 안에 남는다", () => {
    const { next } = run(stateAt("1. 하나\n\n- 셋\n", "셋"));

    expect(next.selection.$from.parent.textContent).toBe("셋");
  });

  it.each([
    [
      "뒤에 남은 항목은 원래 목록에 그대로 둔다",
      "1. 하나\n\n- 셋\n- 넷\n",
      "1. 하나\n   - 셋\n\n- 넷\n",
    ],
    [
      "이미 같은 종류의 하위 목록이 있으면 그 끝에 붙인다",
      "1. 하나\n   - 가\n\n- 셋\n",
      "1. 하나\n   - 가\n   - 셋\n",
    ],
    // 번호 목록 가운데 항목을 불릿으로 바꾸면 목록이 셋으로 쪼개진다.
    // 불릿을 넣은 뒤 앞뒤 번호 목록이 따로 남으면 번호가 1부터 다시 센다.
    [
      "번호 목록 중간의 불릿을 넣으면 쪼개졌던 번호 목록을 다시 잇는다",
      "1. 하나\n\n- 셋\n\n1. 둘\n2. 넷\n",
      "1. 하나\n   - 셋\n2. 둘\n3. 넷\n",
    ],
  ])("%s", (_name, before, after) => {
    expect(run(stateAt(before, "셋")).markdown).toBe(after);
  });

  it.each([
    ["앞에 목록이 없으면", "문단\n\n- 셋\n", "셋"],
    // 기본 sinkListItem이 맡는다
    ["첫 항목이 아니면", "1. 하나\n\n- 셋\n- 넷\n", "넷"],
    ["목록 밖 문단에서는", "1. 하나\n\n문단\n", "문단"],
  ])("%s 손대지 않는다", (_name, markdown, text) => {
    expect(run(stateAt(markdown, text)).ok).toBe(false);
  });
});
