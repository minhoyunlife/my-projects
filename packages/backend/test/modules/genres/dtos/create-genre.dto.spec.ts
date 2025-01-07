import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateGenreDto } from '@/src/modules/genres/dtos/create-genre.dto';

describeWithoutDeps('CreateGenreDto', () => {
  const validDtoData: Partial<CreateGenreDto> = {
    koName: '액션',
    enName: 'Action',
    jaName: 'アクション',
  };

  function createDto(data?: Partial<CreateGenreDto>): CreateGenreDto {
    return plainToInstance(CreateGenreDto, {
      ...validDtoData,
      ...data,
    });
  }

  describe('koName', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto();
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 부적절한 화이트 스페이스의 구성으로 이뤄진 경우, 적절하게 조정함', async () => {
      const dto = createDto({ koName: '액션　 롤플레잉' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.koName).toBe('액션 롤플레잉');
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto({ koName: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('koName');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('값이 undefined인 경우, 에러가 발생함', async () => {
      const dto = createDto({ koName: undefined });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('koName');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('값이 null인 경우, 에러가 발생함', async () => {
      const dto = createDto({ koName: null });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('koName');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('enName', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto();
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 부적절한 화이트 스페이스의 구성으로 이뤄진 경우, 적절하게 조정함', async () => {
      const dto = createDto({ enName: 'Action　 RPG' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.enName).toBe('Action RPG');
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto({ enName: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('enName');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('값이 undefined인 경우, 에러가 발생함', async () => {
      const dto = createDto({ enName: undefined });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('enName');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('값이 null인 경우, 에러가 발생함', async () => {
      const dto = createDto({ enName: null });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('enName');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('jaName', () => {
    it('값이 유효한 경우, 에러가 발생하지 않음', async () => {
      const dto = createDto();
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('값이 부적절한 화이트 스페이스의 구성으로 이뤄진 경우, 적절하게 조정함', async () => {
      const dto = createDto({ jaName: 'アクション　 RPG' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.jaName).toBe('アクション RPG');
    });

    it('값이 화이트 스페이스로만 이뤄진 경우, 에러가 발생함', async () => {
      const dto = createDto({ jaName: '　' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('jaName');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('값이 undefined인 경우, 에러가 발생함', async () => {
      const dto = createDto({ jaName: undefined });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('jaName');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('값이 null인 경우, 에러가 발생함', async () => {
      const dto = createDto({ jaName: null });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('jaName');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });
});
