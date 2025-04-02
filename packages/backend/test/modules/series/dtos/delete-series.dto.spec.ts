import { validate } from 'class-validator';

import { DeleteSeriesDto } from '@/src/modules/series/dtos/delete-series.dto';
import { createDto } from '@/test/utils/dto.util';

describeWithoutDeps('DeleteSeriesDto', () => {
  const validDtoData: Partial<DeleteSeriesDto> = {
    ids: ['series-1', 'series-2'],
  };

  describe('ids', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(DeleteSeriesDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('단일 값이 주어진 경우, 배열화됨', async () => {
      const dto = createDto(DeleteSeriesDto, validDtoData, {
        ids: 'series-1' as unknown as string[],
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.ids).toEqual(['series-1']);
    });

    it('빈 배열이 주어진 경우, 에러가 발생함', async () => {
      const dto = createDto(DeleteSeriesDto, validDtoData, { ids: [] });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('ids');
      expect(errors[0].constraints).toHaveProperty('arrayNotEmpty');
    });

    it('빈 값으로 주어진 경우, 에러가 발생함', async () => {
      const dto = createDto(DeleteSeriesDto, validDtoData, {
        ids: ['', ''],
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('ids');
      expect(errors[0].constraints).toHaveProperty('arrayNotEmpty');
    });

    it('값이 생략된 경우, 에러가 발생함', async () => {
      const dto = createDto(DeleteSeriesDto, validDtoData);
      delete dto.ids;

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('ids');
      expect(errors[0].constraints).toHaveProperty('isArray');
    });
  });
});
