import { Module } from '@nestjs/common';
import { PaginationModule } from '../common/pagination/pagination.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { VariantsController } from './variants.controller.js';
import { VariantsService } from './variants.service.js';

@Module({
  imports: [PaginationModule],
  controllers: [VariantsController],
  providers: [VariantsService, PrismaService],
  exports: [VariantsService],
})
export class VariantsModule {}
