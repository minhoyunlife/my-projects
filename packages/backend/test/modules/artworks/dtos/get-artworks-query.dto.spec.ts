import { validate } from 'class-validator';

import { GetArtworksQueryDto } from '@/src/modules/artworks/dtos/get-artworks-query.dto';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { Sort } from '@/src/modules/artworks/enums/sort-type.enum';
import { Status } from '@/src/modules/artworks/enums/status.enum';
import { createDto } from '@/test/utils/dto.util';

describeWithoutDeps('GetArtworksQueryDto', () => {
  const validDtoData: Partial<GetArtworksQueryDto> = {
    page: 1,
    sort: Sort.CREATED_DESC,
    platforms: [Platform.STEAM],
    genreIds: ['genre-1', 'genre-2'],
    search: 'test',
    status: [Status.DRAFT],
  };

  describe('page', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 주어지지 않은 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData, {
        page: undefined,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 정수가 아닌 문자열인 경우, 에러가 발생함', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData, {
        page: 'a' as unknown as number,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('값이 소수인 경우, 에러가 발생함', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData, { page: 1.23 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('값이 1 미만인 경우, 에러가 발생함', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData, { page: 0 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });

  describe('sort', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 주어지지 않은 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData, {
        sort: undefined,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 enum 에 존재하지 않는 경우, 디폴트 값으로 설정됨', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData, {
        sort: 'unknown' as unknown as Sort,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.sort).toBe(Sort.CREATED_DESC);
    });
  });

  describe('platforms', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('빈 배열이 주어진 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData, {
        platforms: [],
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 생략된 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData);
      delete dto.platforms;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('일부 값이 enum 에 존재하지 않는 값인 경우, 에러가 발생함', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData, {
        platforms: [Platform.STEAM, 'unknown' as Platform],
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('platforms');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('genreIds', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('빈 배열이 주어진 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData, {
        genreIds: [],
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('빈 값으로 주어진 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData, {
        genreIds: ['', ''],
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 생략된 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData);
      delete dto.genreIds;
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('search', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('문자열에 좌우 스페이스가 들어가 있는 경우, 값이 트림됨', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData, {
        search: '  test  ',
      });
      expect(dto.search).toBe('test');
    });

    it('문자열 안에 공백이 복수 들어가 있는 경우, 값이 하나의 공백으로 치환됨', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData, {
        search: 'test 　test',
      });
      expect(dto.search).toBe('test test');
    });

    it('값이 미지정인 경우에도 에러가 발생하지 않음', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData, {
        search: undefined,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('빈 값이 주어진 경우, 에러가 발생함', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData, { search: '' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('search');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('길이 제한을 초과한 값이 주어진 경우, 에러가 발생함', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData, {
        search: 'a'.repeat(51),
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('search');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('status', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('빈 배열이 주어진 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData, { status: [] });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 생략된 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData);
      delete dto.status;
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('일부 값이 enum 에 존재하지 않는 값인 경우, 에러가 발생함', async () => {
      const dto = createDto(GetArtworksQueryDto, validDtoData, {
        status: [Status.DRAFT, 'unknown' as Status],
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('status');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });
});
