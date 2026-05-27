import { Module } from '@nestjs/common';
import { PaginationModule } from '../common/pagination/pagination.module';
import { PrismaService } from '../prisma/prisma.service';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';

@Module({
  imports: [PaginationModule],
  controllers: [BrandsController],
  providers: [BrandsService, PrismaService],
  exports: [BrandsService],
})
export class BrandsModule {}
