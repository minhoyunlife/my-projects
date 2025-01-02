import {
  DataTableSkeleton,
  type ColumnSkeleton,
} from "@/src/components/(authenticated)/data-table/skeleton";

describe("DataTableSkeleton", () => {
  const defaultProps: { columns: ColumnSkeleton[]; rowCount: number } = {
    columns: [
      { content: "image", align: "center" },
      { content: "text", align: "center" },
      { content: "badges", width: "w-[200px]" },
      { content: "action", align: "center" },
    ] as ColumnSkeleton[],
    rowCount: 5,
  };

  describe("화면 렌더링 검증", () => {
    it("테이블 헤더가 렌더링됨", () => {
      render(<DataTableSkeleton {...defaultProps} />);

      const header = document.querySelector("thead");
      expect(header).toBeInTheDocument();

      const headerCells = header!!.querySelectorAll("th");
      expect(headerCells).toHaveLength(defaultProps.columns.length);
    });

    it("지정한 rowCount만큼의 행이 렌더링됨", () => {
      render(<DataTableSkeleton {...defaultProps} />);

      const rows = document.querySelectorAll("tbody tr");
      expect(rows).toHaveLength(defaultProps.rowCount);
    });

    it("rowCount를 지정하지 않으면 기본값 10개의 행이 렌더링됨", () => {
      const { columns } = defaultProps;
      render(<DataTableSkeleton columns={columns} />);

      const rows = document.querySelectorAll("tbody tr");
      expect(rows).toHaveLength(10);
    });
  });

  describe("컨텐츠 타입별 렌더링 검증", () => {
    it("image 타입은 16x16 크기의 rounded 스켈레톤이 렌더링됨", () => {
      render(<DataTableSkeleton {...defaultProps} />);

      const imageSkeletons = document.querySelectorAll(".h-16.w-16.rounded");
      expect(imageSkeletons).toHaveLength(defaultProps.rowCount);
    });

    it("badges 타입은 두 개의 뱃지 스켈레톤이 렌더링됨", () => {
      render(<DataTableSkeleton {...defaultProps} />);

      const badgesContainers = document.querySelectorAll(
        ".flex.gap-1.flex-wrap",
      );
      expect(badgesContainers).toHaveLength(defaultProps.rowCount);
      const badgeSkeletons = badgesContainers[0]?.querySelectorAll(".h-5.w-16");
      expect(badgeSkeletons).toHaveLength(2);
    });

    it("action 타입은 8x8 크기의 스켈레톤이 렌더링됨", () => {
      render(<DataTableSkeleton {...defaultProps} />);

      const actionSkeletons = document.querySelectorAll(".h-8.w-8");
      expect(actionSkeletons).toHaveLength(defaultProps.rowCount);
    });

    it("text 타입은 기본 스켈레톤이 렌더링됨", () => {
      const columns: ColumnSkeleton[] = [{ content: "text" }];

      render(
        <DataTableSkeleton
          columns={columns}
          rowCount={1}
        />,
      );

      const textSkeleton = document.querySelector("tbody td .h-4");
      expect(textSkeleton).toBeInTheDocument();
      expect(textSkeleton).toHaveClass("w-full");
    });
  });

  describe("스타일 프로퍼티 검증", () => {
    describe("정렬", () => {
      it("각 컬럼의 align 속성에 따라 적절한 정렬 클래스가 적용됨", () => {
        const columns: ColumnSkeleton[] = [
          { content: "text", align: "left" },
          { content: "text", align: "center" },
          { content: "text", align: "right" },
        ];

        render(
          <DataTableSkeleton
            columns={columns}
            rowCount={1}
          />,
        );

        const headerCells = document.querySelectorAll("thead th");
        expect(headerCells[0]).toHaveClass("text-left");
        expect(headerCells[1]).toHaveClass("text-center");
        expect(headerCells[2]).toHaveClass("text-right");

        const bodyCells = document.querySelectorAll("tbody td");
        expect(bodyCells[0]).toHaveClass("text-left");
        expect(bodyCells[1]).toHaveClass("text-center");
        expect(bodyCells[2]).toHaveClass("text-right");
      });

      it("align 속성이 없는 경우 기본값으로 text-left가 적용됨", () => {
        const columns: ColumnSkeleton[] = [{ content: "text" }];

        render(
          <DataTableSkeleton
            columns={columns}
            rowCount={1}
          />,
        );

        const headerCell = document.querySelector("thead th");
        expect(headerCell).toHaveClass("text-left");

        const bodyCell = document.querySelector("tbody td");
        expect(bodyCell).toHaveClass("text-left");
      });

      it("align이 center일 때 mx-auto 클래스가 적용됨", () => {
        const columns: ColumnSkeleton[] = [
          { content: "text", align: "center" },
        ];

        render(
          <DataTableSkeleton
            columns={columns}
            rowCount={1}
          />,
        );

        const textSkeleton = document.querySelector("tbody td .h-4");
        expect(textSkeleton).toHaveClass("mx-auto");
      });
    });

    describe("너비/높이", () => {
      it("모든 헤더 스켈레톤의 높이는 h-4 임", () => {
        render(<DataTableSkeleton {...defaultProps} />);

        const headerSkeletons = document
          .querySelector("thead")
          ?.querySelectorAll(".h-4");
        expect(headerSkeletons).toHaveLength(defaultProps.columns.length);
      });

      it("컬럼에 width가 지정된 경우 해당 width가 적용됨", () => {
        const columns: ColumnSkeleton[] = [
          { content: "text", width: "w-[300px]" },
        ];

        render(
          <DataTableSkeleton
            columns={columns}
            rowCount={1}
          />,
        );

        const widthSpecifiedHeader = document.querySelector(".w-\\[300px\\]");
        expect(widthSpecifiedHeader).toBeInTheDocument();
      });

      it("width prop이 없을 때 기본값 max-w-[200px]이 적용됨", () => {
        render(<DataTableSkeleton {...defaultProps} />);

        const textSkeleton = document.querySelector("tbody td .h-4");
        expect(textSkeleton).toHaveClass("max-w-[200px]");
      });
    });
  });
});
