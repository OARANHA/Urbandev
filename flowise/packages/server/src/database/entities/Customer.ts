import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', length: 255, nullable: false })
    name: string

    @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
    email: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    company: string

    @Column({ type: 'varchar', length: 50, nullable: true })
    phone: string

    @Column({ type: 'varchar', length: 500, nullable: true })
    website: string

    @Column({ type: 'varchar', length: 100, nullable: true })
    industry: string

    @Column({ type: 'varchar', length: 50, nullable: true })
    companySize: string

    @Column({
        type: 'varchar',
        length: 20,
        default: 'basic',
        enum: ['basic', 'professional', 'enterprise']
    })
    subscriptionPlan: string

    @Column({
        type: 'varchar',
        length: 20,
        default: 'active',
        enum: ['active', 'inactive', 'pending']
    })
    status: string

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, nullable: true })
    monthlyRevenue: number

    @Column({ type: 'int', default: 0, nullable: true })
    projectsCount: number

    @Column({ type: 'datetime', nullable: true })
    lastLogin: Date

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}