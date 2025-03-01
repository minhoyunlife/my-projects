import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  HeadBucketCommand,
  PutObjectCommand,
  PutObjectTaggingCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import Sharp from 'sharp';

import { ImageFileType } from '@/src/modules/artworks/enums/file-type.enum';
import { ImageStatus } from '@/src/modules/storage/enums/status.enum';

type UploadResult = {
  imageKey: string;
  isVertical: boolean;
};

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  private readonly TARGET_WIDTH = 1440;
  private readonly IMAGE_QUALITY = 85;

  get client(): S3Client {
    return this.s3Client;
  }

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get('s3.endpoint');

    this.s3Client = new S3Client({
      region: this.configService.get('s3.region'),
      credentials: {
        accessKeyId: this.configService.get('s3.accessKeyId'),
        secretAccessKey: this.configService.get('s3.secretAccessKey'),
      },
      ...(endpoint ? { endpoint } : {}), // 본 코드에서는 디폴트 값을, 테스트 파일 내에서는 가상의 환경변수를 설정하기 위함
      forcePathStyle: true, // LocalStack 에서의 테스트 시 버킷을 경로 스타일로 사용하게 해야 함
    });
    this.bucket = this.configService.get('s3.bucket');
  }

  async checkBucketConnection(): Promise<void> {
    await this.client.send(
      new HeadBucketCommand({
        Bucket: this.bucket,
      }),
    );
  }

  getImageUrl(imageKey: string): string {
    const cloudfrontDomain = this.configService.get('s3.cloudfrontDomain');
    return `https://${cloudfrontDomain}/${imageKey}`;
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadResult> {
    const metadata = await Sharp(file.buffer).metadata();
    const isVertical = metadata.height > metadata.width;

    const optimizedBuffer = await this.optimizeImage(file.buffer);
    const imageKey = this.generateImageKey();

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: imageKey,
        Body: optimizedBuffer,
        ContentType: ImageFileType.WEBP,
        Tagging: `status=${ImageStatus.ACTIVE}`,
      }),
    );

    return { imageKey, isVertical };
  }

  /**
   * S3 이미지 오브젝트의 status 태그 값을 변경
   * @param imageKey - 변경할 이미지의 키
   * @param status - 변경할 상태 값
   */
  async changeImageTag(imageKey: string, status: ImageStatus): Promise<void> {
    await this.client.send(
      new PutObjectTaggingCommand({
        Bucket: this.bucket,
        Key: imageKey,
        Tagging: {
          TagSet: [
            {
              Key: 'status',
              Value: status,
            },
          ],
        },
      }),
    );
  }

  private async optimizeImage(buffer: Buffer): Promise<Buffer> {
    return Sharp(buffer)
      .resize(this.TARGET_WIDTH, null, {
        withoutEnlargement: true, // 원본보다 확대됨을 방지
        fit: 'inside',
      })
      .webp({
        quality: this.IMAGE_QUALITY,
        effort: 6,
        nearLossless: true,
        smartSubsample: true,
      })
      .toBuffer();
  }

  private generateImageKey(): string {
    const date = new Date().toISOString().slice(0, 7).replace('-', '/');
    const uniqueId = nanoid();

    return `artworks/${date}/${uniqueId}.webp`;
  }
}
