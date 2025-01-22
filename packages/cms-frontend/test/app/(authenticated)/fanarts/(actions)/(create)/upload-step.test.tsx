import { UploadStep } from "@/src/app/(authenticated)/fanarts/(actions)/(create)/upload-step";

describe("UploadStep", () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    URL.createObjectURL = vi.fn(() => "mock-url");
    URL.revokeObjectURL = vi.fn();
  });

  it("이미지 파일 선택 시 미리보기가 표시됨", async () => {
    render(<UploadStep onSuccess={mockOnSuccess} />);

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const input = reactScreen.getByTestId("file-input") as HTMLInputElement;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;

    fireEvent.change(input);

    expect(reactScreen.getByAltText("test.jpg")).toBeInTheDocument();
    expect(reactScreen.getByText("test.jpg")).toBeInTheDocument();
  });

  it("드래그 앤 드롭으로 파일 업로드가 가능함", async () => {
    render(<UploadStep onSuccess={mockOnSuccess} />);

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const dropzone = reactScreen.getByText(/이미지를 드래그하여 업로드하거나/);

    const dropEvent = new DragEvent("drop", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: new DataTransfer(),
    });
    dropEvent.dataTransfer!.items.add(file);

    fireEvent.drop(dropzone, dropEvent);

    expect(reactScreen.getByAltText("test.jpg")).toBeInTheDocument();
  });

  it("파일 선택 후 '다른 파일 선택' 버튼으로 파일 변경 가능", async () => {
    render(<UploadStep onSuccess={mockOnSuccess} />);

    const firstFile = new File(["test"], "test1.jpg", { type: "image/jpeg" });
    const secondFile = new File(["test"], "test2.jpg", { type: "image/jpeg" });
    const input = reactScreen.getByTestId("file-input") as HTMLInputElement;

    const dataTransfer1 = new DataTransfer();
    dataTransfer1.items.add(firstFile);
    input.files = dataTransfer1.files;

    fireEvent.change(input);

    expect(reactScreen.getByAltText("test1.jpg")).toBeInTheDocument();

    const changeButton = reactScreen.getByText("다른 파일 선택");
    await userEvent.click(changeButton);

    const dataTransfer2 = new DataTransfer();
    dataTransfer2.items.add(secondFile);
    input.files = dataTransfer2.files;

    fireEvent.change(input);

    expect(reactScreen.getByAltText("test2.jpg")).toBeInTheDocument();
    expect(reactScreen.queryByAltText("test1.jpg")).not.toBeInTheDocument();
  });
});
