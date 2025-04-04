import { validate } from 'class-validator';

import { CreateSeriesDto } from '@/src/modules/series/dtos/create-series.dto';
import { createDto } from '@/test/utils/dto.util';

describeWithoutDeps('CreateSeriesDto', () => {
  const validDtoData: Partial<CreateSeriesDto> = {
    koTitle: '영웅전설: 가가브 트릴로지',
    enTitle: 'The Legend of Heroes: Gagharv Trilogy',
    jaTitle: '英雄伝説 ガガーブトリロジー',
  };

  describe('koTitle', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateSeriesDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 부적절한 화이트 스페이스의 구성으로 이뤄진 경우, 적절하게 조정함', async () => {
      const dto = createDto(CreateSeriesDto, validDtoData, {
        koTitle: '영웅전설:　 가가브 트릴로지',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.koTitle).toBe('영웅전설: 가가브 트릴로지');
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateSeriesDto, validDtoData, { koTitle: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('koTitle');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('값이 undefined인 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateSeriesDto, validDtoData, {
        koTitle: undefined,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('koTitle');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('값이 null인 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateSeriesDto, validDtoData, { koTitle: null });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('koTitle');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('enTitle', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateSeriesDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 부적절한 화이트 스페이스의 구성으로 이뤄진 경우, 적절하게 조정함', async () => {
      const dto = createDto(CreateSeriesDto, validDtoData, {
        enTitle: 'The Legend of Heroes:　 Gagharv Trilogy',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.enTitle).toBe('The Legend of Heroes: Gagharv Trilogy');
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateSeriesDto, validDtoData, { enTitle: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('enTitle');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('값이 undefined인 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateSeriesDto, validDtoData, {
        enTitle: undefined,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('enTitle');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('값이 null인 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateSeriesDto, validDtoData, { enTitle: null });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('enTitle');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('jaTitle', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateSeriesDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 부적절한 화이트 스페이스의 구성으로 이뤄진 경우, 적절하게 조정함', async () => {
      const dto = createDto(CreateSeriesDto, validDtoData, {
        jaTitle: '英雄伝説 　ガガーブトリロジー',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.jaTitle).toBe('英雄伝説 ガガーブトリロジー');
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateSeriesDto, validDtoData, { jaTitle: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('jaTitle');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('값이 undefined인 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateSeriesDto, validDtoData, {
        jaTitle: undefined,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('jaTitle');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('값이 null인 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateSeriesDto, validDtoData, { jaTitle: null });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('jaTitle');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });
});
