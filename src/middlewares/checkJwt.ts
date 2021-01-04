import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import config from '../config/config';

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
    // Get the jwt token from the head
    const token = <string>req.headers['auth'];

    let jwtPayload;

    // Try to validate the token and get data
    try {
        jwtPayload = <any>jwt.verify(token, config.jwtSecret);
        res.locals.jwtPayload = jwtPayload;
    } catch(error) {
        // If token is not valid, respond with a status 401
        res.status(401).send();
        return;
    }

    // The token expiration is 1 hour
    // Send a new token on  every request
    const { userId, username } = jwtPayload;
    const newToken = jwt.sign({ userId, username }, config.jwtSecret, {
        expiresIn: '1h'
    });

    res.setHeader('token', newToken);

    next();
};