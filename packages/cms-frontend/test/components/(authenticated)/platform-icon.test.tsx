import type { GetArtworks200ResponseItemsInnerPlayedOnEnum as Platform } from "@minhoyunlife/my-ts-client";

import { PlatformIcon } from "@/src/components/(authenticated)/platform-icon";

describe("PlatformIcon", () => {
  describe("플랫폼별 아이콘 렌더링 검증", () => {
    it("Steam 아이콘이 렌더링됨", () => {
      render(<PlatformIcon platform="Steam" />);

      expect(
        reactScreen.getByTestId("platform-steam-icon"),
      ).toBeInTheDocument();
    });

    it("Switch 아이콘이 렌더링됨", () => {
      render(<PlatformIcon platform="Switch" />);

      expect(
        reactScreen.getByTestId("platform-switch-icon"),
      ).toBeInTheDocument();
    });

    it("GOG 아이콘이 렌더링됨", () => {
      render(<PlatformIcon platform="GOG" />);

      expect(reactScreen.getByTestId("platform-gog-icon")).toBeInTheDocument();
    });

    it("Epic Games 아이콘이 렌더링됨", () => {
      render(<PlatformIcon platform="Epic Games" />);

      expect(reactScreen.getByTestId("platform-epic-icon")).toBeInTheDocument();
    });

    it("Android 아이콘이 렌더링됨", () => {
      render(<PlatformIcon platform="Android" />);

      expect(
        reactScreen.getByTestId("platform-android-icon"),
      ).toBeInTheDocument();
    });

    it("platform이 undefined일 때 기본 게임패드 아이콘이 렌더링됨", () => {
      render(<PlatformIcon platform={undefined} />);

      expect(
        reactScreen.getByTestId("platform-others-icon"),
      ).toBeInTheDocument();
    });
  });

  describe("스타일 검증", () => {
    it("className prop이 전달되면 해당 클래스가 적용됨", () => {
      const testClass = "test-class";
      render(
        <PlatformIcon
          platform="Steam"
          className={testClass}
        />,
      );

      const icon = reactScreen.getByTestId("platform-steam-icon");
      expect(icon).toHaveClass(testClass);
    });
  });

  describe("툴팁 검증", () => {
    it("아이콘에 플랫폼 이름을 툴팁으로 표시", async () => {
      const platform: Platform = "Steam";
      render(<PlatformIcon platform={platform} />);

      const trigger = reactScreen.getByTestId("platform-steam-icon");
      await userEvent.hover(trigger);

      const tooltip = await reactScreen.findByRole("tooltip");
      expect(tooltip).toHaveTextContent(platform);
    });

    it("platform이 undefined일 경우, Others 로 툴팁이 렌더링됨", async () => {
      const platform = undefined as unknown as Platform;
      render(<PlatformIcon platform={platform} />);

      const trigger = reactScreen.getByTestId("platform-others-icon");
      await userEvent.hover(trigger);

      const tooltip = await reactScreen.findByRole("tooltip");
      expect(tooltip).toHaveTextContent("Others");
    });
  });
});
