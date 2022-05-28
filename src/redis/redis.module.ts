import { CacheModule, Module } from '@nestjs/common'
import * as redisStore from 'cache-manager-redis-store'
import { RedisService } from './redis.service'

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: () => {
        return {
          store: redisStore,
          // host: process.env.REDIS_HOST,
          host: 'redis-server',
          port: process.env.REDIS_PORT,
          ttl: Number(process.env.REDIS_TTL || 300) // set default 600 seconds
        }
      }
    })
  ],
  providers: [RedisService],
  exports: [RedisModule, RedisService]
})
export class RedisModule {}
