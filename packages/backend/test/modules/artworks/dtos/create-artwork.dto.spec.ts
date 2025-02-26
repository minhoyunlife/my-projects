import { validate } from 'class-validator';

import { CreateArtworkDto } from '@/src/modules/artworks/dtos/create-artwork.dto';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { createDto } from '@/test/utils/dto.util';

describeWithoutDeps('CreateArtworkDto', () => {
  const validDtoData: Partial<CreateArtworkDto> = {
    imageKey: 'artworks/2024/03/abc123def456',
    isVertical: true,
    koTitle: '테스트 작품 제목',
    enTitle: 'Test Artwork Title',
    jaTitle: 'テスト作品のタイトル',
    createdAt: '2022-01-01',
    playedOn: Platform.STEAM,
    rating: 19,
    koShortReview: '이 작품은 정말 재미있었습니다.',
    enShortReview: 'This artwork was really fun.',
    jaShortReview: 'この作品は本当に楽しかったです。',
    genreIds: ['id1', 'id2'],
  };

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

  describe('isVertical', () => {
    it('값이 존재하는 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 존재하지 않는 경우, 에러가 발생함', async () => {
      const { isVertical, ...rest } = validDtoData;
      const dto = createDto(CreateArtworkDto, rest);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isVertical');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });
  });

  describe('koTitle', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, { koTitle: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('koTitle');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('값이 null인 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, { koTitle: null });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('koTitle');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('값이 일정 길이를 초과한 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, {
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
      const dto = createDto(CreateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, { enTitle: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('enTitle');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('값이 null인 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, { enTitle: null });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('enTitle');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('값이 일정 길이를 초과한 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, {
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
      const dto = createDto(CreateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, { jaTitle: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('jaTitle');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('값이 null인 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, { jaTitle: null });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('jaTitle');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('값이 일정 길이를 초과한 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, {
        jaTitle: 'a'.repeat(101),
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('jaTitle');
      expect(errors[0].constraints).toHaveProperty('maxLength');
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

  describe('koShortReview', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 null인 경우에도 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, {
        koShortReview: null,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 일정 길이를 초과한 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, {
        koShortReview: 'a'.repeat(201),
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('koShortReview');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('enShortReview', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 null인 경우에도 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, {
        enShortReview: null,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 일정 길이를 초과한 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, {
        enShortReview: 'a'.repeat(201),
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('enShortReview');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('jaShortReview', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 null인 경우에도 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, {
        jaShortReview: null,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 일정 길이를 초과한 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, {
        jaShortReview: 'a'.repeat(201),
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('jaShortReview');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('genreIds', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 빈 배열인 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, { genreIds: [] });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 생략된 경우, 에러가 발생함', async () => {
      const dto = createDto(CreateArtworkDto, validDtoData, {
        genreIds: undefined,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
    });
  });
});
