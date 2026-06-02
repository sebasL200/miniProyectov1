import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SuccessResponseInterceptor } from './common/interceptors/success-response.interceptor';

import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { ProductsModule } from './products/products.module';
// import { AttributesModule } from './attributes/attributes.module'; // Frozen – entrega incremental
// import { VariantsModule } from './variants/variants.module'; // Frozen – entrega incremental

@Module({
  imports: [
    PrismaModule, 
    CategoriesModule,
    BrandsModule,     
    ProductsModule,
    // AttributesModule, // Frozen – entrega incremental
    // VariantsModule,  // Frozen – entrega incremental
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