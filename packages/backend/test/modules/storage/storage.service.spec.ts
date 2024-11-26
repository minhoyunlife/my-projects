import { GetObjectCommand } from '@aws-sdk/client-s3';
import Sharp from 'sharp';

import { ImageFileType } from '@/src/common/enums/file-type.enum';
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

      const { Body } = await service.client.send(
        new GetObjectCommand({
          Bucket: TEST_S3_CONFIG.bucket,
          Key: result.imageKey,
        }),
      );

      const uploadedBuffer = Buffer.from(
        await Body.transformToString('binary'),
        'binary',
      );
      expect(uploadedBuffer.length).toBeGreaterThan(0);
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
});
