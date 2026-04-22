import { SentinelEvent } from '../types';

// require() calls must be static — Metro bundler resolves at build time
const ASSETS = {
  household_movement:  require('../../assets/videos/household member movement.mp4'),
  package_day_1:       require('../../assets/videos/Package day 1.mp4'),
  package_day_2:       require('../../assets/videos/Package day 2.mp4'),
  package_day_3:       require('../../assets/videos/Package day 3.mp4'),
  package_day_4:       require('../../assets/videos/package delivery 4.mp4'),
  package_day_5:       require('../../assets/videos/package delivery 5.mp4'),
  package_night_1:     require('../../assets/videos/Package night 1.mp4'),
  unknown_1:           require('../../assets/videos/Unknown(1).mp4'),
  live_feed_1:         require('../../assets/videos/Sample live feed.mp4'),
  live_feed_2:         require('../../assets/videos/Live feed sample 2.mp4'),
  live_feed_3:         require('../../assets/videos/sample live feed 3.mp4'),
};

type AssetSource = ReturnType<typeof require>;

const POOL: Record<string, AssetSource[]> = {
  family:   [ASSETS.household_movement],
  package_day:   [ASSETS.package_day_1, ASSETS.package_day_2, ASSETS.package_day_3, ASSETS.package_day_4, ASSETS.package_day_5],
  package_night: [ASSETS.package_night_1],
  unknown:  [ASSETS.unknown_1],
  motion:   [ASSETS.live_feed_1, ASSETS.live_feed_2, ASSETS.live_feed_3],
  threat:   [ASSETS.unknown_1, ASSETS.live_feed_1],
  default:  [ASSETS.live_feed_1, ASSETS.live_feed_2, ASSETS.live_feed_3],
};

function pick(pool: AssetSource[], seed: string): AssetSource {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return pool[h % pool.length];
}

export function getVideoForEvent(event: SentinelEvent): AssetSource {
  const night = event.time.getHours() >= 20 || event.time.getHours() < 6;
  switch (event.type) {
    case 'family_arrival':
    case 'family_departure':
      return ASSETS.household_movement;
    case 'package_delivery':
      return pick(night ? POOL.package_night : POOL.package_day, event.id);
    case 'unknown_person':
      return pick(POOL.unknown, event.id);
    case 'motion_resolved':
      return pick(POOL.motion, event.id);
    case 'threat':
      return pick(POOL.threat, event.id);
    default:
      return pick(POOL.default, event.id);
  }
}
