/**
 * 기본 라우트 파라미터 타입
 * 모든 도메인별 라우트 파라미터는 이 타입을 확장하여 사용
 */
export type BaseRouteParams = Record<string, string | undefined>;

/**
 * 기본 라우트 정보 타입
 * 모든 도메인별 라우트 정보는 이 타입을 확장하여 사용
 */
export type BaseRoute = {
  path: string;
  params: BaseRouteParams;
};

/**
 * 라우트 정보를 URL 문자열로 변환
 */
export const createUrl = ({ path, params }: BaseRoute): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.append(key, value);
  });

  const queryString = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
};
