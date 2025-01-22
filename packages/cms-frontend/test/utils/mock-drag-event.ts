class MockDragEvent extends Event {
  dataTransfer: DataTransfer | null = null;

  constructor(type: string, eventInitDict?: DragEventInit) {
    super(type, eventInitDict);
    this.dataTransfer = eventInitDict?.dataTransfer || null;
  }
}

export function setupMockDragEvent() {
  Object.defineProperty(window, "DragEvent", {
    writable: true,
    value: MockDragEvent,
  });
}
