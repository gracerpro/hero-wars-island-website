import { IslandApi } from "./IslandApi";
import { Item } from "./Item";
import { Node } from "./Node";
import { FeedbackApi } from "./FeedbackApi";
import { News } from "./News";
import { NotificationApi } from "./NotificationApi";

export default class HeroClient {
  feedback: FeedbackApi;

  island: IslandApi;

  /** @var {Item} */
  item;

  /** @var {Node} */
  node;

  /** @var {News} */
  news;

  /** @var {Notification} */
  notification;

  constructor() {
    this.feedback = new FeedbackApi();
    this.island = new IslandApi();
    this.item = new Item();
    this.node = new Node();
    this.news = new News();
    this.notification = new NotificationApi();
  }
}
