import {
  FilterSwitcher,
  type FilterProps,
} from "@/src/components/(authenticated)/filter/filter";

describe("FilterSwitcher", () => {
  const defaultOptions = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3" },
  ];

  const filteredOptions = [{ value: "1", label: "Option 1" }];

  const dropdownProps: FilterProps = {
    id: "test-filter",
    type: "dropdown-checkbox",
    label: "Test Filter",
    options: defaultOptions,
    value: [],
    onChange: vi.fn(),
  };

  const comboboxProps: FilterProps = {
    id: "test-filter",
    type: "combobox",
    label: "Test Filter",
    options: defaultOptions,
    value: [],
    searchValue: "",
    onSearch: vi.fn(),
    onChange: vi.fn(),
  };

  describe("컴포넌트 타입 분기", () => {
    it("type이 dropdown-checkbox일 때 드롭다운 메뉴가 렌더링됨", async () => {
      render(<FilterSwitcher {...dropdownProps} />);

      const trigger = reactScreen.getByRole("button");
      await userEvent.click(trigger);

      expect(trigger).toHaveAttribute("aria-haspopup", "menu");
      expect(document.querySelector('[role="menu"]')).toBeInTheDocument();
    });

    it("type이 combobox일 때 Popover 가 렌더링됨", async () => {
      render(<FilterSwitcher {...comboboxProps} />);

      const trigger = reactScreen.getByRole("button");
      await userEvent.click(trigger);

      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
    });
  });

  describe("DropdownCheckboxFilter", () => {
    describe("렌더링", () => {
      it("모든 옵션이 렌더링됨", async () => {
        render(<FilterSwitcher {...dropdownProps} />);

        const trigger = reactScreen.getByRole("button");
        await userEvent.click(trigger);

        defaultOptions.forEach((option) => {
          expect(reactScreen.getByText(option.label)).toBeInTheDocument();
        });
      });

      it("선택된 값들이 체크되어 있음", async () => {
        const selectedValues = ["1", "2"];
        render(
          <FilterSwitcher
            {...dropdownProps}
            value={selectedValues}
          />,
        );

        const trigger = reactScreen.getByRole("button");
        await userEvent.click(trigger);

        const checkedItems = reactScreen.getAllByRole("menuitemcheckbox");
        checkedItems.slice(0, 2).forEach((item) => {
          expect(item).toHaveAttribute("data-state", "checked");
        });
      });
    });

    describe("상호작용", () => {
      it("체크박스 클릭 시 onChange가 호출됨", async () => {
        const onChange = vi.fn();
        render(
          <FilterSwitcher
            {...dropdownProps}
            onChange={onChange}
          />,
        );

        const trigger = reactScreen.getByRole("button");
        await userEvent.click(trigger);

        const firstOption = reactScreen.getAllByRole("menuitemcheckbox")[0]!;
        fireEvent.click(firstOption);

        expect(onChange).toHaveBeenCalledWith(["1"]);
      });

      it("이미 선택된 항목 클릭 시 선택 해제됨", async () => {
        const onChange = vi.fn();
        render(
          <FilterSwitcher
            {...dropdownProps}
            value={["1"]}
            onChange={onChange}
          />,
        );

        const trigger = reactScreen.getByRole("button");
        await userEvent.click(trigger);

        const firstOption = reactScreen.getAllByRole("menuitemcheckbox")[0]!;
        await userEvent.click(firstOption);

        expect(onChange).toHaveBeenCalledWith([]);
      });
    });
  });

  describe("ComboboxFilter", () => {
    describe("렌더링", () => {
      it("검색 입력창이 렌더링됨", async () => {
        render(<FilterSwitcher {...comboboxProps} />);

        const trigger = reactScreen.getByRole("button");
        await userEvent.click(trigger);

        expect(
          reactScreen.getByPlaceholderText(`${comboboxProps.label} 검색...`),
        ).toBeInTheDocument();
      });

      it("모든 옵션이 체크박스와 함께 렌더링됨", async () => {
        render(<FilterSwitcher {...comboboxProps} />);

        const trigger = reactScreen.getByRole("button");
        await userEvent.click(trigger);

        const checkboxes = reactScreen.getAllByRole("checkbox");
        expect(checkboxes).toHaveLength(defaultOptions.length);

        defaultOptions.forEach((option) => {
          expect(reactScreen.getByText(option.label)).toBeInTheDocument();
        });
      });

      it("선택된 값들이 체크되어 있음", async () => {
        const selectedValues = ["1", "2"];
        render(
          <FilterSwitcher
            {...comboboxProps}
            value={selectedValues}
          />,
        );

        const trigger = reactScreen.getByRole("button");
        await userEvent.click(trigger);

        const checkboxes = reactScreen.getAllByRole("checkbox");
        expect(checkboxes[0]).toBeChecked();
        expect(checkboxes[1]).toBeChecked();
        expect(checkboxes[2]).not.toBeChecked();
      });

      it("선택된 값들이 칩으로 표시됨", async () => {
        const selectedValues = ["1", "2"];
        render(
          <FilterSwitcher
            {...comboboxProps}
            value={selectedValues}
          />,
        );

        const trigger = reactScreen.getByRole("button");
        await userEvent.click(trigger);

        const chipsContainer = reactScreen.getByTestId("selected-chips");
        expect(
          within(chipsContainer).getByText("Option 1"),
        ).toBeInTheDocument();
        expect(
          within(chipsContainer).getByText("Option 2"),
        ).toBeInTheDocument();

        const deleteEls = reactScreen.getAllByTestId("chip-delete-button");
        expect(deleteEls).toHaveLength(selectedValues.length);
      });

      it("칩의 삭제 버튼 클릭 시 해당 값이 선택 해제됨", async () => {
        const onChange = vi.fn();
        const selectedValues = ["1", "2"];
        render(
          <FilterSwitcher
            {...comboboxProps}
            value={selectedValues}
            onChange={onChange}
          />,
        );

        const trigger = reactScreen.getByRole("button");
        await userEvent.click(trigger);

        const deleteButton =
          reactScreen.getAllByTestId("chip-delete-button")[0]!;
        await userEvent.click(deleteButton);

        expect(onChange).toHaveBeenCalledWith(["2"]);
      });

      it("값이 선택되지 않은 경우 칩이 표시되지 않음", async () => {
        render(
          <FilterSwitcher
            {...comboboxProps}
            value={[]}
          />,
        );

        const trigger = reactScreen.getByRole("button");
        await userEvent.click(trigger);

        expect(
          document.querySelector('[class*="badge"]'),
        ).not.toBeInTheDocument();
      });
    });

    describe("검색 기능", () => {
      it("검색어 입력 시 onSearch 콜백이 호출됨", async () => {
        const onSearch = vi.fn();
        render(
          <FilterSwitcher
            {...comboboxProps}
            onSearch={onSearch}
          />,
        );

        const trigger = reactScreen.getByRole("button");
        await userEvent.click(trigger);

        const searchInput = reactScreen.getByPlaceholderText(
          `${comboboxProps.label} 검색...`,
        );
        fireEvent.change(searchInput, { target: { value: "Option 1" } });

        expect(onSearch).toHaveBeenCalledWith("Option 1");
      });

      it("검색어에 따라 옵션이 필터링됨", async () => {
        render(
          <FilterSwitcher
            {...comboboxProps}
            searchValue="Option 1"
            options={filteredOptions}
          />,
        );

        const trigger = reactScreen.getByRole("button");
        await userEvent.click(trigger);

        const optionsContainer = reactScreen.getByTestId("options-container");
        const visibleOptions =
          within(optionsContainer).getAllByRole("checkbox");
        expect(visibleOptions).toHaveLength(1);

        const optionText = within(optionsContainer).getByText("Option 1");
        expect(optionText).toBeInTheDocument();
      });
    });

    describe("상호작용", () => {
      it("체크박스 클릭 시 onChange가 호출됨", async () => {
        const onChange = vi.fn();
        render(
          <FilterSwitcher
            {...comboboxProps}
            onChange={onChange}
          />,
        );

        const trigger = reactScreen.getByRole("button");
        await userEvent.click(trigger);

        const firstCheckbox = reactScreen.getAllByRole("checkbox")[0]!;
        await userEvent.click(firstCheckbox);

        expect(onChange).toHaveBeenCalledWith(["1"]);
      });

      it("항목 클릭 시 onChange가 호출됨", async () => {
        const onChange = vi.fn();
        render(
          <FilterSwitcher
            {...comboboxProps}
            onChange={onChange}
          />,
        );

        const trigger = reactScreen.getByRole("button");
        await userEvent.click(trigger);

        const firstOption = reactScreen.getByText("Option 1");
        await userEvent.click(firstOption);

        expect(onChange).toHaveBeenCalledWith(["1"]);
      });

      it("이미 선택된 항목 클릭 시 선택 해제됨", async () => {
        const onChange = vi.fn();
        render(
          <FilterSwitcher
            {...comboboxProps}
            value={["1"]}
            onChange={onChange}
          />,
        );

        const trigger = reactScreen.getByRole("button");
        await userEvent.click(trigger);

        const optionsContainer = reactScreen.getByTestId("options-container");
        const option = within(optionsContainer).getByText("Option 1");
        await userEvent.click(option);

        expect(onChange).toHaveBeenCalledWith([]);
      });
    });
  });
});
