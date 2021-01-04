import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { validate } from 'class-validator';

import { User } from '../entity/User';
import config from '../config/config';

class AuthController {

    static login = async (req: Request, res: Response) => {
        // Verify if username and password are set
        let { username, password } = req.body;
        if(!(username && password)) {
            res.status(400).send();
        }

        // Get user from database
        const userRepository = getRepository(User);
        let user: User;

        try {
            user = await userRepository.findOneOrFail({ where: { username } });
        } catch (error) {
            res.status(401).send();
        }

        // Check bcrypt hash match
        if (!user.isPassword(password)) {
            res.status(401).send();
            return;
        }

        // Sign JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            config.jwtSecret,
            { expiresIn: '1h' }
        );

        // Send JWT token in response
        res.send(token);
    }

    static changePassword = async (req: Request, res: Response) => {
        // Get ID from JWT
        const id = res.locals.jwtParload.userId;

        // Get parameters from the body
        const { oldPassword, newPassword } = req.body;
        if (!(oldPassword && newPassword)) {
            res.status(400).send();
        }

        // Get user from DB
        const userRepository = getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail(id)
        } catch (id) {
            res.status(401).send();
        }

        // Check if old password hash matchs
        if (!user.isPassword(oldPassword)) {
            res.status(401).send();
            return;
        }

        // Validate model implicitly will validate new password
        user.password = newPassword;
        const errors = await validate(user);
        if (errors.length > 0) {
            res.status(400).send(errors);
            return;
        }

        // Hash the new password and save

        user.hashPassword();
        userRepository.save(user);

        res.status(204).send();
    }
}

export default AuthController;