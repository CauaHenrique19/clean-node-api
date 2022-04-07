import { Request, Response, NextFunction } from 'express'

export const cors = (request: Request, response: Response, next: NextFunction): void => {
    response.setHeader('access-control-alllow-origin', '*')
    response.setHeader('access-control-alllow-headers', '*')
    response.setHeader('access-control-alllow-methods', '*')
    next()
}