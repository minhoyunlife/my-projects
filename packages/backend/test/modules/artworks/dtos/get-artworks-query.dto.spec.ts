import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { GetArtworksQueryDto } from '@/src/modules/artworks/dtos/get-artworks-query.dto';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { SortType } from '@/src/modules/artworks/enums/sort-type.enum';
import { Status } from '@/src/modules/artworks/enums/status.enum';

describeWithoutDeps('GetArtworksQueryDto', () => {
  const validDtoData: Partial<GetArtworksQueryDto> = {
    page: 1,
    sort: SortType.CREATED_DESC,
    platforms: [Platform.STEAM],
    genreIds: ['genre-1', 'genre-2'],
    search: 'test',
    status: [Status.DRAFT],
  };

  function createDto(data?: Partial<GetArtworksQueryDto>): GetArtworksQueryDto {
    return plainToInstance(GetArtworksQueryDto, {
      ...validDtoData,
      ...data,
    });
  }

  describe('page', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto();
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 주어지지 않은 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto({ page: undefined });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 정수가 아닌 문자열인 경우, 에러가 발생함', async () => {
      const dto = createDto({ page: 'a' as unknown as number });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('값이 소수인 경우, 에러가 발생함', async () => {
      const dto = createDto({ page: 1.23 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('값이 1 미만인 경우, 에러가 발생함', async () => {
      const dto = createDto({ page: 0 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });

  describe('sort', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto();
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 주어지지 않은 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto({ sort: undefined });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 enum 에 존재하지 않는 경우, 에러가 발생함', async () => {
      const dto = createDto({ sort: 'unknown' as SortType });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('sort');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('platforms', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto();
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('빈 배열이 주어진 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto({ platforms: [] });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 생략된 경우, 에러가 발생하지 않음', async () => {
      const testData = { ...validDtoData };
      delete testData.platforms;

      const dto = createDto(testData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('일부 값이 enum 에 존재하지 않는 값인 경우, 에러가 발생함', async () => {
      const dto = createDto({
        platforms: [Platform.STEAM, 'unknown' as Platform],
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('platforms');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('genres', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto();
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('빈 배열이 주어진 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto({ genreIds: [] });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('빈 값으로 주어진 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto({ genreIds: ['', ''] });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 생략된 경우, 에러가 발생하지 않음', async () => {
      const testData = { ...validDtoData };
      delete testData.genreIds;

      const dto = createDto(testData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('search', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto();
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('문자열에 좌우 스페이스가 들어가 있는 경우, 값이 트림됨', async () => {
      const dto = createDto({ search: '  test  ' });
      expect(dto.search).toBe('test');
    });

    it('문자열 안에 공백이 복수 들어가 있는 경우, 값이 하나의 공백으로 치환됨', async () => {
      const dto = createDto({ search: 'test 　test' });
      expect(dto.search).toBe('test test');
    });

    it('값이 미지정인 경우에도 에러가 발생하지 않음', async () => {
      const dto = createDto({ search: undefined });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('빈 값이 주어진 경우, 에러가 발생함', async () => {
      const dto = createDto({ search: '' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('search');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('길이 제한을 초과한 값이 주어진 경우, 에러가 발생함', async () => {
      const dto = createDto({ search: 'a'.repeat(51) });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('search');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('status', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto();
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('빈 배열이 주어진 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto({ status: [] });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 생략된 경우, 에러가 발생하지 않음', async () => {
      const testData = { ...validDtoData };
      delete testData.status;

      const dto = createDto(testData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('일부 값이 enum 에 존재하지 않는 값인 경우, 에러가 발생함', async () => {
      const dto = createDto({
        status: [Status.DRAFT, 'unknown' as Status],
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('status');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });
});
