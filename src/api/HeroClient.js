import { Island } from "./Island";
import { Item } from "./Item";
import { Node } from "./Node";
import { Feedback } from "./Feedback";
import { News } from "./News";
import { Notification } from "./NotificationApi";

export default class HeroClient {
  /** @var {Feedback} */
  feedback;

  /** @var {Island} */
  island;

  /** @var {Item} */
  item;

  /** @var {Node} */
  node;

  /** @var {News} */
  news;

  /** @var {Notification} */
  notification;

  constructor() {
    this.feedback = new Feedback();
    this.island = new Island();
    this.item = new Item();
    this.node = new Node();
    this.news = new News();
    this.notification = new Notification();
  }
}
