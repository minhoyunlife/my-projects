import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ImageFileType } from '@/src/common/enums/file-type.enum';
import {
  UploadImageErrorCode,
  UploadImageException,
} from '@/src/common/exceptions/artworks/upload-image.exception';
import { ArtworksService } from '@/src/modules/artworks/artworks.service';
import { ArtworkResponse } from '@/src/modules/artworks/dtos/artwork-response.dto';
import { CreateArtworkDto } from '@/src/modules/artworks/dtos/create-artwork.dto';
import { ArtworksExceptionFilter } from '@/src/modules/artworks/filters/artworks.filter';
import { UploadImageExceptionFilter } from '@/src/modules/artworks/filters/upload-image.filter';
import { StorageService } from '@/src/modules/storage/storage.service';

@Controller('artworks')
@UseFilters(ArtworksExceptionFilter)
export class ArtworksController {
  constructor(
    private readonly artworksService: ArtworksService,
    private readonly storageService: StorageService,
  ) {}

  private static UPLOAD_OPTIONS = {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 1,
    },
    fileFilter: (_: any, file: Express.Multer.File, callback: Function) => {
      const allowed_types = Object.values(ImageFileType).map((type) =>
        type.toString(),
      );
      if (!allowed_types.includes(file.mimetype)) {
        return callback(
          new UploadImageException(
            UploadImageErrorCode.IMAGE_EXTENSION_NOT_SUPPORTED,
            `\
              Not supported image extensions. \ 
              Provided type: ${file.mimetype}, \
              Allowed Type: ${allowed_types.join(', ')}\
            `,
          ),
          false,
        );
      }

      callback(null, true);
    },
  };

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createArtworkDto: CreateArtworkDto,
  ): Promise<ArtworkResponse> {
    const artwork = await this.artworksService.createArtwork(createArtworkDto);
    return new ArtworkResponse(artwork);
  }

  @Post('images')
  @UseFilters(UploadImageExceptionFilter)
  @UseInterceptors(FileInterceptor('image', ArtworksController.UPLOAD_OPTIONS))
  @HttpCode(HttpStatus.CREATED)
  async uploadImage(@UploadedFile() image: Express.Multer.File) {
    if (!image) {
      throw new UploadImageException(
        UploadImageErrorCode.IMAGE_NOT_PROVIDED,
        'Image file is required.',
      );
    }
    return this.storageService.uploadImage(image);
  }
}
