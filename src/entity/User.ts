import {
    Entity, 
    PrimaryGeneratedColumn, 
    Column,
    Unique,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";
import { Length, IsNotEmpty } from 'class-validator';
import * as bcrypt from 'bcryptjs';

@Entity()
@Unique(['username'])
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Length(6, 20)
    username: string;

    @Column()
    @Length(8, 100)
    password: string;

    @Column()
    @IsNotEmpty()
    role: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    @UpdateDateColumn()
    updatedAt: Date;

    hashPassword() {
        this.password = bcrypt.hashSync(this.password, 16);
    }

    isPassword(password: string) {
        return bcrypt.compareSync(password, this.password);
    }
}
