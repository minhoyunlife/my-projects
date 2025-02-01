import { validate } from 'class-validator';

import { UpdateArtworkStatusesDto } from '@/src/modules/artworks/dtos/update-artwork-statuses.dto';
import { createDto } from '@/test/utils/dto.util';

describeWithoutDeps('UpdateArtworkStatusesDto', () => {
  const validDtoData: Partial<UpdateArtworkStatusesDto> = {
    ids: ['artwork-1', 'artwork-2'],
    setPublished: true,
  };

  describe('ids', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateArtworkStatusesDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('단일 값이 주어진 경우, 배열화됨', async () => {
      const dto = createDto(UpdateArtworkStatusesDto, validDtoData, {
        ids: 'genre-1' as unknown as string[],
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.ids).toEqual(['genre-1']);
    });

    it('빈 배열이 주어진 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkStatusesDto, validDtoData, {
        ids: [],
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('ids');
      expect(errors[0].constraints).toHaveProperty('arrayNotEmpty');
    });

    it('빈 값으로 주어진 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkStatusesDto, validDtoData, {
        ids: ['', ''],
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('ids');
      expect(errors[0].constraints).toHaveProperty('arrayNotEmpty');
    });

    it('값이 생략된 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkStatusesDto, validDtoData);
      delete dto.ids;

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('ids');
      expect(errors[0].constraints).toHaveProperty('isArray');
    });
  });

  describe('setPublished', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateArtworkStatusesDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 생략된 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkStatusesDto, validDtoData);
      delete dto.setPublished;

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('setPublished');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('boolean이 아닌 값이 주어진 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkStatusesDto, validDtoData, {
        setPublished: 'true' as unknown as boolean,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('setPublished');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });
  });
});
