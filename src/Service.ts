export class Service<C = any> {
    context: C;
    constructor(context: C) {
        this.context = context;
    }
}
