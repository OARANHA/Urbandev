import client from './client'

// customer
const getAllCustomers = () => client.get(`/customers`)
const getCustomer = (id) => client.get(`/customers/${id}`)
const createCustomer = (body) => client.post(`/customers`, body)
const updateCustomer = (id, body) => client.put(`/customers/${id}`, body)
const deleteCustomer = (id) => client.delete(`/customers/${id}`)
const getCustomerDetails = (id) => client.get(`/customers/${id}/details`)
const getCustomerStats = () => client.get(`/customers/stats`)

export default {
    getAllCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerDetails,
    getCustomerStats
}