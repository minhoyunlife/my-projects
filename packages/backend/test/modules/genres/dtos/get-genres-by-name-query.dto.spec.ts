import { validate } from 'class-validator';

import { GetGenresByNameQueryDto } from '@/src/modules/genres/dtos/get-genres-by-name-query.dto';
import { createDto } from '@/test/utils/dto.util';

describeWithoutDeps('GetGenresByNameQueryDto', () => {
  const validDtoData: Partial<GetGenresByNameQueryDto> = {
    search: 'test',
  };

  describe('search', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(GetGenresByNameQueryDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('문자열에 좌우 스페이스가 들어가 있는 경우, 값이 트림됨', async () => {
      const dto = createDto(GetGenresByNameQueryDto, validDtoData, {
        search: '  test  ',
      });
      expect(dto.search).toBe('test');
    });

    it('문자열 안에 공백이 복수 들어가 있는 경우, 값이 하나의 공백으로 치환됨', async () => {
      const dto = createDto(GetGenresByNameQueryDto, validDtoData, {
        search: 'test 　test',
      });
      expect(dto.search).toBe('test test');
    });

    it('값이 미지정인 경우, 에러가 발생함', async () => {
      const dto = createDto(GetGenresByNameQueryDto, validDtoData, {
        search: undefined,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('search');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('빈 값이 주어진 경우, 에러가 발생함', async () => {
      const dto = createDto(GetGenresByNameQueryDto, validDtoData, {
        search: '',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('search');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('길이 제한을 초과한 값이 주어진 경우, 에러가 발생함', async () => {
      const dto = createDto(GetGenresByNameQueryDto, validDtoData, {
        search: 'a'.repeat(31),
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('search');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });
});
