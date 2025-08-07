import { IslandApi } from './IslandApi'
import { ItemApi } from './ItemApi'
import { NodeApi } from './NodeApi'
import { FeedbackApi } from './FeedbackApi'
import { NewsApi } from './NewsApi'
import { NotificationApi } from './NotificationApi'

export default class HeroClient {
  feedback: FeedbackApi

  island: IslandApi

  item: ItemApi

  node: NodeApi

  news: NewsApi

  notification: NotificationApi

  constructor() {
    this.feedback = new FeedbackApi()
    this.island = new IslandApi()
    this.item = new ItemApi()
    this.node = new NodeApi()
    this.news = new NewsApi()
    this.notification = new NotificationApi()
  }
}
