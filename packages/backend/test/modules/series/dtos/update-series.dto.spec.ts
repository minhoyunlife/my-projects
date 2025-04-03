import { validate } from 'class-validator';

import { UpdateSeriesDto } from '@/src/modules/series/dtos/update-series.dto';
import { createDto } from '@/test/utils/dto.util';

describeWithoutDeps('UpdateSeriesDto', () => {
  const validDtoData: Partial<UpdateSeriesDto> = {
    koTitle: '타이틀',
    enTitle: 'title',
    jaTitle: 'タイトル',
  };

  describe('koTitle', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateSeriesDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 부적절한 화이트 스페이스의 구성으로 이뤄진 경우, 적절하게 조정함', async () => {
      const dto = createDto(UpdateSeriesDto, validDtoData, {
        koTitle: '타이　틀',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.koTitle).toBe('타이 틀');
    });

    it('키가 존재하지 않는 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateSeriesDto, validDtoData);
      delete dto.koTitle;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateSeriesDto, validDtoData, { koTitle: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('koTitle');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('값이 일정 길이를 초과한 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateSeriesDto, validDtoData, {
        koTitle: 'a'.repeat(101),
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('koTitle');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('enTitle', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateSeriesDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 부적절한 화이트 스페이스의 구성으로 이뤄진 경우, 적절하게 조정함', async () => {
      const dto = createDto(UpdateSeriesDto, validDtoData, {
        enTitle: 'ti　tle',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.enTitle).toBe('ti tle');
    });

    it('키가 존재하지 않는 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateSeriesDto, validDtoData);
      delete dto.enTitle;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateSeriesDto, validDtoData, { enTitle: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('enTitle');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('값이 일정 길이를 초과한 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateSeriesDto, validDtoData, {
        enTitle: 'a'.repeat(101),
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('enTitle');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('jaTitle', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateSeriesDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 부적절한 화이트 스페이스의 구성으로 이뤄진 경우, 적절하게 조정함', async () => {
      const dto = createDto(UpdateSeriesDto, validDtoData, {
        jaTitle: 'タイ　トル',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.jaTitle).toBe('タイ トル');
    });

    it('키가 존재하지 않는 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateSeriesDto, validDtoData);
      delete dto.jaTitle;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateSeriesDto, validDtoData, { jaTitle: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('jaTitle');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('값이 일정 길이를 초과한 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateSeriesDto, validDtoData, {
        jaTitle: 'a'.repeat(101),
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('jaTitle');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });
});
