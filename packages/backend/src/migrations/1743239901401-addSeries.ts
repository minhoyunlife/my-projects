import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeries1743239901401 implements MigrationInterface {
  name = 'AddSeries1743239901401';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."series_translation_language_enum" AS ENUM('ko', 'en', 'ja')`,
    );
    await queryRunner.query(
      `CREATE TABLE "series_translation" ("seriesId" character varying NOT NULL, "language" "public"."series_translation_language_enum" NOT NULL, "title" character varying NOT NULL, CONSTRAINT "UQ_ef32ca93ebb92b0aaa0c014a7d1" UNIQUE ("title"), CONSTRAINT "PK_86e5831626c017f6a89d1eda2b3" PRIMARY KEY ("seriesId", "language"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_86e5831626c017f6a89d1eda2b" ON "series_translation" ("seriesId", "language") `,
    );
    await queryRunner.query(
      `CREATE TABLE "series" ("id" character varying(21) NOT NULL, CONSTRAINT "PK_e725676647382eb54540d7128ba" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e725676647382eb54540d7128b" ON "series" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "series_artwork" ("seriesId" character varying NOT NULL, "artworkId" character varying NOT NULL, "order" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_a4bab3b4a019282db7585b0e47e" PRIMARY KEY ("seriesId", "artworkId"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a4bab3b4a019282db7585b0e47" ON "series_artwork" ("seriesId", "artworkId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "series_translation" ADD CONSTRAINT "FK_9e9033b773e835d2c4d5cac9507" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "series_artwork" ADD CONSTRAINT "FK_fdc0841e57001801cf20b5c621e" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "series_artwork" ADD CONSTRAINT "FK_7b4e001e809527685bdb11fcc3d" FOREIGN KEY ("artworkId") REFERENCES "artwork"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "series_artwork" DROP CONSTRAINT "FK_7b4e001e809527685bdb11fcc3d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "series_artwork" DROP CONSTRAINT "FK_fdc0841e57001801cf20b5c621e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "series_translation" DROP CONSTRAINT "FK_9e9033b773e835d2c4d5cac9507"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a4bab3b4a019282db7585b0e47"`,
    );
    await queryRunner.query(`DROP TABLE "series_artwork"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e725676647382eb54540d7128b"`,
    );
    await queryRunner.query(`DROP TABLE "series"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_86e5831626c017f6a89d1eda2b"`,
    );
    await queryRunner.query(`DROP TABLE "series_translation"`);
    await queryRunner.query(
      `DROP TYPE "public"."series_translation_language_enum"`,
    );
  }
}
