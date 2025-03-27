export interface BaseMapper<Entity, CreateDto, UpdateDto> {
  toEntityForCreate(createDto: CreateDto): Partial<Entity>;
  toEntityForUpdate(updateDto: UpdateDto, id: string): Partial<Entity>;
}
