export class ApiList<T> {
    readonly items: Array<T> = []
    readonly totalCount: number = 0

    constructor(items: Array<T>, totalCount: number) {
        this.items = items
        this.totalCount = totalCount
    }
}
