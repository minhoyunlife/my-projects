import { validate } from 'class-validator';

import { UpdateArtworkDto } from '@/src/modules/artworks/dtos/update-artwork.dto';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { createDto } from '@/test/utils/dto.util';

describeWithoutDeps('UpdateArtworkDto', () => {
  const validDtoData: Partial<UpdateArtworkDto> = {
    koTitle: '게임',
    enTitle: 'Game',
    jaTitle: 'ゲーム',
    createdAt: '2021-01-01T00:00:00Z',
    playedOn: Platform.ANDROID,
    rating: 5,
    koShortReview: '액션',
    enShortReview: 'Action',
    jaShortReview: 'アクション',
  };

  describe('koTitle', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 부적절한 화이트 스페이스의 구성으로 이뤄진 경우, 적절하게 조정함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, {
        koTitle: '액션　 게임',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.koTitle).toBe('액션 게임');
    });

    it('키가 존재하지 않는 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData);
      delete dto.koTitle;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, { koTitle: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('koTitle');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('값이 일정 길이를 초과한 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, {
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
      const dto = createDto(UpdateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 부적절한 화이트 스페이스의 구성으로 이뤄진 경우, 적절하게 조정함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, {
        enTitle: 'action　 game',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.enTitle).toBe('action game');
    });

    it('키가 존재하지 않는 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData);
      delete dto.enTitle;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, { enTitle: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('enTitle');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('값이 일정 길이를 초과한 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, {
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
      const dto = createDto(UpdateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 부적절한 화이트 스페이스의 구성으로 이뤄진 경우, 적절하게 조정함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, {
        jaTitle: 'アクション　 ゲーム',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.jaTitle).toBe('アクション ゲーム');
    });

    it('키가 존재하지 않는 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData);
      delete dto.jaTitle;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, { jaTitle: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('jaTitle');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('값이 일정 길이를 초과한 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, {
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
      const dto = createDto(UpdateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('키가 존재하지 않는 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData);
      delete dto.createdAt;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 date string 형식이 아닌 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, {
        createdAt: 'abcdef',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('createdAt');
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, {
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
      const dto = createDto(UpdateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('키가 존재하지 않는 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData);
      delete dto.playedOn;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 enum 에 존재하지 않는 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, {
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
      const dto = createDto(UpdateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('키가 존재하지 않는 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData);
      delete dto.rating;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 0 미만인 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, { rating: -1 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('rating');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('값이 20 초과인 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, { rating: 21 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('rating');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('값이 소수인 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, { rating: 6.25 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('rating');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });
  });

  describe('koShortReview', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 부적절한 화이트 스페이스의 구성으로 이뤄진 경우, 적절하게 조정함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, {
        koShortReview: '액션　 게임',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.koShortReview).toBe('액션 게임');
    });

    it('키가 존재하지 않는 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData);
      delete dto.koShortReview;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, {
        koShortReview: '　',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('koShortReview');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('값이 일정 길이를 초과한 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, {
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
      const dto = createDto(UpdateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 부적절한 화이트 스페이스의 구성으로 이뤄진 경우, 적절하게 조정함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, {
        enShortReview: '액션　 게임',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.enShortReview).toBe('액션 게임');
    });

    it('키가 존재하지 않는 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData);
      delete dto.enShortReview;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, {
        enShortReview: '　',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('enShortReview');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('값이 일정 길이를 초과한 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, {
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
      const dto = createDto(UpdateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 부적절한 화이트 스페이스의 구성으로 이뤄진 경우, 적절하게 조정함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, {
        jaShortReview: '액션　 게임',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.jaShortReview).toBe('액션 게임');
    });

    it('키가 존재하지 않는 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData);
      delete dto.jaShortReview;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, {
        jaShortReview: '　',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('jaShortReview');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('값이 일정 길이를 초과한 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, {
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
      const dto = createDto(UpdateArtworkDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('키가 존재하지 않는 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData);
      delete dto.genreIds;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 빈 배열인 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateArtworkDto, validDtoData, { genreIds: [] });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});
