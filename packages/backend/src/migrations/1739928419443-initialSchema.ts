import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1739928419443 implements MigrationInterface {
  name = 'InitialSchema1739928419443';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "administrator" ("email" character varying NOT NULL, "isTotpEnabled" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_be0ce9bef56d5a30b9e57525643" PRIMARY KEY ("email"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "totp" ("adminEmail" character varying NOT NULL, "encryptedSecret" character varying NOT NULL, "backupCodes" character varying array NOT NULL DEFAULT '{}', "failedAttempts" smallint NOT NULL DEFAULT '0', "lastFailedAttempt" TIMESTAMP, "administratorEmail" character varying, CONSTRAINT "REL_4162d556ad7980dd95fa65b3ec" UNIQUE ("administratorEmail"), CONSTRAINT "PK_11d602a5a84dee53a1ab8dc2504" PRIMARY KEY ("adminEmail"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."genre_translation_language_enum" AS ENUM('ko', 'en', 'ja')`,
    );
    await queryRunner.query(
      `CREATE TABLE "genre_translation" ("genreId" character varying NOT NULL, "language" "public"."genre_translation_language_enum" NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_ad89d70378ed62556dc9615ee1e" UNIQUE ("name"), CONSTRAINT "PK_2f72ffecf28ed62edaec7cc5c28" PRIMARY KEY ("genreId", "language"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_2f72ffecf28ed62edaec7cc5c2" ON "genre_translation" ("genreId", "language") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."artwork_translation_language_enum" AS ENUM('ko', 'en', 'ja')`,
    );
    await queryRunner.query(
      `CREATE TABLE "artwork_translation" ("artworkId" character varying NOT NULL, "language" "public"."artwork_translation_language_enum" NOT NULL, "title" character varying NOT NULL, "shortReview" character varying, CONSTRAINT "PK_4f3197e3ef9cd57c1c514f03fbf" PRIMARY KEY ("artworkId", "language"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4f3197e3ef9cd57c1c514f03fb" ON "artwork_translation" ("artworkId", "language") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."artwork_playedon_enum" AS ENUM('Steam', 'Switch', 'GOG', 'Epic Games', 'Android')`,
    );
    await queryRunner.query(
      `CREATE TABLE "artwork" ("id" character varying(21) NOT NULL, "imageKey" character varying NOT NULL, "createdAt" TIMESTAMP, "playedOn" "public"."artwork_playedon_enum", "rating" smallint, "isDraft" boolean NOT NULL DEFAULT true, CONSTRAINT "CHK_6ca28e72e96b604643fcbd5eb9" CHECK ("rating" >= 0 AND "rating" <= 20), CONSTRAINT "PK_ee2e7c5ad7226179d4113a96fa8" PRIMARY KEY ("id")); COMMENT ON COLUMN "artwork"."rating" IS '0-20 사이의 정수값 (4로 나누면 실제 별점이 됨)'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ee2e7c5ad7226179d4113a96fa" ON "artwork" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "genre" ("id" character varying(21) NOT NULL, CONSTRAINT "PK_0285d4f1655d080cfcf7d1ab141" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0285d4f1655d080cfcf7d1ab14" ON "genre" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "artwork_genres_genre" ("artworkId" character varying(21) NOT NULL, "genreId" character varying(21) NOT NULL, CONSTRAINT "PK_98fd41c87b9b10580474750bd74" PRIMARY KEY ("artworkId", "genreId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_54fb27c316496085f3fe308c08" ON "artwork_genres_genre" ("artworkId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f50719004f6498d5efc631b746" ON "artwork_genres_genre" ("genreId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "totp" ADD CONSTRAINT "FK_4162d556ad7980dd95fa65b3eca" FOREIGN KEY ("administratorEmail") REFERENCES "administrator"("email") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "genre_translation" ADD CONSTRAINT "FK_cdbf8027e72552b488161c3edc0" FOREIGN KEY ("genreId") REFERENCES "genre"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "artwork_translation" ADD CONSTRAINT "FK_1f160f831796345ce191c491c2f" FOREIGN KEY ("artworkId") REFERENCES "artwork"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "artwork_genres_genre" ADD CONSTRAINT "FK_54fb27c316496085f3fe308c086" FOREIGN KEY ("artworkId") REFERENCES "artwork"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "artwork_genres_genre" ADD CONSTRAINT "FK_f50719004f6498d5efc631b7466" FOREIGN KEY ("genreId") REFERENCES "genre"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    // await queryRunner.query(
    //   `INSERT INTO "administrator" ("email", "isTotpEnabled") VALUES ('minhoyun.life@gmail.com', false)`,
    // );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "artwork_genres_genre" DROP CONSTRAINT "FK_f50719004f6498d5efc631b7466"`,
    );
    await queryRunner.query(
      `ALTER TABLE "artwork_genres_genre" DROP CONSTRAINT "FK_54fb27c316496085f3fe308c086"`,
    );
    await queryRunner.query(
      `ALTER TABLE "artwork_translation" DROP CONSTRAINT "FK_1f160f831796345ce191c491c2f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "genre_translation" DROP CONSTRAINT "FK_cdbf8027e72552b488161c3edc0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "totp" DROP CONSTRAINT "FK_4162d556ad7980dd95fa65b3eca"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f50719004f6498d5efc631b746"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_54fb27c316496085f3fe308c08"`,
    );
    await queryRunner.query(`DROP TABLE "artwork_genres_genre"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0285d4f1655d080cfcf7d1ab14"`,
    );
    await queryRunner.query(`DROP TABLE "genre"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ee2e7c5ad7226179d4113a96fa"`,
    );
    await queryRunner.query(`DROP TABLE "artwork"`);
    await queryRunner.query(`DROP TYPE "public"."artwork_playedon_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4f3197e3ef9cd57c1c514f03fb"`,
    );
    await queryRunner.query(`DROP TABLE "artwork_translation"`);
    await queryRunner.query(
      `DROP TYPE "public"."artwork_translation_language_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2f72ffecf28ed62edaec7cc5c2"`,
    );
    await queryRunner.query(`DROP TABLE "genre_translation"`);
    await queryRunner.query(
      `DROP TYPE "public"."genre_translation_language_enum"`,
    );
    await queryRunner.query(`DROP TABLE "totp"`);
    await queryRunner.query(`DROP TABLE "administrator"`);
  }
}
