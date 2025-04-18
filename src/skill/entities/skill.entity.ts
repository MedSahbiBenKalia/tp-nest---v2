import { Column, Entity, ManyToMany } from "typeorm";
import { Cv } from "../../cv/entities/cv.entity";

@Entity("skill")
export class Skill {
    @Column({ type: "int", primary: true, generated: true })
    id: number;

    @Column({ nullable: false })
    designation: string;

    @ManyToMany(() => Cv, (cv) => cv.skills)
    cvs: Cv[];
}
