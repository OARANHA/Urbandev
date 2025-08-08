import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import * as PropTypes from 'prop-types'

// material-ui
import {
    Button,
    Box,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    useTheme,
    Chip,
    Drawer,
    Typography,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    LinearProgress
} from '@mui/material'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import ErrorBoundary from '@/ErrorBoundary'
import EditCustomerDialog from '@/views/customers/EditCustomerDialog'
import { StyledTableCell, StyledTableRow } from '@/ui-component/table/TableStyles'
import { PermissionIconButton, StyledPermissionButton } from '@/ui-component/button/RBACButtons'

// API
import customerApi from '@/api/customer'

// Hooks
import useApi from '@/hooks/useApi'
import useConfirm from '@/hooks/useConfirm'

// utils
import useNotifier from '@/utils/useNotifier'

// Icons
import { 
    IconTrash, 
    IconEdit, 
    IconX, 
    IconPlus, 
    IconUser, 
    IconEyeOff, 
    IconEye, 
    IconUserStar,
    IconBuildingStore,
    IconChartLine,
    IconMail,
    IconPhone,
    IconWorld,
    IconCurrencyDollar,
    IconUsers
} from '@tabler/icons-react'
import customers_emptySVG from '@/assets/images/users_empty.svg'

// store
import { useError } from '@/store/context/ErrorContext'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'

// ==============================|| CUSTOMER ROW ||============================== //

function ShowCustomerRow(props) {
    const customization = useSelector((state) => state.customization)
    const [open, setOpen] = useState(false)
    const [customerDetails, setCustomerDetails] = useState([])
    const theme = useTheme()

    const getCustomerDetails = useApi(customerApi.getCustomerDetails)

    const handleViewCustomerDetails = (customerId) => {
        setOpen(!open)
        getCustomerDetails.request(customerId)
    }

    useEffect(() => {
        if (getCustomerDetails.data) {
            setCustomerDetails(getCustomerDetails.data)
        }
    }, [getCustomerDetails.data])

    useEffect(() => {
        if (!open) {
            setOpen(false)
            setCustomerDetails([])
        }
    }, [open])

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'active': return 'success'
            case 'inactive': return 'error'
            case 'pending': return 'warning'
            default: return 'default'
        }
    }

    const getSubscriptionIcon = (plan) => {
        switch (plan.toLowerCase()) {
            case 'basic': return <IconUser size={16} />
            case 'professional': return <IconBuildingStore size={16} />
            case 'enterprise': return <IconChartLine size={16} />
            default: return <IconUser size={16} />
        }
    }

    return (
        <React.Fragment>
            <StyledTableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <StyledTableCell component='th' scope='row'>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <div style={{ width: 25, height: 25, marginRight: 10, borderRadius: '50%' }}>
                            <IconBuildingStore
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    objectFit: 'contain'
                                }}
                            />
                        </div>
                    </div>
                </StyledTableCell>
                <StyledTableCell>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {props.row.name}
                    </Typography>
                    {props.row.email && (
                        <>
                            <br />
                            <Typography variant="body2" color="textSecondary">
                                {props.row.email}
                            </Typography>
                        </>
                    )}
                </StyledTableCell>
                <StyledTableCell>
                    <Typography variant="body2">
                        {props.row.company || '-'}
                    </Typography>
                </StyledTableCell>
                <StyledTableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        {getSubscriptionIcon(props.row.subscriptionPlan)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {props.row.subscriptionPlan}
                        </Typography>
                    </Stack>
                </StyledTableCell>
                <StyledTableCell>
                    <Typography variant="body2">
                        {props.row.projectsCount || 0}
                    </Typography>
                </StyledTableCell>
                <StyledTableCell>
                    <Chip 
                        size='small' 
                        label={props.row.status.toUpperCase()} 
                        color={getStatusColor(props.row.status)}
                    />
                </StyledTableCell>
                <StyledTableCell>
                    {!props.row.lastLogin ? 'Never' : moment(props.row.lastLogin).format('DD/MM/YYYY')}
                </StyledTableCell>
                <StyledTableCell>
                    <PermissionIconButton
                        permissionId={'customers:manage'}
                        title='View Details'
                        color='primary'
                        onClick={() => handleViewCustomerDetails(props.row.id)}
                    >
                        {open ? <IconEyeOff /> : <IconEye />}
                    </PermissionIconButton>
                    <PermissionIconButton
                        permissionId={'customers:manage'}
                        title='Edit'
                        color='primary'
                        onClick={() => props.onEditClick(props.row)}
                    >
                        <IconEdit />
                    </PermissionIconButton>
                    {props.row.status.toLowerCase() !== 'active' && (
                        <PermissionIconButton
                            permissionId={'customers:manage'}
                            title='Delete'
                            color='error'
                            onClick={() => props.onDeleteClick(props.row)}
                        >
                            <IconTrash />
                        </PermissionIconButton>
                    )}
                </StyledTableCell>
            </StyledTableRow>
            <Drawer anchor='right' open={open} onClose={() => setOpen(false)} sx={{ minWidth: 320 }}>
                <Box sx={{ p: 4, height: 'auto', width: 650 }}>
                    <Typography sx={{ textAlign: 'left', mb: 2 }} variant='h2'>
                        Customer Details
                    </Typography>
                    {customerDetails && (
                        <Stack spacing={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Contact Information
                                    </Typography>
                                    <Stack spacing={2}>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <IconMail size={20} color={theme.palette.text.secondary} />
                                            <Typography variant="body2">
                                                {customerDetails.email || 'N/A'}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <IconPhone size={20} color={theme.palette.text.secondary} />
                                            <Typography variant="body2">
                                                {customerDetails.phone || 'N/A'}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <IconWorld size={20} color={theme.palette.text.secondary} />
                                            <Typography variant="body2">
                                                {customerDetails.website || 'N/A'}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Company Information
                                    </Typography>
                                    <Stack spacing={2}>
                                        <Typography variant="body2">
                                            <strong>Company:</strong> {customerDetails.company || 'N/A'}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Industry:</strong> {customerDetails.industry || 'N/A'}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Size:</strong> {customerDetails.companySize || 'N/A'}
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Subscription Details
                                    </Typography>
                                    <Stack spacing={2}>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <IconCurrencyDollar size={20} color={theme.palette.text.secondary} />
                                            <Typography variant="body2">
                                                Plan: {customerDetails.subscriptionPlan || 'N/A'}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body2">
                                            <strong>Projects:</strong> {customerDetails.projectsCount || 0}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Monthly Revenue:</strong> ${customerDetails.monthlyRevenue || '0'}
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Stack>
                    )}
                </Box>
            </Drawer>
        </React.Fragment>
    )
}

