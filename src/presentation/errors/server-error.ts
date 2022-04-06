export class ServerError extends Error {
    constructor() {
        super('Interal Server Error')
        this.name = 'ServerError'
    }
}