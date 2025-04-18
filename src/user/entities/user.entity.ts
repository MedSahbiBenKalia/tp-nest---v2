import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Cv } from "../../cv/entities/cv.entity";
import { Role } from "../../enums/role.enum";

@Entity("user")
export class User {
    @Column({ type: "int", primary: true, generated: true })

    id: number;

    @Column( {unique: true, nullable: false })
    
    username: string;

    @Column({ unique : true ,nullable: false })
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column({ nullable: true })
    salt: string;

    @Column({ type: "enum", enum: Role, array: true, default: [Role.USER] })
    role : Role[];
    
    @OneToMany(() => Cv, (cv) => cv.user , { cascade: true })
    Cvs : Cv[]
}
