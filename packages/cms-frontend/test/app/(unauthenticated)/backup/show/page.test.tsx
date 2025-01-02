import BackupCodesPage from "@/src/app/(unauthenticated)/backup/show/page";
import { ROUTES } from "@/src/routes";
import { useAuthStore } from "@/src/store/auth";

const mockRouter = {
  replace: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

const mockBackupCodes = [
  "AAAAAAAA",
  "BBBBBBBB",
  "CCCCCCCC",
  "DDDDDDDD",
  "EEEEEEEE",
  "FFFFFFFF",
  "GGGGGGGG",
  "HHHHHHHH",
];
const mockClearBackupCodes = vi.fn();

vi.mock("@/src/store/auth", () => ({
  useAuthStore: vi.fn(() => ({
    backupCodes: mockBackupCodes,
    clearBackupCodes: mockClearBackupCodes,
  })),
}));

describe("BackupCodesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("화면 렌더링 검증", () => {
    it("제목과 안내 문구가 표시됨", () => {
      render(<BackupCodesPage />);

      expect(
        reactScreen.getByRole("heading", { level: 2 }),
      ).toBeInTheDocument();
      expect(
        reactScreen.getByLabelText("backup-codes-description"),
      ).toBeInTheDocument();
    });

    it("모든 백업 코드가 표시됨", () => {
      render(<BackupCodesPage />);

      const codeElements = reactScreen.getAllByRole("code");

      expect(codeElements).toHaveLength(mockBackupCodes.length);
      codeElements.forEach((element, index) => {
        expect(element).toHaveTextContent(mockBackupCodes[index] as string);
      });
    });

    it("다운로드와 확인 버튼이 표시됨", () => {
      render(<BackupCodesPage />);

      expect(
        reactScreen.getByRole("button", { name: "백업 코드 다운로드" }),
      ).toBeInTheDocument();
      expect(
        reactScreen.getByRole("button", { name: "확인" }),
      ).toBeInTheDocument();
    });

    it("경고 문구가 표시됨", () => {
      render(<BackupCodesPage />);

      expect(
        reactScreen.getByLabelText("backup-codes-warning"),
      ).toBeInTheDocument();
    });

    it("backupCodes 상태가 없으면 아무것도 렌더링하지 않음", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        backupCodes: null,
        clearBackupCodes: mockClearBackupCodes,
      });

      render(<BackupCodesPage />);

      expect(
        reactScreen.queryByRole("heading", { name: "백업 코드 저장" }),
      ).not.toBeInTheDocument();
      expect(
        reactScreen.queryByLabelText("backup-codes-description"),
      ).not.toBeInTheDocument();
      expect(reactScreen.queryAllByTestId(/^backup-code-/)).toHaveLength(0);
      expect(
        reactScreen.queryByRole("button", { name: "백업 코드 다운로드" }),
      ).not.toBeInTheDocument();
      expect(
        reactScreen.queryByRole("button", { name: "확인" }),
      ).not.toBeInTheDocument();
      expect(
        reactScreen.queryByLabelText("backup-codes-warning"),
      ).not.toBeInTheDocument();
    });
  });

  describe("동작 검증", () => {
    describe("다운로드 버튼 클릭", () => {
      it("백업 코드가 포함된 텍스트 파일이 다운로드됨", () => {
        const mockCreateObjectURL = vi.fn();
        const mockRevokeObjectURL = vi.fn();

        global.URL.createObjectURL = mockCreateObjectURL;
        global.URL.revokeObjectURL = mockRevokeObjectURL;

        const mockLink = document.createElement("a");
        mockLink.download = "backup-codes.txt";
        mockLink.click = vi.fn();

        vi.spyOn(document, "createElement").mockReturnValueOnce(mockLink);

        vi.mocked(useAuthStore).mockReturnValue({
          backupCodes: mockBackupCodes,
          clearBackupCodes: vi.fn(),
        });

        render(<BackupCodesPage />);

        fireEvent.click(
          reactScreen.getByRole("button", { name: "백업 코드 다운로드" }),
        );

        const expectedContent = `My Projects Admin - 백업 코드\n\n${mockBackupCodes.join(
          "\n",
        )}`;
        expect(mockCreateObjectURL).toHaveBeenCalledWith(
          new Blob([expectedContent], { type: "text/plain;charset=UTF-8" }),
        );

        expect(mockLink.download).toBe("backup-codes.txt");
        expect(mockRevokeObjectURL).toHaveBeenCalled();
      });
    });

    describe("확인 버튼 동작", () => {
      it("확인 버튼 클릭 시 백업 코드 상태가 초기화되고 대시보드로 이동함", () => {
        vi.mocked(useAuthStore).mockReturnValue({
          backupCodes: mockBackupCodes,
          clearBackupCodes: mockClearBackupCodes,
        });

        render(<BackupCodesPage />);

        fireEvent.click(reactScreen.getByRole("button", { name: "확인" }));

        expect(mockClearBackupCodes).toHaveBeenCalled();
        expect(mockRouter.replace).toHaveBeenCalledWith(ROUTES.DASHBOARD);
      });
    });
  });
});
