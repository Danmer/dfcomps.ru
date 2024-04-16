import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  ParseFilePipe,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AdminCupsService } from './admin-cups.service';
import {
  AddOfflineCupDto,
  AdminActiveCupInterface,
  AdminActiveMulticupInterface,
  AdminCupInterface,
  AdminEditCupInterface,
  AdminValidationInterface,
  CupTypes,
  NewsTypes,
  OnlineCupActionDto,
  OnlineCupServersPlayersInterface,
  ProcessValidationDto,
  SetPlayerServerDto,
  UpdateOfflineCupDto,
  UploadedFileLinkInterface,
  WorldspawnMapInfoInterface,
} from '@dfcomps/contracts';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterFileInterface } from 'apps/backend/src/shared/interfaces/multer.interface';
import { EnumValidationPipe } from 'apps/backend/src/shared/validation/enum-validation.pipe';

@Controller('admin/cups')
export class AdminCupsController {
  constructor(private readonly adminCupsService: AdminCupsService) {}

  @Get('get-all-cups')
  getAllCups(@Headers('X-Auth') accessToken: string | undefined): Promise<AdminCupInterface[]> {
    return this.adminCupsService.getAllCups(accessToken);
  }

  @Get('get/:cupId')
  getSingleCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<AdminEditCupInterface> {
    return this.adminCupsService.getSingleCup(accessToken, cupId);
  }

  @Post('delete/:cupId')
  deleteCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<void> {
    return this.adminCupsService.deleteCup(accessToken, cupId);
  }

  @Post('add-offline-cup')
  addOfflineCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() addOfflineCupDto: AddOfflineCupDto,
  ): Promise<void> {
    return this.adminCupsService.addOfflineCup(accessToken, addOfflineCupDto);
  }

  @Post('update-offline-cup/:cupId')
  updateOfflineCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() updateOfflineCupDto: UpdateOfflineCupDto,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<void> {
    return this.adminCupsService.updateOfflineCup(accessToken, updateOfflineCupDto, cupId);
  }

  @Get('get-validation-demos/:cupId')
  getValidationDemos(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<AdminValidationInterface> {
    return this.adminCupsService.getValidationDemos(accessToken, cupId);
  }

  @Post('process-validation/:cupId')
  processValidate(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() processValidationDto: ProcessValidationDto,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<void> {
    return this.adminCupsService.processValidation(accessToken, processValidationDto, cupId);
  }

  @Post('calculate-rating/:cupId')
  calculateRating(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<void> {
    return this.adminCupsService.calculateRating(accessToken, cupId);
  }

  @Post('finish-offline-cup/:cupId')
  finishOfflineCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<void> {
    return this.adminCupsService.finishOfflineCup(accessToken, cupId);
  }

  @Post('add-online-cup')
  addOnlineCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() addOnlineCupDto: OnlineCupActionDto,
  ): Promise<void> {
    return this.adminCupsService.addOnlineCup(accessToken, addOnlineCupDto);
  }

  @Post('update-online-cup/:cupId')
  updateOnlineCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() updateOnlineCupDto: OnlineCupActionDto,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<void> {
    return this.adminCupsService.updateOnlineCup(accessToken, updateOnlineCupDto, cupId);
  }

  @Get('get-worldspawn-map-info')
  getWorldspawnMapInfo(
    @Headers('X-Auth') accessToken: string | undefined,
    @Query() { map }: Record<string, string>,
  ): Promise<WorldspawnMapInfoInterface> {
    return this.adminCupsService.getWorldspawnMapInfo(accessToken, map);
  }

  @Post('upload-map/:mapName')
  @UseInterceptors(FileInterceptor('file'))
  uploadMap(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('mapName') mapName: string,
    @UploadedFile(new ParseFilePipe()) map: MulterFileInterface,
  ): Promise<UploadedFileLinkInterface> {
    return this.adminCupsService.uploadMap(accessToken, map, mapName);
  }

  @Post('upload-levelshot/:mapName')
  @UseInterceptors(FileInterceptor('file'))
  uploadLevelshot(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('mapName') mapName: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /jpg|jpeg/,
        })
        .addMaxSizeValidator({
          maxSize: 5000000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    levelshot: MulterFileInterface,
  ): Promise<UploadedFileLinkInterface> {
    return this.adminCupsService.uploadLevelshot(accessToken, levelshot, mapName);
  }

  @Get('get-all-cups-without-news/:cupType/:newsType')
  getAllOfflineCupsWithoutNews(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupType', new EnumValidationPipe(CupTypes)) cupType: CupTypes,
    @Param('newsType', new EnumValidationPipe(NewsTypes)) newsType: NewsTypes,
  ): Promise<AdminActiveCupInterface[]> {
    return this.adminCupsService.getAllCupsWithoutNews(accessToken, cupType, newsType);
  }

  @Get('get-all-active-multicups')
  getAllActiveMulticups(@Headers('X-Auth') accessToken: string | undefined): Promise<AdminActiveMulticupInterface[]> {
    return this.adminCupsService.getAllActiveMulticups(accessToken);
  }

  @Get('get-online-cup-servers-players/:cupId')
  getOnlineCupServersPlayers(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<OnlineCupServersPlayersInterface> {
    return this.adminCupsService.getOnlineCupServersPlayers(accessToken, cupId);
  }

  @Post('set-player-server')
  setPlayerServer(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() { userId, onlineCupId, serverNumber }: SetPlayerServerDto,
  ): Promise<void> {
    return this.adminCupsService.setPlayerServer(accessToken, userId, onlineCupId, serverNumber);
  }
}
