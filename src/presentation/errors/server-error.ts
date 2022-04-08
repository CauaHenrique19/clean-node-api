export class ServerError extends Error {
    constructor(stack: string) {
        super('Interal Server Error')
        this.stack = stack
        this.name = 'ServerError'
    }
}