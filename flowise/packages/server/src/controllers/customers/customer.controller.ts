import { Request, Response } from 'express'
import { AppDataSource } from '@/database/dataSource'
import { Customer } from '@/database/entities/Customer'

export const getAllCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await AppDataSource.getRepository(Customer).find({
            order: {
                createdAt: 'DESC'
            }
        })
        
        res.json(customers)
    } catch (error) {
        console.error('Error fetching customers:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const getCustomer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        
        const customer = await AppDataSource.getRepository(Customer).findOne({ 
            where: { id } 
        })
        
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' })
        }
        
        res.json(customer)
    } catch (error) {
        console.error('Error fetching customer:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const getCustomerDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        
        const customer = await AppDataSource.getRepository(Customer).findOne({ 
            where: { id } 
        })
        
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' })
        }
        
        // Return detailed customer information
        res.json({
            ...customer,
            // Additional calculated fields
            totalSpent: (customer.monthlyRevenue || 0) * 12,
            averageProjectValue: customer.projectsCount > 0 ? (customer.monthlyRevenue || 0) / customer.projectsCount : 0,
            lastActivity: customer.lastLogin || customer.createdAt
        })
    } catch (error) {
        console.error('Error fetching customer details:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const getCustomerStats = async (req: Request, res: Response) => {
    try {
        const customerRepository = AppDataSource.getRepository(Customer)
        
        const totalCustomers = await customerRepository.count()
        const activeCustomers = await customerRepository.count({ 
            where: { status: 'active' } 
        })
        
        const revenueResult = await customerRepository
            .createQueryBuilder('customer')
            .select('SUM(customer.monthlyRevenue)', 'totalRevenue')
            .where('customer.status = :status', { status: 'active' })
            .getRawOne()
        
        const monthlyRevenue = parseFloat(revenueResult.totalRevenue) || 0
        
        // Get customers created this month
        const currentDate = new Date()
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const newCustomersThisMonth = await customerRepository.count({
            where: {
                createdAt: { $gte: firstDayOfMonth }
            }
        })
        
        const stats = {
            totalCustomers,
            activeCustomers,
            monthlyRevenue,
            newCustomersThisMonth
        }
        
        res.json(stats)
    } catch (error) {
        console.error('Error fetching customer stats:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const createCustomer = async (req: Request, res: Response) => {
    try {
        const customerData = req.body
        
        // Check if customer with same email already exists
        const existingCustomer = await AppDataSource.getRepository(Customer).findOne({
            where: { email: customerData.email }
        })
        
        if (existingCustomer) {
            return res.status(400).json({ message: 'Customer with this email already exists' })
        }
        
        const newCustomer = AppDataSource.getRepository(Customer).create(customerData)
        await AppDataSource.getRepository(Customer).save(newCustomer)
        
        res.status(201).json(newCustomer)
    } catch (error) {
        console.error('Error creating customer:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const updateData = req.body
        
        // Check if email is being updated and if it already exists
        if (updateData.email) {
            const existingCustomer = await AppDataSource.getRepository(Customer).findOne({
                where: { 
                    email: updateData.email,
                    id: { $ne: id }
                }
            })
            
            if (existingCustomer) {
                return res.status(400).json({ message: 'Customer with this email already exists' })
            }
        }
        
        await AppDataSource.getRepository(Customer).update(id, updateData)
        
        const updatedCustomer = await AppDataSource.getRepository(Customer).findOne({ 
            where: { id } 
        })
        
        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' })
        }
        
        res.json(updatedCustomer)
    } catch (error) {
        console.error('Error updating customer:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        
        const customer = await AppDataSource.getRepository(Customer).findOne({ 
            where: { id } 
        })
        
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' })
        }
        
        await AppDataSource.getRepository(Customer).delete(id)
        
        res.json({ message: 'Customer deleted successfully' })
    } catch (error) {
        console.error('Error deleting customer:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}