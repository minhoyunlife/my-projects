import { validate } from 'class-validator';

import { UpdateGenreDto } from '@/src/modules/genres/dtos/update-genre.dto';
import { createDto } from '@/test/utils/dto.util';

describeWithoutDeps('UpdateGenreDto', () => {
  const validDtoData: Partial<UpdateGenreDto> = {
    koName: '액션',
    enName: 'Action',
    jaName: 'アクション',
  };

  describe('koName', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateGenreDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 부적절한 화이트 스페이스의 구성으로 이뤄진 경우, 적절하게 조정함', async () => {
      const dto = createDto(UpdateGenreDto, validDtoData, {
        koName: '액션　 롤플레잉',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.koName).toBe('액션 롤플레잉');
    });

    it('키가 존재하지 않는 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateGenreDto, validDtoData);
      delete dto.koName;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateGenreDto, validDtoData, { koName: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('koName');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('값이 일정 길이를 초과한 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateGenreDto, validDtoData, {
        koName: 'a'.repeat(31),
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('koName');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('enName', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateGenreDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 부적절한 화이트 스페이스의 구성으로 이뤄진 경우, 적절하게 조정함', async () => {
      const dto = createDto(UpdateGenreDto, validDtoData, {
        enName: 'Action　 RPG',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.enName).toBe('Action RPG');
    });

    it('키가 존재하지 않는 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateGenreDto, validDtoData);
      delete dto.enName;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateGenreDto, validDtoData, { enName: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('enName');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('값이 일정 길이를 초과한 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateGenreDto, validDtoData, {
        enName: 'a'.repeat(31),
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('enName');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('jaName', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateGenreDto, validDtoData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 부적절한 화이트 스페이스의 구성으로 이뤄진 경우, 적절하게 조정함', async () => {
      const dto = createDto(UpdateGenreDto, validDtoData, {
        jaName: 'アクション　 ロールプレイング',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.jaName).toBe('アクション ロールプレイング');
    });

    it('키가 존재하지 않는 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto(UpdateGenreDto, validDtoData);
      delete dto.jaName;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateGenreDto, validDtoData, { jaName: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('jaName');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('값이 일정 길이를 초과한 경우, 에러가 발생함', async () => {
      const dto = createDto(UpdateGenreDto, validDtoData, {
        jaName: 'a'.repeat(31),
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('jaName');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });
});
