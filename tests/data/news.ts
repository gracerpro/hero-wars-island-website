import type { ApiList } from '@/api/common'
import type { OneNews } from '@/api/NewsApi'

export const responseNews: ApiList<OneNews> = {
  items: [
    {
      id: 1,
      slug: 'one',
      createdAt: new Date('2024-01-01 00:00:01'),
      updatedAt: new Date('2024-01-01 00:00:01'),
      name: 'One',
      snippet: '<p>One</p>',
    },
    {
      id: 2,
      slug: 'two',
      createdAt: new Date('2024-01-02 00:00:02'),
      updatedAt: new Date('2024-01-02 00:00:02'),
      name: 'Two',
      snippet: '<p>Two</p>',
    },
    {
      id: 3,
      slug: 'three',
      createdAt: new Date('2024-01-03 00:00:03'),
      updatedAt: new Date('2024-01-03 00:00:03'),
      name: 'Three',
      snippet: '<p>Three</p>',
    },
  ],
  totalCount: 3,
} as const
