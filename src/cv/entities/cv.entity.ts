import { Skill } from "../../skill/entities/skill.entity";
import { User } from "../../user/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";

@Entity("cv")
export class Cv {
    @Column({ type: "int", primary: true, generated: true })
    id: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    firstname: string;

    @Column({ nullable: false })
    email: string;

    @Column({ nullable: false , type: "int" })
    age : number;

    @Column({ nullable: false , type: "int" })
    Cin : number;

    @Column({ nullable: false })
    job: string;

    @Column({ nullable: true })
    imagePath : string;
    
    @ManyToOne(() => User, (user) => user.Cvs )
    user: User; 

    
    @ManyToMany(() => Skill, (skill) => skill.cvs ,{ cascade: true })
    @JoinTable()
    skills: Skill[]; 
   }
