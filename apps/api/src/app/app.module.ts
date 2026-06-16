import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SuccessResponseInterceptor } from './common/interceptors/success-response.interceptor';

import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { ProductsModule } from './products/products.module';
import { AttributesModule } from './attributes/attributes.module';
import { VariantsModule } from './variants/variants.module';

@Module({
  imports: [
    PrismaModule, 
    CategoriesModule,
    BrandsModule,     
    ProductsModule,
    AttributesModule,
    VariantsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: SuccessResponseInterceptor,
    },
  ],
})
export class AppModule {}