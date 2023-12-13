export default class HeroClient {
  async getIsland() {
    return {
      id: 1,
      name: "Второй сезон",
    };
  }
  async getNodes() {
    return {
      items: [],
      totalCount: 0,
    };
  }
}
