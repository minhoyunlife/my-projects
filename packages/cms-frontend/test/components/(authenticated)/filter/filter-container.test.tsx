import { FilterContainer } from "@/src/components/(authenticated)/filter/filter-container";

describe("FilterContainer", () => {
  const searchProps = {
    value: "",
    onChange: vi.fn(),
    onSearch: vi.fn(),
    placeholder: "Search...",
  };

  const filterProps = [
    {
      id: "filter1",
      type: "dropdown-checkbox" as const,
      label: "Filter 1",
      options: [
        { value: "1", label: "Option 1" },
        { value: "2", label: "Option 2" },
      ],
      value: [],
      onChange: vi.fn(),
    },
  ];

  const sortProps = {
    options: [
      { value: "asc", label: "Ascending" },
      { value: "desc", label: "Descending" },
    ],
    onSort: vi.fn(),
  };

  describe("렌더링 검증", () => {
    it("searchProps가 있을 때 SearchBar를 렌더링", () => {
      render(<FilterContainer searchProps={searchProps} />);

      expect(
        reactScreen.getByPlaceholderText(searchProps.placeholder),
      ).toBeInTheDocument();
    });

    it("filterProps가 있을 때 FilterSwitcher들을 렌더링", () => {
      render(<FilterContainer filterProps={filterProps} />);

      filterProps.forEach((filter) => {
        expect(
          reactScreen.getByRole("button", { name: filter.label }),
        ).toBeInTheDocument();
      });
    });

    it("sortProps가 있을 때 SortSelect를 렌더링", () => {
      render(<FilterContainer sortProps={sortProps} />);

      expect(reactScreen.getByRole("combobox")).toBeInTheDocument();
    });
  });
});
