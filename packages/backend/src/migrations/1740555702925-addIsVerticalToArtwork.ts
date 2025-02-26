import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsVerticalToArtwork1740555702925 implements MigrationInterface {
  name = 'AddIsVerticalToArtwork1740555702925';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "artwork" ADD "isVertical" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "artwork" DROP COLUMN "isVertical"`);
  }
}
