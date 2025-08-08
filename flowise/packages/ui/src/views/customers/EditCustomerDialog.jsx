import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

// material-ui
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Box,
    CircularProgress,
    Switch,
    FormControlLabel,
    Typography
} from '@mui/material'

// project imports
import { StyledButton } from '@/ui-component/button/StyledButton'
import customerApi from '@/api/customer'

// Icons
import { IconX, IconCheck } from '@tabler/icons-react'

// ==============================|| EDIT CUSTOMER DIALOG ||============================== //

const EditCustomerDialog = ({ show, dialogProps, onCancel, onConfirm }) => {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        phone: '',
        website: '',
        industry: '',
        companySize: '',
        subscriptionPlan: 'basic',
        status: 'active',
        monthlyRevenue: 0,
        projectsCount: 0
    })

    const industries = [
        'Technology',
        'Healthcare',
        'Finance',
        'Education',
        'Retail',
        'Manufacturing',
        'Consulting',
        'Real Estate',
        'Other'
    ]

    const companySizes = [
        '1-10 employees',
        '11-50 employees',
        '51-200 employees',
        '201-1000 employees',
        '1000+ employees'
    ]

    const subscriptionPlans = [
        { value: 'basic', label: 'Basic' },
        { value: 'professional', label: 'Professional' },
        { value: 'enterprise', label: 'Enterprise' }
    ]

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' }
    ]

    useEffect(() => {
        if (dialogProps.data) {
            setFormData({
                name: dialogProps.data.name || '',
                email: dialogProps.data.email || '',
                company: dialogProps.data.company || '',
                phone: dialogProps.data.phone || '',
                website: dialogProps.data.website || '',
                industry: dialogProps.data.industry || '',
                companySize: dialogProps.data.companySize || '',
                subscriptionPlan: dialogProps.data.subscriptionPlan || 'basic',
                status: dialogProps.data.status || 'active',
                monthlyRevenue: dialogProps.data.monthlyRevenue || 0,
                projectsCount: dialogProps.data.projectsCount || 0
            })
        } else {
            setFormData({
                name: '',
                email: '',
                company: '',
                phone: '',
                website: '',
                industry: '',
                companySize: '',
                subscriptionPlan: 'basic',
                status: 'active',
                monthlyRevenue: 0,
                projectsCount: 0
            })
        }
    }, [dialogProps.data])

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async () => {
        try {
            setLoading(true)
            
            if (dialogProps.type === 'ADD') {
                await customerApi.createCustomer(formData)
            } else {
                await customerApi.updateCustomer(dialogProps.data.id, formData)
            }
            
            onConfirm()
        } catch (error) {
            console.error('Error saving customer:', error)
            // Aqui você pode adicionar uma notificação de erro
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog
            open={show}
            onClose={onCancel}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2
                }
            }}
        >
            <DialogTitle sx={{ pb: 2 }}>
                <Typography variant="h2">
                    {dialogProps.type === 'ADD' ? 'Create New Customer' : 'Edit Customer'}
                </Typography>
            </DialogTitle>
            
            <DialogContent>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Customer Name *"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Email *"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Company"
                            value={formData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Website"
                            value={formData.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                            placeholder="https://example.com"
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Industry</InputLabel>
                            <Select
                                value={formData.industry}
                                onChange={(e) => handleInputChange('industry', e.target.value)}
                                label="Industry"
                            >
                                {industries.map((industry) => (
                                    <MenuItem key={industry} value={industry}>
                                        {industry}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Company Size</InputLabel>
                            <Select
                                value={formData.companySize}
                                onChange={(e) => handleInputChange('companySize', e.target.value)}
                                label="Company Size"
                            >
                                {companySizes.map((size) => (
                                    <MenuItem key={size} value={size}>
                                        {size}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Subscription Plan</InputLabel>
                            <Select
                                value={formData.subscriptionPlan}
                                onChange={(e) => handleInputChange('subscriptionPlan', e.target.value)}
                                label="Subscription Plan"
                            >
                                {subscriptionPlans.map((plan) => (
                                    <MenuItem key={plan.value} value={plan.value}>
                                        {plan.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                                label="Status"
                            >
                                {statusOptions.map((status) => (
                                    <MenuItem key={status.value} value={status.value}>
                                        {status.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Monthly Revenue ($)"
                            type="number"
                            value={formData.monthlyRevenue}
                            onChange={(e) => handleInputChange('monthlyRevenue', Number(e.target.value))}
                            InputProps={{ inputProps: { min: 0 } }}
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Projects Count"
                            type="number"
                            value={formData.projectsCount}
                            onChange={(e) => handleInputChange('projectsCount', Number(e.target.value))}
                            InputProps={{ inputProps: { min: 0 } }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3 }}>
                <Button
                    color="error"
                    onClick={onCancel}
                    startIcon={<IconX />}
                    disabled={loading}
                >
                    {dialogProps.cancelButtonName || 'Cancel'}
                </Button>
                
                <StyledButton
                    variant="contained"
                    onClick={handleSubmit}
                    startIcon={loading ? <CircularProgress size={20} /> : <IconCheck />}
                    disabled={loading || !formData.name || !formData.email}
                >
                    {dialogProps.confirmButtonName || 'Save'}
                </StyledButton>
            </DialogActions>
        </Dialog>
    )
}

EditCustomerDialog.propTypes = {
    show: PropTypes.bool,
    dialogProps: PropTypes.object,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func
}

export default EditCustomerDialog