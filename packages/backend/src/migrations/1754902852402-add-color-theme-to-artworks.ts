import { MigrationInterface, QueryRunner } from "typeorm";

import type {
  ColorTheme,
} from '@/src/modules/artworks/interfaces/color-theme.interface';

export class AddColorThemeToArtworks1754902852402 implements MigrationInterface {
    name = 'AddColorThemeToArtworks1754902852402'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🎨 Starting color theme migration...');
        
        // 기본 색상 테마 (현재 갤러리 색상)
        const defaultTheme: ColorTheme = {
            dominantColors: [],
            theme: {
                primaryBg: '#363766',
                secondaryBg: '#282455',
                textColor: '#f0f0ff',
                textMuted: '#ada9d4',
                accent: '#ff5a5a'
            }
        };
        
        // 컬럼 추가 (NOT NULL + 기본값)
        await queryRunner.query(
            `ALTER TABLE "artwork" ADD "colorTheme" json NOT NULL DEFAULT '${JSON.stringify(defaultTheme)}'`
        );
        
        console.log('✅ Column "colorTheme" added with default theme');
        console.log('🎉 Color theme migration completed successfully!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Reverting color theme migration...');
        await queryRunner.query(`ALTER TABLE "artwork" DROP COLUMN "colorTheme"`);
        console.log('✅ Column "colorTheme" removed from artwork table');
    }
}
