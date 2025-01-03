import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/src/components/(authenticated)/data-table/table";

describe("DataTable", () => {
  type TestData = {
    id: string;
    name: string;
  };

  const columns: ColumnDef<TestData, unknown>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: (info) => info.getValue(),
    },
  ];

  const data: TestData[] = [
    { id: "1", name: "Test 1" },
    { id: "2", name: "Test 2" },
  ];

  const defaultProps = {
    columns,
    data,
    pageCount: 1,
    currentPage: 1,
    onPageChange: vi.fn(),
  };

  describe("로딩 상태", () => {
    it("isLoading이 true일 때 스켈레톤을 렌더링", () => {
      render(
        <DataTable
          {...defaultProps}
          isLoading={true}
        />,
      );

      expect(document.querySelector("th")).not.toHaveTextContent("Name");
      expect(document.querySelectorAll("td")[0]).not.toHaveTextContent(
        "Test 1",
      );
      expect(document.querySelectorAll("td")[1]).not.toHaveTextContent(
        "Test 2",
      );
    });

    it("isLoading이 false일 때 실제 테이블을 렌더링", () => {
      render(<DataTable {...defaultProps} />);

      expect(document.querySelector("th")).toHaveTextContent("Name");
      expect(document.querySelectorAll("td")[0]).toHaveTextContent("Test 1");
      expect(document.querySelectorAll("td")[1]).toHaveTextContent("Test 2");
    });
  });

  describe("테이블 렌더링", () => {
    it("헤더와 데이터를 올바르게 렌더링", () => {
      render(<DataTable {...defaultProps} />);

      expect(document.querySelector("th")).toHaveTextContent("Name");
      data.forEach((item, index) => {
        expect(document.querySelectorAll("td")[index]).toHaveTextContent(
          item.name,
        );
      });
    });

    it("데이터가 없을 때 메시지 표시", () => {
      render(
        <DataTable
          {...defaultProps}
          data={[]}
        />,
      );

      const emptyCell = document.querySelector("td");
      expect(emptyCell).toHaveTextContent("데이터가 없습니다");
      expect(emptyCell).toHaveAttribute("colspan", String(columns.length));
    });
  });

  describe("페이지네이션", () => {
    it("pageCount에 따라 페이지네이션을 렌더링", () => {
      render(
        <DataTable
          {...defaultProps}
          pageCount={3}
          currentPage={2}
        />,
      );

      const currentPage = document.querySelector('a[aria-current="page"]');
      expect(currentPage).toHaveTextContent("2");

      const pageNumbers = Array.from(document.querySelectorAll("a"))
        .filter((a) => !a.getAttribute("aria-label"))
        .map((a) => a.textContent);
      expect(pageNumbers).toEqual(["1", "2", "3"]);
    });

    it("페이지 변경 시 onPageChange 호출", () => {
      const onPageChange = vi.fn();
      render(
        <DataTable
          {...defaultProps}
          pageCount={3}
          currentPage={1}
          onPageChange={onPageChange}
        />,
      );

      const pageLinks = Array.from(document.querySelectorAll("a"));
      const page2Link = pageLinks.find((link) => link.textContent === "2");
      fireEvent.click(page2Link!);

      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it("현재 페이지가 1일 때 이전 페이지 버튼 비활성화", () => {
      render(
        <DataTable
          {...defaultProps}
          pageCount={3}
          currentPage={1}
        />,
      );

      const prevLink = document.querySelector(
        'a[aria-label="Go to previous page"]',
      );
      expect(prevLink).toHaveClass("pointer-events-none", "opacity-50");
    });

    it("현재 페이지가 마지막일 때 다음 페이지 버튼 비활성화", () => {
      render(
        <DataTable
          {...defaultProps}
          pageCount={3}
          currentPage={3}
        />,
      );

      const nextLink = document.querySelector(
        'a[aria-label="Go to next page"]',
      );
      expect(nextLink).toHaveClass("pointer-events-none", "opacity-50");
    });
  });
});
