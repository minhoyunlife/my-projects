import { CodeInput } from "@/src/components/(unauthenticated)/code-input";

describe("CodeInput", () => {
  const defaultProps = {
    length: 6,
    validateChar: (char: string) => /^[A-Z]$/.test(char),
    onComplete: vi.fn(),
  };

  describe("화면 렌더링 검증", () => {
    it("지정한 length 프로퍼티의 값만큼의 개수의 입력 필드가 표시됨", () => {
      render(<CodeInput {...defaultProps} />);

      const inputFields = reactScreen.getAllByRole("textbox");
      expect(inputFields).toHaveLength(defaultProps.length);
    });

    it("입력 필드는 텍스트이고 최대 입력 길이는 1임", () => {
      render(<CodeInput {...defaultProps} />);

      const inputFields = reactScreen.getAllByRole("textbox");
      expect(inputFields[0]).toHaveAttribute("type", "text");
      expect(inputFields[0]).toHaveAttribute("maxLength", "1");
    });

    it("표시된 입력 필드들이 순차적으로 aria-label 속성을 가지고 있음", () => {
      render(<CodeInput {...defaultProps} />);

      for (let i = 0; i < defaultProps.length; i++) {
        expect(
          reactScreen.getByLabelText(`code-input-${i + 1}`),
        ).toBeInTheDocument();
      }
    });
  });

  describe("입력 처리 검증", () => {
    it("validateChar 에서 정의한 유효한 문자인 경우, 입력을 허용함", () => {
      render(<CodeInput {...defaultProps} />);
      const firstInput = reactScreen.getByLabelText("code-input-1");

      fireEvent.change(firstInput, { target: { value: "A" } });
      expect(firstInput).toHaveValue("A");
    });

    it("validateChar 에서 정의한 유효하지 않은 문자인 경우, 입력을 허용하지 않음", () => {
      render(<CodeInput {...defaultProps} />);
      const firstInput = reactScreen.getByLabelText("code-input-1");

      fireEvent.change(firstInput, { target: { value: "1" } });
      expect(firstInput).toHaveValue("");
    });

    it("필드에 값을 입력할 경우, 그 다음 필드로 포커스가 이동함", () => {
      render(<CodeInput {...defaultProps} />);
      const firstInput = reactScreen.getByLabelText("code-input-1");
      const secondInput = reactScreen.getByLabelText("code-input-2");

      fireEvent.change(firstInput, { target: { value: "A" } });
      expect(secondInput).toHaveFocus();
    });

    it("소문자를 입력한 경우, 대문자로 변환함", () => {
      render(<CodeInput {...defaultProps} />);
      const firstInput = reactScreen.getByLabelText("code-input-1");

      fireEvent.change(firstInput, { target: { value: "a" } });
      expect(firstInput).toHaveValue("A");
    });

    it("빈 필드에서 백 스페이스를 입력할 경우, 그 이전 필드로 포커스가 이동함", () => {
      render(<CodeInput {...defaultProps} />);
      const firstInput = reactScreen.getByLabelText("code-input-1");
      const secondInput = reactScreen.getByLabelText("code-input-2");

      fireEvent.change(firstInput, { target: { value: "A" } }); // 자동으로 두 번째 필드로 이동
      fireEvent.keyDown(secondInput, { key: "Backspace" });

      expect(firstInput).toHaveFocus();
    });

    it("첫 번째 필드에서 백 스페이스를 입력할 경우, 아무 일도 일어나지 않음", () => {
      render(<CodeInput {...defaultProps} />);
      const firstInput = reactScreen.getByLabelText("code-input-1");

      firstInput.focus();
      fireEvent.keyDown(firstInput, { key: "Backspace" });
      expect(firstInput).toHaveFocus();
    });
  });

  describe("붙여넣기 처리 검증", () => {
    it("유효한 문자열을 붙여넣을 경우, 각 필드에 값이 자동으로 채워짐", () => {
      render(<CodeInput {...defaultProps} />);
      const firstInput = reactScreen.getByLabelText("code-input-1");
      const secondInput = reactScreen.getByLabelText("code-input-2");
      const thirdInput = reactScreen.getByLabelText("code-input-3");
      const fourthInput = reactScreen.getByLabelText("code-input-4");
      const fifthInput = reactScreen.getByLabelText("code-input-5");
      const sixthInput = reactScreen.getByLabelText("code-input-6");

      fireEvent.paste(firstInput, {
        clipboardData: {
          getData: () => "ABCDEF",
        },
      });

      expect(firstInput).toHaveValue("A");
      expect(secondInput).toHaveValue("B");
      expect(thirdInput).toHaveValue("C");
      expect(fourthInput).toHaveValue("D");
      expect(fifthInput).toHaveValue("E");
      expect(sixthInput).toHaveValue("F");
    });

    it("입력 필드의 갯수보다 긴 문자열을 붙여넣을 경우, 입력 필드의 갯수만큼 선행한 문자열만 입력됨", () => {
      render(<CodeInput {...defaultProps} />);
      const firstInput = reactScreen.getByLabelText("code-input-1");
      const secondInput = reactScreen.getByLabelText("code-input-2");
      const thirdInput = reactScreen.getByLabelText("code-input-3");
      const fourthInput = reactScreen.getByLabelText("code-input-4");
      const fifthInput = reactScreen.getByLabelText("code-input-5");
      const sixthInput = reactScreen.getByLabelText("code-input-6");

      fireEvent.paste(firstInput, {
        clipboardData: {
          getData: () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        },
      });

      expect(firstInput).toHaveValue("A");
      expect(secondInput).toHaveValue("B");
      expect(thirdInput).toHaveValue("C");
      expect(fourthInput).toHaveValue("D");
      expect(fifthInput).toHaveValue("E");
      expect(sixthInput).toHaveValue("F");
    });

    it("붙여넣기할 문자열 중 규칙에 위반되는 문자가 섞여있는 경우, 붙여넣기 행위는 무시됨", () => {
      render(<CodeInput {...defaultProps} />);
      const firstInput = reactScreen.getByLabelText("code-input-1");

      fireEvent.paste(firstInput, {
        clipboardData: {
          getData: () => "A1B2C3",
        },
      });

      expect(firstInput).toHaveValue("");
    });
  });

  describe("완료 처리 검증", () => {
    it("모든 필드에 값이 채워진 경우, onComplete 함수가 호출됨", () => {
      render(<CodeInput {...defaultProps} />);
      const firstInput = reactScreen.getByLabelText("code-input-1");
      const secondInput = reactScreen.getByLabelText("code-input-2");
      const thirdInput = reactScreen.getByLabelText("code-input-3");
      const fourthInput = reactScreen.getByLabelText("code-input-4");
      const fifthInput = reactScreen.getByLabelText("code-input-5");
      const sixthInput = reactScreen.getByLabelText("code-input-6");

      fireEvent.change(firstInput, { target: { value: "A" } });
      fireEvent.change(secondInput, { target: { value: "B" } });
      fireEvent.change(thirdInput, { target: { value: "C" } });
      fireEvent.change(fourthInput, { target: { value: "D" } });
      fireEvent.change(fifthInput, { target: { value: "E" } });
      fireEvent.change(sixthInput, { target: { value: "F" } });

      expect(defaultProps.onComplete).toHaveBeenCalledWith("ABCDEF");
    });
  });
});
