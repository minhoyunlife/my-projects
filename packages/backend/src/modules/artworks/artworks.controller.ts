import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { ArtworksService } from '@/src/modules/artworks/artworks.service';
import {
  ArtworkListResponse,
  ArtworkResponse,
} from '@/src/modules/artworks/dtos/artwork-response.dto';
import { CreateArtworkDto } from '@/src/modules/artworks/dtos/create-artwork.dto';
import { GetArtworksQueryDto } from '@/src/modules/artworks/dtos/get-artworks-query.dto';
import { ImageFileType } from '@/src/modules/artworks/enums/file-type.enum';
import {
  UploadImageErrorCode,
  UploadImageException,
} from '@/src/modules/artworks/exceptions/upload-image.exception';
import { UploadImageExceptionFilter } from '@/src/modules/artworks/filters/upload-image.filter';
import { OptionalBearerAuthGuard } from '@/src/modules/auth/guards/token.auth.guard';
import { AdminUser } from '@/src/modules/auth/interfaces/admin-user.interface';
import { StorageService } from '@/src/modules/storage/storage.service';

export const MAX_IMAGE_SIZE = 100 * 1024 * 1024; // 100MB

@Controller('artworks')
export class ArtworksController {
  constructor(
    private readonly artworksService: ArtworksService,
    private readonly storageService: StorageService,
  ) {}

  private static UPLOAD_OPTIONS = {
    limits: {
      fileSize: MAX_IMAGE_SIZE,
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
            `,
            {
              supportedTypes: allowed_types,
            },
          ),
          false,
        );
      }

      callback(null, true);
    },
  };

  @Get()
  @UseGuards(OptionalBearerAuthGuard)
  async getArtworks(
    @Query() query: GetArtworksQueryDto,
    @Req() request: Request & { user?: AdminUser },
  ) {
    const isAuthenticated = !!request.user;

    const pageSize = isAuthenticated ? PAGE_SIZE.CMS : PAGE_SIZE.PUBLIC;

    const result = await this.artworksService.getArtworks(
      query,
      isAuthenticated,
    );

    return new ArtworkListResponse(
      this.storageService,
      result.items,
      result.totalCount,
      query.page ?? 1,
      pageSize,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createArtworkDto: CreateArtworkDto,
  ): Promise<ArtworkResponse> {
    const artwork = await this.artworksService.createArtwork(createArtworkDto);
    return new ArtworkResponse(this.storageService, artwork);
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
