import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'

// material-ui
import { Stack, useTheme, Typography, Box, Alert, Button, Divider, Icon, Card, CardContent } from '@mui/material'
import { IconExclamationCircle } from '@tabler/icons-react'
import { LoadingButton } from '@mui/lab'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import { Input } from '@/ui-component/input/Input'

// Hooks
import useApi from '@/hooks/useApi'
import { useConfig } from '@/store/context/ConfigContext'

// API
import authApi from '@/api/auth'
import accountApi from '@/api/account.api'
import loginMethodApi from '@/api/loginmethod'
import ssoApi from '@/api/sso'

// utils
import useNotifier from '@/utils/useNotifier'

// store
import { loginSuccess, logoutSuccess } from '@/store/reducers/authSlice'
import { store } from '@/store'

// icons
import AzureSSOLoginIcon from '@/assets/images/microsoft-azure.svg'
import GoogleSSOLoginIcon from '@/assets/images/google.svg'
import Auth0SSOLoginIcon from '@/assets/images/auth0.svg'
import GithubSSOLoginIcon from '@/assets/images/github.svg'

// ==============================|| SignInPage ||============================== //

const SignInPage = () => {
    const theme = useTheme()
    useSelector((state) => state.customization)
    useNotifier()
    const { isEnterpriseLicensed, isCloud, isOpenSource } = useConfig()

    const usernameInput = {
        label: 'Email',
        name: 'username',
        type: 'email',
        placeholder: 'seu.email@empresa.com'
    }
    const passwordInput = {
        label: 'Senha',
        name: 'password',
        type: 'password',
        placeholder: '••••••••'
    }
    const [usernameVal, setUsernameVal] = useState('')
    const [passwordVal, setPasswordVal] = useState('')
    const [configuredSsoProviders, setConfiguredSsoProviders] = useState([])
    const [authError, setAuthError] = useState(undefined)
    const [loading, setLoading] = useState(false)
    const [showResendButton, setShowResendButton] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    const loginApi = useApi(authApi.login)
    const ssoLoginApi = useApi(ssoApi.ssoLogin)
    const getDefaultProvidersApi = useApi(loginMethodApi.getDefaultLoginMethods)
    const navigate = useNavigate()
    const location = useLocation()
    const resendVerificationApi = useApi(accountApi.resendVerificationEmail)

    const doLogin = (event) => {
        event.preventDefault()
        setLoading(true)
        const body = {
            email: usernameVal,
            password: passwordVal
        }
        loginApi.request(body)
    }

    useEffect(() => {
        if (loginApi.error) {
            setLoading(false)
            if (loginApi.error.response.status === 401 && loginApi.error.response.data.redirectUrl) {
                window.location.href = loginApi.error.response.data.data.redirectUrl
            } else {
                setAuthError(loginApi.error.response.data.message)
            }
        }
    }, [loginApi.error])

    useEffect(() => {
        store.dispatch(logoutSuccess())
        if (!isOpenSource) {
            getDefaultProvidersApi.request()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        // Parse the "user" query parameter from the URL
        const queryParams = new URLSearchParams(location.search)
        const errorData = queryParams.get('error')
        if (!errorData) return
        const parsedErrorData = JSON.parse(decodeURIComponent(errorData))
        setAuthError(parsedErrorData.message)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search])

    useEffect(() => {
        if (loginApi.data) {
            setLoading(false)
            store.dispatch(loginSuccess(loginApi.data))
            navigate(location.state?.path || '/chatflows')
            //navigate(0)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginApi.data])

    useEffect(() => {
        if (ssoLoginApi.data) {
            store.dispatch(loginSuccess(ssoLoginApi.data))
            navigate(location.state?.path || '/chatflows')
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ssoLoginApi.data])

    useEffect(() => {
        if (ssoLoginApi.error) {
            if (ssoLoginApi.error?.response?.status === 401 && ssoLoginApi.error?.response?.data.redirectUrl) {
                window.location.href = ssoLoginApi.error.response.data.redirectUrl
            } else {
                setAuthError(ssoLoginApi.error.message)
            }
        }
    }, [ssoLoginApi.error])

    useEffect(() => {
        if (getDefaultProvidersApi.data && getDefaultProvidersApi.data.providers) {
            //data is an array of objects, store only the provider attribute
            setConfiguredSsoProviders(getDefaultProvidersApi.data.providers.map((provider) => provider))
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getDefaultProvidersApi.data])

    useEffect(() => {
        if (authError === 'User Email Unverified') {
            setShowResendButton(true)
        } else {
            setShowResendButton(false)
        }
    }, [authError])

    const signInWithSSO = (ssoProvider) => {
        window.location.href = `/api/v1/${ssoProvider}/login`
    }

    const handleResendVerification = async () => {
        try {
            await resendVerificationApi.request({ email: usernameVal })
            setAuthError(undefined)
            setSuccessMessage('Email de verificação enviado com sucesso.')
            setShowResendButton(false)
        } catch (error) {
            setAuthError(error.response?.data?.message || 'Falha ao enviar email de verificação.')
        }
    }

    return (
        <>
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}22 0%, ${theme.palette.secondary.main}22 100%)`,
                    p: 2
                }}
            >
                <Card sx={{ maxWidth: 500, width: '100%', borderRadius: 3, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                    <CardContent sx={{ p: 4 }}>
                        <Stack sx={{ gap: 3 }}>
                            {/* Logo e Título */}
                            <Stack sx={{ alignItems: 'center', textAlign: 'center', gap: 2 }}>
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: 32,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    UD
                                </Box>
                                <Stack sx={{ gap: 1 }}>
                                    <Typography variant='h2' sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                        UrbanDev
                                    </Typography>
                                    <Typography variant='body1' sx={{ color: theme.palette.text.secondary }}>
                                        Plataforma de Desenvolvimento Inteligente
                                    </Typography>
                                </Stack>
                            </Stack>

                            {/* Mensagens de Alerta */}
                            {successMessage && (
                                <Alert variant='filled' severity='success' onClose={() => setSuccessMessage('')}>
                                    {successMessage}
                                </Alert>
                            )}
                            {authError && (
                                <Alert icon={<IconExclamationCircle />} variant='filled' severity='error'>
                                    {authError}
                                </Alert>
                            )}
                            {showResendButton && (
                                <Stack sx={{ gap: 1 }}>
                                    <Button variant='text' onClick={handleResendVerification}>
                                        Reenviar email de verificação
                                    </Button>
                                </Stack>
                            )}

                            {/* Formulário de Login */}
                            <form onSubmit={doLogin}>
                                <Stack sx={{ width: '100%', flexDirection: 'column', alignItems: 'left', justifyContent: 'center', gap: 3 }}>
                                    <Box sx={{ p: 0 }}>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            <Typography sx={{ fontWeight: 600, mb: 1 }}>
                                                Email<span style={{ color: 'red' }}>&nbsp;*</span>
                                            </Typography>
                                            <div style={{ flexGrow: 1 }}></div>
                                        </div>
                                        <Input
                                            inputParam={usernameInput}
                                            onChange={(newValue) => setUsernameVal(newValue)}
                                            value={usernameVal}
                                            showDialog={false}
                                        />
                                    </Box>
                                    <Box sx={{ p: 0 }}>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            <Typography sx={{ fontWeight: 600, mb: 1 }}>
                                                Senha<span style={{ color: 'red' }}>&nbsp;*</span>
                                            </Typography>
                                            <div style={{ flexGrow: 1 }}></div>
                                        </div>
                                        <Input inputParam={passwordInput} onChange={(newValue) => setPasswordVal(newValue)} value={passwordVal} />
                                        <Typography variant='body2' sx={{ color: theme.palette.grey[600], mt: 1, textAlign: 'right' }}>
                                            <Link style={{ color: theme.palette.primary.main }} to='/forgot-password'>
                                                Esqueceu sua senha?
                                            </Link>
                                        </Typography>
                                    </Box>
                                    <LoadingButton
                                        loading={loading}
                                        variant='contained'
                                        sx={{
                                            borderRadius: 2,
                                            height: 48,
                                            textTransform: 'none',
                                            fontSize: 16,
                                            fontWeight: 600,
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                            '&:hover': {
                                                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                                            }
                                        }}
                                        type='submit'
                                        fullWidth
                                    >
                                        Entrar
                                    </LoadingButton>
                                </Stack>
                            </form>

                            {/* Opções de Cadastro */}
                            {(isCloud || isEnterpriseLicensed) && (
                                <Stack sx={{ alignItems: 'center', gap: 1 }}>
                                    <Typography variant='body2' sx={{ color: theme.palette.text.secondary }}>
                                        Não tem uma conta?{' '}
                                        <Link style={{ color: theme.palette.primary.main, fontWeight: 600 }} to='/register'>
                                            Cadastre-se gratuitamente
                                        </Link>
                                    </Typography>
                                </Stack>
                            )}

                            {/* Divisor SSO */}
                            {configuredSsoProviders && configuredSsoProviders.length > 0 && (
                                <Stack sx={{ alignItems: 'center', gap: 2 }}>
                                    <Divider sx={{ width: '100%', my: 2 }}>
                                        <Typography variant='body2' sx={{ color: theme.palette.text.secondary }}>
                                            ou continue com
                                        </Typography>
                                    </Divider>
                                    
                                    <Stack sx={{ width: '100%', gap: 2 }}>
                                        {configuredSsoProviders.map(
                                            (ssoProvider) =>
                                                ssoProvider === 'google' && (
                                                    <Button
                                                        key={ssoProvider}
                                                        variant='outlined'
                                                        sx={{
                                                            borderRadius: 2,
                                                            height: 48,
                                                            textTransform: 'none',
                                                            fontSize: 16,
                                                            fontWeight: 500,
                                                            borderColor: theme.palette.divider,
                                                            '&:hover': {
                                                                borderColor: theme.palette.primary.main,
                                                                backgroundColor: theme.palette.primary.main + '10'
                                                            }
                                                        }}
                                                        onClick={() => signInWithSSO(ssoProvider)}
                                                        startIcon={
                                                            <Icon>
                                                                <img src={GoogleSSOLoginIcon} alt={'GoogleSSO'} width={20} height={20} />
                                                            </Icon>
                                                        }
                                                        fullWidth
                                                    >
                                                        Continuar com Google
                                                    </Button>
                                                )
                                        )}
                                        {configuredSsoProviders.map(
                                            (ssoProvider) =>
                                                ssoProvider === 'azure' && (
                                                    <Button
                                                        key={ssoProvider}
                                                        variant='outlined'
                                                        sx={{
                                                            borderRadius: 2,
                                                            height: 48,
                                                            textTransform: 'none',
                                                            fontSize: 16,
                                                            fontWeight: 500,
                                                            borderColor: theme.palette.divider,
                                                            '&:hover': {
                                                                borderColor: theme.palette.primary.main,
                                                                backgroundColor: theme.palette.primary.main + '10'
                                                            }
                                                        }}
                                                        onClick={() => signInWithSSO(ssoProvider)}
                                                        startIcon={
                                                            <Icon>
                                                                <img src={AzureSSOLoginIcon} alt={'MicrosoftSSO'} width={20} height={20} />
                                                            </Icon>
                                                        }
                                                        fullWidth
                                                    >
                                                        Continuar com Microsoft
                                                    </Button>
                                                )
                                        )}
                                        {configuredSsoProviders.map(
                                            (ssoProvider) =>
                                                ssoProvider === 'github' && (
                                                    <Button
                                                        key={ssoProvider}
                                                        variant='outlined'
                                                        sx={{
                                                            borderRadius: 2,
                                                            height: 48,
                                                            textTransform: 'none',
                                                            fontSize: 16,
                                                            fontWeight: 500,
                                                            borderColor: theme.palette.divider,
                                                            '&:hover': {
                                                                borderColor: theme.palette.primary.main,
                                                                backgroundColor: theme.palette.primary.main + '10'
                                                            }
                                                        }}
                                                        onClick={() => signInWithSSO(ssoProvider)}
                                                        startIcon={
                                                            <Icon>
                                                                <img src={GithubSSOLoginIcon} alt={'GithubSSO'} width={20} height={20} />
                                                            </Icon>
                                                        }
                                                        fullWidth
                                                    >
                                                        Continuar com GitHub
                                                    </Button>
                                                )
                                        )}
                                        {configuredSsoProviders.map(
                                            (ssoProvider) =>
                                                ssoProvider === 'auth0' && (
                                                    <Button
                                                        key={ssoProvider}
                                                        variant='outlined'
                                                        sx={{
                                                            borderRadius: 2,
                                                            height: 48,
                                                            textTransform: 'none',
                                                            fontSize: 16,
                                                            fontWeight: 500,
                                                            borderColor: theme.palette.divider,
                                                            '&:hover': {
                                                                borderColor: theme.palette.primary.main,
                                                                backgroundColor: theme.palette.primary.main + '10'
                                                            }
                                                        }}
                                                        onClick={() => signInWithSSO(ssoProvider)}
                                                        startIcon={
                                                            <Icon>
                                                                <img src={Auth0SSOLoginIcon} alt={'Auth0SSO'} width={20} height={20} />
                                                            </Icon>
                                                        }
                                                        fullWidth
                                                    >
                                                        Continuar com Auth0
                                                    </Button>
                                                )
                                        )}
                                    </Stack>
                                </Stack>
                            )}

                            {/* Rodapé */}
                            <Stack sx={{ alignItems: 'center', mt: 2 }}>
                                <Typography variant='caption' sx={{ color: theme.palette.text.secondary }}>
                                    © 2024 UrbanDev. Todos os direitos reservados.
                                </Typography>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </>
    )
}

export default SignInPage
