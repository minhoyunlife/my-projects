import type { ImportsMap } from "unplugin-auto-import/types";

// 테스트 라이브러리 관련 자동 임포트 설정
export const testingLibraryPreset: ImportsMap = {
  "@testing-library/react": [
    "render",
    "renderHook",
    ["screen", "reactScreen"],
    "within",
    "cleanup",
    "act",
    "fireEvent",
    "waitFor",
    "waitForElementToBeRemoved",
  ],

  "@testing-library/jest-dom": [
    "toBeInTheDocument",
    "toBeVisible",
    "toBeEmptyDOMElement",
    "toBeEnabled",
    "toBeDisabled",
    "toBeChecked",
    "toBeFocused",
    "toHaveValue",
    "toHaveTextContent",
    "toHaveDisplayValue",
    "toHaveAttribute",
    "toHaveClass",
    "toHaveStyle",
    "toHaveAccessibleName",
    "toContainElement",
    "toContainHTML",
    "toHaveFormValues",
  ],

  "@testing-library/user-event": [["default", "userEvent"]],
};
