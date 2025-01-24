import { GetObjectCommand, GetObjectTaggingCommand } from '@aws-sdk/client-s3';
import Sharp from 'sharp';

import { ImageFileType } from '@/src/modules/artworks/enums/file-type.enum';
import { ImageStatus } from '@/src/modules/storage/enums/status.enum';
import { StorageService } from '@/src/modules/storage/storage.service';
import { TEST_S3_CONFIG } from '@/test/test.config';
import { createTestingModuleWithoutDB } from '@/test/utils/module-builder.util';

describeWithDeps('StorageService', () => {
  let service: StorageService;

  beforeAll(async () => {
    const module = await createTestingModuleWithoutDB({
      providers: [StorageService],
    });

    service = module.get<StorageService>(StorageService);
  });

  describe('getImageUrl', () => {
    it('이미지 키를 받아 URL을 반환함', () => {
      const imageKey = 'artworks/2024/03/abc123def456.webp';
      const result = service.getImageUrl(imageKey);

      expect(result).toBe(
        `https://${TEST_S3_CONFIG.cloudfrontDomain}/${imageKey}`,
      );
    });
  });

  describe('uploadImage', async () => {
    const imageData = {
      originalname: 'test.jpg',
      mimetype: ImageFileType.JPEG,
      buffer: await Sharp({
        create: {
          width: 2000,
          height: 2000,
          channels: 3,
          background: 'green',
        },
      })
        .jpeg()
        .toBuffer(),
    } as Express.Multer.File;

    it('이미지가 성공적으로 업로드 됨', async () => {
      const result = await service.uploadImage(imageData);

      const [{ Body }, { TagSet }] = await Promise.all([
        service.client.send(
          new GetObjectCommand({
            Bucket: TEST_S3_CONFIG.bucket,
            Key: result.imageKey,
          }),
        ),
        service.client.send(
          new GetObjectTaggingCommand({
            Bucket: TEST_S3_CONFIG.bucket,
            Key: result.imageKey,
          }),
        ),
      ]);

      const uploadedBuffer = Buffer.from(
        await Body.transformToString('binary'),
        'binary',
      );

      expect(uploadedBuffer.length).toBeGreaterThan(0);
      expect(TagSet).toHaveLength(1);
      expect(TagSet[0]).toEqual({
        Key: 'status',
        Value: ImageStatus.ACTIVE,
      });
    });

    it('업로드된 이미지가 최적화 처리의 사양을 만족함', async () => {
      const result = await service.uploadImage(imageData);

      const { Body, ContentType } = await service.client.send(
        new GetObjectCommand({
          Bucket: TEST_S3_CONFIG.bucket,
          Key: result.imageKey,
        }),
      );

      const imageBuffer = Buffer.from(
        await Body.transformToString('binary'),
        'binary',
      );
      const actualMetadata = await Sharp(imageBuffer).metadata();

      expect(ContentType).toBe(ImageFileType.WEBP);
      expect(actualMetadata.format).toBe('webp');
      expect(actualMetadata.width).toBe(1440);
    });

    it('이미지 업로드 성공 시 이미지 키가 올바른 형식으로 반환됨', async () => {
      const result = await service.uploadImage(imageData);
      expect(result.imageKey).toMatch(/^artworks\/\d{4}\/\d{2}\/[\w-]+\.webp$/);
    });
  });

  describe('changeImageTag', () => {
    let uploadedImageKey: string;

    beforeEach(async () => {
      const imageData = {
        originalname: 'test.jpg',
        mimetype: ImageFileType.JPEG,
        buffer: await Sharp({
          create: {
            width: 100,
            height: 100,
            channels: 3,
            background: 'blue',
          },
        })
          .jpeg()
          .toBuffer(),
      } as Express.Multer.File;

      const result = await service.uploadImage(imageData);
      uploadedImageKey = result.imageKey;
    });

    it('이미지의 status 태그가 정상적으로 변경됨', async () => {
      await service.changeImageTag(uploadedImageKey, ImageStatus.TO_DELETE);

      const { TagSet } = await service.client.send(
        new GetObjectTaggingCommand({
          Bucket: TEST_S3_CONFIG.bucket,
          Key: uploadedImageKey,
        }),
      );

      expect(TagSet).toHaveLength(1);
      expect(TagSet[0]).toEqual({
        Key: 'status',
        Value: ImageStatus.TO_DELETE,
      });
    });

    it('존재하지 않는 이미지 키로 태그 변경 시 에러 발생', async () => {
      const nonExistentKey = 'non-existent-key.webp';

      await expect(
        service.changeImageTag(nonExistentKey, ImageStatus.TO_DELETE),
      ).rejects.toThrow();
    });
  });
});
