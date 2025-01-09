import { validate } from 'class-validator';

import { GetGenresQueryDto } from '@/src/modules/genres/dtos/get-genres-query.dto';
import { createDto } from '@/test/utils/dto.util';

describeWithoutDeps('GetGenresQueryDto', () => {
  const validDtoData: Partial<GetGenresQueryDto> = {
    page: 1,
    search: 'test',
  };

  describe('page', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(GetGenresQueryDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 주어지지 않은 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(GetGenresQueryDto, validDtoData, {
        page: undefined,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 정수가 아닌 문자열인 경우, 에러가 발생함', async () => {
      const dto = createDto(GetGenresQueryDto, validDtoData, {
        page: 'a' as unknown as number,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('값이 소수인 경우, 에러가 발생함', async () => {
      const dto = createDto(GetGenresQueryDto, validDtoData, { page: 1.23 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('값이 1 미만인 경우, 에러가 발생함', async () => {
      const dto = createDto(GetGenresQueryDto, validDtoData, { page: 0 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });

  describe('search', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(GetGenresQueryDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('문자열에 좌우 스페이스가 들어가 있는 경우, 값이 트림됨', async () => {
      const dto = createDto(GetGenresQueryDto, validDtoData, {
        search: '  test  ',
      });
      expect(dto.search).toBe('test');
    });

    it('문자열 안에 공백이 복수 들어가 있는 경우, 값이 하나의 공백으로 치환됨', async () => {
      const dto = createDto(GetGenresQueryDto, validDtoData, {
        search: 'test 　test',
      });
      expect(dto.search).toBe('test test');
    });

    it('값이 미지정인 경우에도 에러가 발생하지 않음', async () => {
      const dto = createDto(GetGenresQueryDto, validDtoData, {
        search: undefined,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('빈 값이 주어진 경우, 에러가 발생함', async () => {
      const dto = createDto(GetGenresQueryDto, validDtoData, { search: '' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('search');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('길이 제한을 초과한 값이 주어진 경우, 에러가 발생함', async () => {
      const dto = createDto(GetGenresQueryDto, validDtoData, {
        search: 'a'.repeat(31),
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('search');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });
});
