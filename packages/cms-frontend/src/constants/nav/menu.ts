import { ROUTES } from "@/src/routes";

// 사이드바 메뉴 아이템
// NOTE: 메뉴를 추가해야 할 때, 여기에서 핸들링할 것.
export const menu = {
  groups: [
    {
      name: "🏞️ 팬아트",
      items: [
        {
          name: "작품 목록",
          url: ROUTES.FANARTS,
        },
        {
          name: "장르 목록",
          url: ROUTES.GENRES,
        },
        {
          name: "시리즈 목록",
          url: ROUTES.SERIES,
        },
      ],
    },
  ],
};
