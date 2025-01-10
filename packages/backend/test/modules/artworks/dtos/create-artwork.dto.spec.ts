import { validate } from 'class-validator';

import { CreateArtworkDto } from '@/src/modules/artworks/dtos/create-artwork.dto';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { createDto } from '@/test/utils/dto.util';

describeWithoutDeps('CreateArtworkDto', () => {
  const validDtoData: Partial<CreateArtworkDto> = {
    title: '테스트 작품 제목',
    imageKey: 'artworks/2024/03/abc123def456',
    createdAt: '2022-01-01',
    playedOn: Platform.STEAM,
    genreIds: ['id1', 'id2'],
    rating: 19,
    shortReview: '이 작품은 정말 재미있었습니다.',
  };

  describe('title', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, { title: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('값이 null인 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, { title: null });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('imageKey', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, { imageKey: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('imageKey');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('값이 null인 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, { imageKey: null });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('imageKey');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('createdAt', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 null인 경우에도 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, {
        createdAt: null,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 date string 형식이 아닌 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, {
        createdAt: 'abcdef',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('createdAt');
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, {
        createdAt: '　',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('createdAt');
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });
  });

  describe('genreIds', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 빈 배열인 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, { genreIds: [] });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
    });

    it('값이 생략된 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, {
        genreIds: undefined,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
    });
  });

  describe('playedOn', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 null인 경우에도 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, { playedOn: null });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 enum 에 존재하지 않는 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, {
        playedOn: 'NOT_EXISTING' as Platform,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('playedOn');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('rating', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 null인 경우에도 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, { rating: null });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 0 미만인 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, { rating: -1 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('rating');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('값이 20 초과인 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, { rating: 21 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('rating');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('값이 소수인 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, { rating: 6.25 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('rating');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });
  });

  describe('shortReview', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 null인 경우에도 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, {
        shortReview: null,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값의 길이가 0인 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, {
        shortReview: '',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('shortReview');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, {
        shortReview: '　',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('shortReview');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });
  });
});
