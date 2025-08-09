import type { ApiList } from '@/api/common'
import type { Island } from '@/api/IslandApi'

export const responseIslands: ApiList<Island> = {
  items: [
    {
      id: 1,
      name: 'First island',
      eventStartAt: new Date('2000-01-01 01:00:00'),
      eventEndAt: new Date('2000-02-01 12:00:00'),
      nodesLastUpdatedAt: new Date('2000-01-15 00:00:00'),
      initMap: {
        scale: 0,
        offsetX: 0,
        offsetY: 0,
      },
      syncGameVersion: null,
      syncAt: null,
      backgroundImage: null,
      regions: [],
    },
    {
      id: 2,
      name: 'Second island',
      eventStartAt: new Date('2000-02-01 01:00:00'),
      eventEndAt: new Date('2000-03-01 12:00:00'),
      nodesLastUpdatedAt: new Date('2000-02-15 00:00:00'),
      initMap: {
        scale: 0,
        offsetX: 0,
        offsetY: 0,
      },
      syncGameVersion: null,
      syncAt: null,
      backgroundImage: null,
      regions: [],
    },
    {
      id: 3,
      name: 'Third island',
      eventStartAt: new Date('2000-03-01 01:00:00'),
      eventEndAt: new Date('2000-04-01 12:00:00'),
      nodesLastUpdatedAt: new Date('2000-03-15 00:00:00'),
      initMap: {
        scale: 0,
        offsetX: 0,
        offsetY: 0,
      },
      syncGameVersion: null,
      syncAt: null,
      backgroundImage: null,
      regions: [],
    },
  ],
  totalCount: 3,
} as const
