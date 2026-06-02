import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export function UserProfile() {
  const { toast } = useToast()
  const record = pb.authStore.record

  const [profileData, setProfileData] = useState({
    name: record?.name || '',
    phone: record?.phone || '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    password: '',
    passwordConfirm: '',
  })

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!record?.id) return
    setSavingProfile(true)
    try {
      const formData = new FormData()
      formData.append('name', profileData.name)
      formData.append('phone', profileData.phone)
      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }
      await pb.collection('users').update(record.id, formData)
      toast({ title: 'Perfil atualizado', className: 'bg-success text-success-foreground' })
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar perfil', description: err.message, variant: 'destructive' })
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!record?.id) return
    if (passwordData.password !== passwordData.passwordConfirm) {
      toast({ title: 'Senhas não coincidem', variant: 'destructive' })
      return
    }
    setSavingPassword(true)
    try {
      await pb.collection('users').update(record.id, passwordData)
      toast({ title: 'Senha atualizada', className: 'bg-success text-success-foreground' })
      setPasswordData({ oldPassword: '', password: '', passwordConfirm: '' })
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar senha', description: err.message, variant: 'destructive' })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-subtle border-border/50">
        <CardHeader>
          <CardTitle>Dados Pessoais</CardTitle>
          <CardDescription>Atualize suas informações de contato.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Avatar</Label>
              <Input
                type="file"
                accept="image/jpeg, image/png"
                onChange={(e) => {
                  if (e.target.files?.[0]) setAvatarFile(e.target.files[0])
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                pattern="^\+?[0-9\s\-\(\)]+$"
                title="Formato de telefone inválido"
              />
            </div>
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-subtle border-border/50">
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
          <CardDescription>Altere sua senha de acesso.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Senha Atual</Label>
              <Input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Nova Senha</Label>
              <Input
                type="password"
                value={passwordData.password}
                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmar Nova Senha</Label>
              <Input
                type="password"
                value={passwordData.passwordConfirm}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, passwordConfirm: e.target.value })
                }
                minLength={8}
                required
              />
            </div>
            <Button type="submit" disabled={savingPassword} variant="secondary">
              {savingPassword ? 'Atualizando...' : 'Atualizar Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
