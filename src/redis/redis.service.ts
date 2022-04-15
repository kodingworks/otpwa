import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get(key: string) {
    return await this.cacheManager.get(key)
  }

  async set(key: string, value: object, ttl = 300) {
    await this.cacheManager.set(key, value, ttl)
  }

  async del(key: any) {
    await this.cacheManager.del(key)
  }

  async reset() {
    await this.cacheManager.reset()
  }
}
