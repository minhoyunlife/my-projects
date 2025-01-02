import type { Table } from "@tanstack/react-table";

import { DataTablePagination } from "@/src/components/(authenticated)/data-table/pagination";

describe("DataTablePagination", () => {
  const createMockTable = (
    pageIndex: number,
    canPrevious = true,
    canNext = true,
  ) =>
    ({
      getState: () => ({ pagination: { pageIndex } }),
      getCanPreviousPage: () => canPrevious,
      getCanNextPage: () => canNext,
      previousPage: vi.fn(),
      nextPage: vi.fn(),
      setPageIndex: vi.fn(),
    }) as unknown as Table<any>;

  describe("페이지 번호 표시 로직", () => {
    it("전체 페이지가 5 이하일 경우, 모든 페이지 번호를 표시함", () => {
      const table = createMockTable(3);
      render(
        <DataTablePagination
          table={table}
          totalPages={5}
        />,
      );

      [1, 2, 3, 4, 5].forEach((num) => {
        expect(reactScreen.getByText(num.toString())).toBeInTheDocument();
      });
      expect(reactScreen.queryByText("...")).not.toBeInTheDocument();
    });

    it("현재 페이지가 3 이하일 경우, 1, 2, 3, 4, ..., 10 과 같이 표시됨", () => {
      const table = createMockTable(1);
      render(
        <DataTablePagination
          table={table}
          totalPages={10}
        />,
      );

      [1, 2, 3, 4].forEach((num) => {
        expect(reactScreen.getByText(num.toString())).toBeInTheDocument();
      });
      expect(reactScreen.getByText("10")).toBeInTheDocument();

      const ellipsis = reactScreen.getAllByText("More pages");
      expect(ellipsis).toHaveLength(1);
    });

    it("현재 페이지가 마지막에서 3페이지 이내일 경우, 1, ..., 7, 8, 9, 10 과 같이 표시됨", () => {
      const table = createMockTable(8);
      render(
        <DataTablePagination
          table={table}
          totalPages={10}
        />,
      );

      expect(reactScreen.getByText("1")).toBeInTheDocument();
      [7, 8, 9, 10].forEach((num) => {
        expect(reactScreen.getByText(num.toString())).toBeInTheDocument();
      });

      const ellipsis = reactScreen.getAllByText("More pages");
      expect(ellipsis).toHaveLength(1);
    });

    it("현재 페이지가 전체 페이지의 중간 영역인 경우, 1, ..., 5, 6, 7, ..., 10 과 같이 표시됨", () => {
      const table = createMockTable(5);
      render(
        <DataTablePagination
          table={table}
          totalPages={10}
        />,
      );

      expect(reactScreen.getByText("1")).toBeInTheDocument();
      [5, 6, 7].forEach((num) => {
        expect(reactScreen.getByText(num.toString())).toBeInTheDocument();
      });
      expect(reactScreen.getByText("10")).toBeInTheDocument();

      const ellipsis = reactScreen.getAllByText("More pages");
      expect(ellipsis).toHaveLength(2);
    });
  });

  describe("네비게이션 동작", () => {
    it("첫 페이지에서는 이전 버튼이 비활성화됨", () => {
      const table = createMockTable(0, false, true);
      render(
        <DataTablePagination
          table={table}
          totalPages={5}
        />,
      );

      const prevButton = reactScreen.getByLabelText("Go to previous page");
      expect(prevButton).toHaveClass(
        "pointer-events-none",
        "opacity-50",
        "cursor-not-allowed",
      );
    });

    it("마지막 페이지에서는 다음 버튼이 비활성화됨", () => {
      const table = createMockTable(4, true, false);
      render(
        <DataTablePagination
          table={table}
          totalPages={5}
        />,
      );

      const nextButton = reactScreen.getByLabelText("Go to next page");
      expect(nextButton).toHaveClass(
        "pointer-events-none",
        "opacity-50",
        "cursor-not-allowed",
      );
    });

    it("페이지 번호를 클릭할 경우, 해당 페이지로 이동함", () => {
      const table = createMockTable(0);
      render(
        <DataTablePagination
          table={table}
          totalPages={5}
        />,
      );

      fireEvent.click(reactScreen.getByText("3"));
      expect(table.setPageIndex).toHaveBeenCalledWith(2);
    });

    it("이전/다음 버튼을 클릭할 경우, 페이지를 이동함", () => {
      const table = createMockTable(2);
      render(
        <DataTablePagination
          table={table}
          totalPages={5}
        />,
      );

      fireEvent.click(reactScreen.getByLabelText("Go to previous page"));
      expect(table.previousPage).toHaveBeenCalled();

      fireEvent.click(reactScreen.getByLabelText("Go to next page"));
      expect(table.nextPage).toHaveBeenCalled();
    });
  });
});
