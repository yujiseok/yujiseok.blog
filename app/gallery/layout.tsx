import { NuqsAdapter } from "nuqs/adapters/next/app";

/*
 * 고른 작가를 URL에 둔다. 화면만 바뀌고 주소는 그대로이던 때는 뒤로 왔을 때
 * 무엇이 걸러진 상태인지 알 길이 없었다. 어댑터는 이 라우트에만 씌운다.
 */
const Layout = ({ children }: { children: React.ReactNode }) => (
  <NuqsAdapter>{children}</NuqsAdapter>
);

export default Layout;
