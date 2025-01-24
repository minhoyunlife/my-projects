import { validate } from 'class-validator';

import { DeleteArtworksDto } from '@/src/modules/artworks/dtos/delete-artworks.dto';
import { createDto } from '@/test/utils/dto.util';

describeWithoutDeps('DeleteArtworksDto', () => {
  const validDtoData: Partial<DeleteArtworksDto> = {
    ids: ['artwork-1', 'artwork-2'],
  };

  describe('ids', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(DeleteArtworksDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('단일 값이 주어진 경우, 배열화됨', async () => {
      const dto = createDto(DeleteArtworksDto, validDtoData, {
        ids: 'genre-1' as unknown as string[],
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.ids).toEqual(['genre-1']);
    });

    it('빈 배열이 주어진 경우, 에러가 발생함', async () => {
      const dto = createDto(DeleteArtworksDto, validDtoData, { ids: [] });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('ids');
      expect(errors[0].constraints).toHaveProperty('arrayNotEmpty');
    });

    it('빈 값으로 주어진 경우, 에러가 발생함', async () => {
      const dto = createDto(DeleteArtworksDto, validDtoData, {
        ids: ['', ''],
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('ids');
      expect(errors[0].constraints).toHaveProperty('arrayNotEmpty');
    });

    it('값이 생략된 경우, 에러가 발생함', async () => {
      const dto = createDto(DeleteArtworksDto, validDtoData);
      delete dto.ids;

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('ids');
      expect(errors[0].constraints).toHaveProperty('isArray');
    });
  });
});
