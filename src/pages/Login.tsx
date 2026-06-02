import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import { HeartPulse, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import pb from '@/lib/pocketbase/client'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const loginSchema = z.object({
  email: z.string().email({ message: 'Formato de email inválido' }),
  password: z.string().min(8, { message: 'A senha deve ter no mínimo 8 caracteres' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const { login, carregando, usuario } = useAuth()
  const [resetEmail, setResetEmail] = useState('')
  const [resetting, setResetting] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    if (usuario) {
      navigate('/dashboard')
    }
  }, [usuario, navigate])

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast({ title: 'Preencha o e-mail', variant: 'destructive' })
      return
    }
    setResetting(true)
    try {
      await pb.collection('users').requestPasswordReset(resetEmail)
      toast({
        title: 'E-mail de recuperação enviado!',
        className: 'bg-success text-success-foreground',
      })
      setResetOpen(false)
      setResetEmail('')
    } catch (err: any) {
      toast({ title: 'Erro ao enviar e-mail', description: err.message, variant: 'destructive' })
    } finally {
      setResetting(false)
    }
  }

  const onSubmit = async (values: LoginFormValues) => {
    const { error } = await login(values.email, values.password)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login',
        description: typeof error === 'string' ? error : 'Credenciais inválidas. Tente novamente.',
      })
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm animate-fade-in-up">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex aspect-square size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <HeartPulse className="size-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Clínica Viva</CardTitle>
          <CardDescription>Entre com suas credenciais para acessar</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@clinica.com" {...field} disabled={carregando} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={carregando} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={carregando}>
                {carregando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2 border-t p-4">
          <Dialog open={resetOpen} onOpenChange={setResetOpen}>
            <DialogTrigger asChild>
              <Button variant="link" className="text-xs text-muted-foreground">
                Esqueceu a senha?
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Recuperar Senha</DialogTitle>
                <DialogDescription>
                  Digite seu e-mail para receber um link de redefinição de senha.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2 my-2">
                <div className="grid flex-1 gap-2">
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
                <Button onClick={handleResetPassword} disabled={resetting}>
                  {resetting ? <Loader2 className="size-4 animate-spin" /> : 'Enviar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="link" className="text-sm font-medium" asChild>
            <Link to="/solicitar-acesso">Não tem conta? Solicite Acesso</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
