import Island from "./Island";
import Item from "./Item";
import Node from "./Node";
import Feedback from "./Feedback";

export default class HeroClient {
  /** @var {Feedback} */
  feedback;

  /** @var {Island} */
  island;

  /** @var {Item} */
  item;

  /** @var {Node} */
  node;

  constructor() {
    this.feedback = new Feedback();
    this.island = new Island();
    this.item = new Item();
    this.node = new Node();
  }
}
