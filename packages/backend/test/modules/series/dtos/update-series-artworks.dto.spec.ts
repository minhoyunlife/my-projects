import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateSeriesArtworksDto } from '@/src/modules/series/dtos/update-series-artworks.dto';
import { createDto } from '@/test/utils/dto.util';

describeWithoutDeps('UpdateSeriesArtworksDto', () => {
  const validDtoData: Partial<UpdateSeriesArtworksDto> = {
    artworks: [
      { id: 'artwork-1', order: 0 },
      { id: 'artwork-2', order: 1 },
      { id: 'artwork-3', order: 2 },
    ],
  };

  describe('artworks', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateSeriesArtworksDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('빈 배열도 유효함', async () => {
      const dto = createDto(UpdateSeriesArtworksDto, {
        artworks: [],
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 생략된 경우, 에러가 발생하지 않음 (빈 배열로 취급)', async () => {
      const dto = new UpdateSeriesArtworksDto();
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.artworks).toBeUndefined();
    });

    describe('artworks 내부 항목 유효성 검증', () => {
      it('작품 ID가 빈 문자열인 경우, 에러가 발생함', async () => {
        const dto = plainToInstance(UpdateSeriesArtworksDto, {
          artworks: [{ id: '', order: 0 }],
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('artworks');
        expect(errors[0].children).toHaveLength(1);
        expect(errors[0].children[0].property).toBe('0');
        expect(errors[0].children[0].children).toHaveLength(1);
        expect(errors[0].children[0].children[0].property).toBe('id');
      });

      it('작품 ID가 생략된 경우, 에러가 발생함', async () => {
        const dto = plainToInstance(UpdateSeriesArtworksDto, {
          artworks: [{ order: 0 }],
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('artworks');
        expect(errors[0].children).toHaveLength(1);
        expect(errors[0].children[0].property).toBe('0');
        expect(errors[0].children[0].children).toHaveLength(1);
        expect(errors[0].children[0].children[0].property).toBe('id');
      });

      it('order가 음수인 경우, 에러가 발생함', async () => {
        const dto = plainToInstance(UpdateSeriesArtworksDto, {
          artworks: [{ id: 'artwork-1', order: -1 }],
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('artworks');
        expect(errors[0].children).toHaveLength(1);
        expect(errors[0].children[0].property).toBe('0');
        expect(errors[0].children[0].children).toHaveLength(1);
        expect(errors[0].children[0].children[0].property).toBe('order');
        expect(errors[0].children[0].children[0].constraints).toHaveProperty(
          'min',
        );
      });

      it('order가 정수가 아닌 경우, 에러가 발생함', async () => {
        const dto = plainToInstance(UpdateSeriesArtworksDto, {
          artworks: [{ id: 'artwork-1', order: 1.5 }],
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('artworks');
        expect(errors[0].children).toHaveLength(1);
        expect(errors[0].children[0].property).toBe('0');
        expect(errors[0].children[0].children).toHaveLength(1);
        expect(errors[0].children[0].children[0].property).toBe('order');
        expect(errors[0].children[0].children[0].constraints).toHaveProperty(
          'isInt',
        );
      });

      it('order가 생략된 경우, 에러가 발생함', async () => {
        const dto = plainToInstance(UpdateSeriesArtworksDto, {
          artworks: [{ id: 'artwork-1' }],
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('artworks');
        expect(errors[0].children).toHaveLength(1);
        expect(errors[0].children[0].property).toBe('0');
        expect(errors[0].children[0].children).toHaveLength(1);
        expect(errors[0].children[0].children[0].property).toBe('order');
        expect(errors[0].children[0].children[0].constraints).toHaveProperty(
          'isInt',
        );
      });
    });
  });
});
