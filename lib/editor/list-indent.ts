import { Fragment } from "@tiptap/pm/model";
import {
  TextSelection,
  type EditorState,
  type Transaction,
} from "@tiptap/pm/state";

const LIST_TYPES = ["bulletList", "orderedList"];

/*
 * 번호 목록 바로 뒤에 불릿을 시작하면 하위 목록이 아니라 형제 목록이 하나 더
 * 생긴다. 그 첫 항목은 앞에 형제 항목이 없어 sinkListItem이 실패하고, Tab을
 * 눌러도 들어가지 않는다.
 *
 * 그 경우에만 현재 항목을 앞 목록의 마지막 항목 아래 하위 목록으로 옮긴다.
 * 뒤에 남은 항목은 원래 목록에 둔다 — Tab은 커서가 있는 한 줄만 민다.
 */
export const indentIntoPreviousList = (
  state: EditorState,
  dispatch?: (tr: Transaction) => void,
): boolean => {
  const { selection } = state;
  if (!selection.empty) return false;

  const { $from } = selection;
  // doc > list > listItem > paragraph 이상이어야 목록 안이다
  const itemDepth = $from.depth - 1;
  if (itemDepth < 2) return false;

  const item = $from.node(itemDepth);
  const list = $from.node(itemDepth - 1);
  if (item.type.name !== "listItem" || !LIST_TYPES.includes(list.type.name))
    return false;
  if ($from.index(itemDepth - 1) !== 0) return false;

  const listParentDepth = itemDepth - 2;
  const listIndex = $from.index(listParentDepth);
  if (listIndex === 0) return false;

  const previousList = $from.node(listParentDepth).child(listIndex - 1);
  if (!LIST_TYPES.includes(previousList.type.name)) return false;
  const lastItem = previousList.lastChild;
  if (!lastItem || lastItem.type.name !== "listItem") return false;

  if (!dispatch) return true;

  const listStart = $from.before(itemDepth - 1);
  const itemStart = $from.before(itemDepth);
  // 앞 목록의 닫는 토큰 하나, 마지막 항목의 닫는 토큰 하나를 지나 안쪽 끝
  const lastItemContentEnd = listStart - 2;
  const cursorOffset = $from.pos - itemStart;

  const tr = state.tr;
  // 항목이 하나뿐이면 빈 목록이 남지 않게 목록째 지운다
  if (list.childCount === 1) tr.delete(listStart, $from.after(itemDepth - 1));
  else tr.delete(itemStart, $from.after(itemDepth));

  const nested = lastItem.lastChild;
  let insertedAt: number;
  if (nested?.type === list.type) {
    // 같은 종류의 하위 목록이 이미 있으면 그 끝에 이어 붙인다
    insertedAt = lastItemContentEnd - 1;
    tr.insert(insertedAt, item);
  } else {
    insertedAt = lastItemContentEnd + 1;
    tr.insert(
      lastItemContentEnd,
      list.type.create(list.attrs, Fragment.from(item)),
    );
  }

  // 목록째 빠졌으면 앞 목록과 그 뒤 목록이 맞닿는다. 번호 목록 중간 항목을
  // 불릿으로 바꿨다 넣은 경우인데, 따로 두면 뒤쪽 번호가 1부터 다시 센다.
  // 맞닿은 지점은 커서보다 뒤라 이어 붙여도 커서 위치는 그대로다.
  const boundary = tr.mapping.map(listStart);
  const $boundary = tr.doc.resolve(boundary);
  if (
    list.childCount === 1 &&
    $boundary.nodeBefore?.type === previousList.type &&
    $boundary.nodeAfter?.type === previousList.type
  )
    tr.join(boundary);

  tr.setSelection(TextSelection.create(tr.doc, insertedAt + cursorOffset));
  dispatch(tr.scrollIntoView());
  return true;
};
