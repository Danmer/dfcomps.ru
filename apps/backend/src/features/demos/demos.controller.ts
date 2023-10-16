import { Controller, UploadedFile, Headers, UseInterceptors, Post, ParseFilePipe } from '@nestjs/common';
import { DemosService } from './demos.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadDemoResponseInterface } from '@dfcomps/contracts';
import { DemoParser } from './demo-parser';

@Controller('demos')
export class DemosController {
  constructor(private readonly demosService: DemosService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  updateProfileAvatar(
    @Headers('X-Auth') accessToken: string,
    @UploadedFile(new ParseFilePipe())
    demo: Express.Multer.File,
  ): Promise<UploadDemoResponseInterface> {
    return this.demosService.upload(accessToken, demo);
  }

  @Post('test')
  test(): any {
    return new DemoParser().parseDemo(
      process.env.DFCOMPS_FILE_UPLOAD_PATH + '\\demos\\by_gvn5-[df.cpm]00.00.168(Nosf.Russia).dm_68',
    );
  }
}