ShowCustomerRow.propTypes = {
    row: PropTypes.any,
    onDeleteClick: PropTypes.func,
    onEditClick: PropTypes.func,
    open: PropTypes.bool,
    theme: PropTypes.any
}

// ==============================|| CUSTOMERS ||============================== //

const Customers = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()
    useNotifier()
    const { error, setError } = useError()
    const currentUser = useSelector((state) => state.auth.user)

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [isLoading, setLoading] = useState(true)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [editDialogProps, setEditDialogProps] = useState({})
    const [customers, setCustomers] = useState([])
    const [search, setSearch] = useState('')
    const [deletingCustomerId, setDeletingCustomerId] = useState(null)
    const [stats, setStats] = useState({
        totalCustomers: 0,
        activeCustomers: 0,
        monthlyRevenue: 0,
        newCustomersThisMonth: 0
    })

    const { confirm } = useConfirm()

    const getAllCustomersApi = useApi(customerApi.getAllCustomers)
    const getCustomerStatsApi = useApi(customerApi.getCustomerStats)

    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }

    function filterCustomers(data) {
        return (
            data.name?.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
            data.email.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
            data.company?.toLowerCase().indexOf(search.toLowerCase()) > -1
        )
    }

    const addNew = () => {
        const dialogProp = {
            type: 'ADD',
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Create Customer',
            data: null
        }
        setEditDialogProps(dialogProp)
        setShowEditDialog(true)
    }

    const edit = (customer) => {
        const dialogProp = {
            type: 'EDIT',
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Save Changes',
            data: customer
        }
        setEditDialogProps(dialogProp)
        setShowEditDialog(true)
    }

    const deleteCustomer = async (customer) => {
        const confirmPayload = {
            title: `Delete Customer`,
            description: `Are you sure you want to delete ${customer.name}? This action cannot be undone.`,
            confirmButtonName: 'Delete',
            cancelButtonName: 'Cancel'
        }
        const isConfirmed = await confirm(confirmPayload)

        if (isConfirmed) {
            try {
                setDeletingCustomerId(customer.id)
                await customerApi.deleteCustomer(customer.id)
                enqueueSnackbar({
                    message: 'Customer deleted successfully',
                    options: {
                        key: new Date().getTime() + Math.random(),
                        variant: 'success',
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                <IconX />
                            </Button>
                        )
                    }
                })
                loadCustomerData()
            } catch (error) {
                enqueueSnackbar({
                    message: `Failed to delete customer: ${error.response?.data?.message || error.message}`,
                    options: {
                        key: new Date().getTime() + Math.random(),
                        variant: 'error',
                        persist: true,
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                <IconX />
                            </Button>
                        )
                    }
                })
            } finally {
                setDeletingCustomerId(null)
            }
        }
    }

    const onConfirm = () => {
        setShowEditDialog(false)
        loadCustomerData()
    }

    const loadCustomerData = () => {
        getAllCustomersApi.request()
        getCustomerStatsApi.request()
    }

    useEffect(() => {
        loadCustomerData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setLoading(getAllCustomersApi.loading)
    }, [getAllCustomersApi.loading])

    useEffect(() => {
        if (getAllCustomersApi.error) {
            setError(getAllCustomersApi.error)
        }
    }, [getAllCustomersApi.error, setError])

    useEffect(() => {
        if (getAllCustomersApi.data) {
            setCustomers(getAllCustomersApi.data || [])
        }
    }, [getAllCustomersApi.data])

    useEffect(() => {
        if (getCustomerStatsApi.data) {
            setStats(getCustomerStatsApi.data)
        }
    }, [getCustomerStatsApi.data])

    const StatCard = ({ title, value, icon, color }) => (
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h4" color="textSecondary" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 700, color }}>
                            {value}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: color + '20',
                            color: color
                        }}
                    >
                        {icon}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    )

    return (
        <>
            <MainCard>
                {error ? (
                    <ErrorBoundary error={error} />
                ) : (
                    <Stack flexDirection='column' sx={{ gap: 3 }}>
                        {/* Stats Cards */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    title="Total Customers"
                                    value={stats.totalCustomers}
                                    icon={<IconUsers size={24} />}
                                    color={theme.palette.primary.main}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    title="Active Customers"
                                    value={stats.activeCustomers}
                                    icon={<IconUser size={24} />}
                                    color={theme.palette.success.main}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    title="Monthly Revenue"
                                    value={`$${stats.monthlyRevenue}`}
                                    icon={<IconCurrencyDollar size={24} />}
                                    color={theme.palette.info.main}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    title="New This Month"
                                    value={stats.newCustomersThisMonth}
                                    icon={<IconUserStar size={24} />}
                                    color={theme.palette.warning.main}
                                />
                            </Grid>
                        </Grid>

                        {/* Table Header */}
                        <ViewHeader 
                            onSearchChange={onSearchChange} 
                            search={true} 
                            searchPlaceholder='Search Customers' 
                            title='Customer Management'
                        >
                            <StyledPermissionButton
                                permissionId={'customers:manage'}
                                variant='contained'
                                sx={{ borderRadius: 2, height: '100%' }}
                                onClick={addNew}
                                startIcon={<IconPlus />}
                                id='btn_createCustomer'
                            >
                                Add Customer
                            </StyledPermissionButton>
                        </ViewHeader>

                        {/* Table */}
                        <TableContainer component={Paper}>
                            {isLoading ? (
                                <Box sx={{ p: 3 }}>
                                    <LinearProgress />
                                    <Skeleton variant="rectangular" height={400} />
                                </Box>
                            ) : (
                                <Table>
                                    <TableHead
                                        sx={{
                                            backgroundColor: customization.isDarkMode ? theme.palette.common.black : theme.palette.grey[100],
                                            height: 56
                                        }}
                                    >
                                        <TableRow>
                                            <StyledTableCell></StyledTableCell>
                                            <StyledTableCell>Name</StyledTableCell>
                                            <StyledTableCell>Company</StyledTableCell>
                                            <StyledTableCell>Plan</StyledTableCell>
                                            <StyledTableCell>Projects</StyledTableCell>
                                            <StyledTableCell>Status</StyledTableCell>
                                            <StyledTableCell>Last Login</StyledTableCell>
                                            <StyledTableCell>Actions</StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {customers.filter(filterCustomers).map((row, index) => (
                                            <ShowCustomerRow
                                                key={index}
                                                row={row}
                                                onEditClick={edit}
                                                onDeleteClick={deleteCustomer}
                                                deletingCustomerId={deletingCustomerId}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </TableContainer>
                    </Stack>
                )}
            </MainCard>

            {/* Edit Customer Dialog */}
            {showEditDialog && (
                <EditCustomerDialog
                    show={showEditDialog}
                    dialogProps={editDialogProps}
                    onCancel={() => setShowEditDialog(false)}
                    onConfirm={onConfirm}
                />
            )}
        </>
    )
}

export default Customers