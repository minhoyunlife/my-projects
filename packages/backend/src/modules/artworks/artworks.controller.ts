import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ImageFileType } from '@/src/common/enums/file-type.enum';
import { ArtworksService } from '@/src/modules/artworks/artworks.service';
import { ArtworkResponse } from '@/src/modules/artworks/dtos/artwork-response.dto';
import { CreateArtworkDto } from '@/src/modules/artworks/dtos/create-artwork.dto';
import { StorageService } from '@/src/modules/storage/storage.service';

@Controller('artworks')
export class ArtworksController {
  constructor(
    private readonly artworksService: ArtworksService,
    private readonly storageService: StorageService,
  ) {}

  private static UPLOAD_OPTIONS = {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB
      files: 1,
    },
    fileFilter: (_: any, file: Express.Multer.File, callback: Function) => {
      const allowed_types = Object.values(ImageFileType).map((type) =>
        type.toString(),
      );

      if (!allowed_types.includes(file.mimetype)) {
        return callback(
          new BadRequestException(`\
            Not supported image extensions. \ 
            Provided type: ${file.mimetype}, \
            Allowed Type: ${allowed_types.join(', ')}\
          `),
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
  @UseInterceptors(FileInterceptor('image', ArtworksController.UPLOAD_OPTIONS))
  @HttpCode(HttpStatus.CREATED)
  async uploadImage(@UploadedFile() image: Express.Multer.File) {
    if (!image) {
      throw new BadRequestException('Image file is required.');
    }
    return this.storageService.uploadImage(image);
  }
}
