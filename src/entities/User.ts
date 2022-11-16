import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  first_name!: string;

  @Column()
  last_name!: string;

  @Column({
    unique: true,
  })
  email!: string;

  @Column()
  phone_number!: string;

  @Column()
  password!: string;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt!: Date;

  @Column({
    default: false,
    name: "is_admin",
  })
  isAdmin!: boolean;

  @Column({
    type: "text",
    nullable: true,
  })
  refreshToken!: string;
}
