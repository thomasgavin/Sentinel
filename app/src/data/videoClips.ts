import { SentinelEvent } from '../types';

// YouTube video IDs sourced from real security camera sample footage playlist
// https://youtube.com/playlist?list=PL0XD3NW_xyMaZ6Djo5VriUJiKLORF4rc9

interface Clip { id: string; label: string }

const POOL: Record<string, Clip[]> = {
  front_day: [
    { id: 'JUfIpZCYquY', label: 'Vivint Doorbell Pro · Front Door · Daytime' },
    { id: 'NtuKgCMqssY', label: 'Swann Wi-Fi · Front Porch · Daytime' },
    { id: 'vh41RF3ukeg', label: 'Reolink Argus 2E · Front Porch · Daytime' },
    { id: 'rqfMuInKHd0', label: 'Reolink Argus 3 Pro · Front Porch · Daytime' },
    { id: 'nIgoN8GxJ2c', label: 'Blink Outdoor · Front Porch · Daytime' },
  ],
  front_night: [
    { id: 'xjQzg1QAlXs', label: 'Amcrest HD Bullet · Front Porch · Night Vision' },
    { id: 'IuzHfCZWlAE', label: 'Reolink Argus Eco · Front Porch · Night Vision' },
    { id: 'WAIwZI-X7m4', label: 'Wyze Cam v3 · Front Porch · Nighttime' },
    { id: 'VQqtS995yYo', label: 'Reolink E1 Outdoor · Front Porch · Nighttime' },
  ],
  front_delivery: [
    { id: '2bM9e9FLr_g', label: 'Vivint Doorbell Pro · Front Door · Delivery' },
    { id: 'xl5buxCZbdU', label: 'Reolink Argus 2 · Front Porch · Delivery' },
    { id: 'JOKBzzpoWnU', label: 'Reolink Argus Eco · Front Porch · Flyer/Visitor' },
  ],
  front_alert: [
    { id: 'JdU_xmAkbMo', label: 'Reolink Argus Eco · Front Porch · Night Siren' },
    { id: 'WAIwZI-X7m4', label: 'Wyze Cam v3 · Front Porch · Nighttime' },
    { id: 'VQqtS995yYo', label: 'Reolink E1 · Front Porch · Night Alert' },
    { id: 'xjQzg1QAlXs', label: 'Amcrest HD · Front Porch · Night Detection' },
  ],
  driveway_day: [
    { id: 'za5-YIGwJpA', label: 'Vivint Outdoor Pro · Driveway · Arrival' },
    { id: 'yWFv9eA72LA', label: 'Vivint Outdoor Pro · Driveway · Delivery' },
    { id: 'UKdizJDfktk', label: 'Ring Spotlight Battery · Driveway · Daytime' },
    { id: '_FrKk0g0Sdc', label: 'Wyze Cam v3 · Outdoor · Daytime' },
  ],
  driveway_night: [
    { id: 'pWQ_WQDs-qA', label: 'SimpliSafe Outdoor · Driveway/Garage · Nighttime' },
    { id: 'WAIwZI-X7m4', label: 'Wyze Cam v3 · Outdoor · Nighttime' },
  ],
  backyard: [
    { id: 'NVpa0bo3Jz4', label: 'Arlo Pro 4 · Backyard · Testing' },
    { id: '_FrKk0g0Sdc', label: 'Wyze Cam v3 · Backyard · Daytime' },
    { id: 'VQqtS995yYo', label: 'Reolink E1 · Backyard · Nighttime' },
    { id: 'pWQ_WQDs-qA', label: 'SimpliSafe · Backyard · Nighttime' },
  ],
  indoor: [
    { id: 'Ixjy2jDj6tg', label: 'Vivint Ping · Indoor · Living Room' },
    { id: 'J4UGKbzDzoI', label: 'Canary Flex · Indoor · Living Room' },
    { id: 'ZP7FJ_UcQ8U', label: 'Swann Wi-Fi · Indoor · Stairway' },
    { id: 'FRg2Mn8y6UE', label: 'Abode Cam 2 · Indoor · Entryway' },
    { id: 'zwk1nxINAlg', label: 'Wyze Cam v3 · Indoor · Daytime' },
    { id: '6gXKJ-FLbXQ', label: 'Reolink Argus 2E · Indoor · Daytime' },
    { id: 'fDdS-e6uTDo', label: 'Blink Mini · Foyer/Stairway · Daytime' },
  ],
};

function pick(pool: Clip[], seed: string): Clip {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return pool[h % pool.length];
}

function isNighttime(time: Date): boolean {
  const h = time.getHours();
  return h >= 20 || h < 6;
}

export function getClipForEvent(event: SentinelEvent): Clip {
  const cam = event.camera.toLowerCase();
  const night = isNighttime(event.time);

  if (cam.includes('front') || cam.includes('door')) {
    if (event.type === 'package_delivery') return pick(POOL.front_delivery, event.id);
    if (event.type === 'threat' || event.type === 'unknown_person') return pick(POOL.front_alert, event.id);
    return pick(night ? POOL.front_night : POOL.front_day, event.id);
  }
  if (cam.includes('driveway') || cam.includes('garage')) {
    return pick(night ? POOL.driveway_night : POOL.driveway_day, event.id);
  }
  if (cam.includes('back') || cam.includes('yard')) {
    return pick(POOL.backyard, event.id);
  }
  return pick(POOL.indoor, event.id);
}

export const thumbnailUrl = (videoId: string) =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

export const watchUrl = (videoId: string) =>
  `https://www.youtube.com/watch?v=${videoId}`;
