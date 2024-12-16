import { createUrl } from "@/src/lib/utils/routes/base";

describe("createUrl", () => {
  it("파라미터 없이 경로만 주어진 경우, 경로를 반환함", () => {
    expect(createUrl({ path: "/test", params: {} })).toBe("/test");
  });

  it("경로와 함께 단일 파라미터가 주어진 경우, 파라미터가 쿼리 스트링으로 추가된 경로를 반환함", () => {
    expect(createUrl({ path: "/test", params: { test: "test" } })).toBe(
      "/test?test=test",
    );
  });

  it("경로와 함께 복수의 파라미터가 주어진 경우, 파라미터가 쿼리 스트링으로 추가된 경로를 반환함", () => {
    expect(
      createUrl({ path: "/test", params: { test: "test", test2: "test2" } }),
    ).toBe("/test?test=test&test2=test2");
  });

  it("파라미터 중에 값이 존재하지 않는 것이 있는 경우, 그 파라미터는 제외하여 반환함", () => {
    expect(
      createUrl({ path: "/test", params: { test: "test", test2: undefined } }),
    ).toBe("/test?test=test");
  });

  it("특수문자가 포함된 파라미터가 주어진 경우, 특수문자를 인코딩하여 반환함", () => {
    expect(createUrl({ path: "/test", params: { test: "test&test2" } })).toBe(
      "/test?test=test%26test2",
    );
  });
});
