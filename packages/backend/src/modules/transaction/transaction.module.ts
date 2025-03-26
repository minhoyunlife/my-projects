import { Global, Module } from '@nestjs/common';

import { TransactionService } from '@/src/modules/transaction/transaction.service';

@Global()
@Module({
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
