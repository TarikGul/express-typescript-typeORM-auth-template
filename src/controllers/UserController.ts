import { validate } from "class-validator";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import {User} from "../entity/User";

export class UserController {

    static listAll = async (req: Request, res: Response) => {
        // Get Users from DB
        const userRepository = getRepository(User);
        const users = await userRepository.find({
            select: ['id', 'username', 'role']
        });

        // Send the users object
        res.send(users);
    };

    static getOneById = async (req: Request, res: Response) => {
        // Get the ID from url
        const id: number = req.params.id;

        // Get the user from database
        const userRepository = getRepository(User);
        try {
            const user = await userRepository.findOneOrFail(id, {
                select: ['id', 'username', 'role']
            });

            res.send(user);
        } catch (error) {
            res.status(404).send('User not found');
        }
    };

    static newUser = async (req: Request, res: Response) => {
        // Get params from the body
        let { username, password, role } = req.body;
        let user = new User();
        user.username = username;
        user.password = password;
        user.role = role;

        // Validate the params
        const errors = await validate(user);
        if (errors.length > 0) {
            res.status(400).send(errors);
            return;
        }

        // Hash the password
        user.hashPassword();

        // Save to DB, If fails, username is taken
        const userRepository = getRepository(User);
        try {
            await userRepository.save(user);
        } catch(error) {
            res.status(409).send('Username already in use');
            return;
        }

        // If all ok, send 201 response
        res.status(201).send('User succesfully created');
    };

    static editUser = async (req: Request, res: Response) => {

        const id = req.params.id;

        const { username, role } = req.body;

        const userRepository = getRepository(User);
        let user;

        try {
            user = await userRepository.findOneOrFail(id);
        } catch (error) {
            res.status(404).send('User not found');
            return;
        }

        // Validate the new values on model
        user.username = username;
        user.role = role;

        const errors = await validate(user);
        if (errors.length > 0) {
            res.status(400).send(errors);
            return;
        }
        
        // Save user
        try {
            await userRepository.save(user);
        } catch (error) {
            res.status(409).send('Username already in use');
            return;
        }

        // Accepted response
        res.status(204).send();
    };

    static deleteUser = async (req: Request, res: Response) => {

        const id = req.params.id;

        const userRepository = getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail(id);
        } catch (error) {
            res.status(404).send('User not found');
            return;
        }
        userRepository.delete(id);

        res.status(204).send()
    };
}

export default UserController;