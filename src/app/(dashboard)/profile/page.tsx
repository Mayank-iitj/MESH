import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Key, ShieldAlert, LogOut, CheckCircle2 } from "lucide-react"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile & Settings</h2>
          <p className="text-muted-foreground mt-1">
            Manage your account details and developer API keys.
          </p>
        </div>
      </header>

      <div className="grid gap-8 max-w-4xl">
        {/* Account Details */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Account Details
            </CardTitle>
            <CardDescription>Your personal information and active session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center overflow-hidden">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-blue-400" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{session?.user?.name || "Admin User"}</h3>
                <p className="text-muted-foreground">{session?.user?.email || "admin@mesh.app"}</p>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400 font-medium bg-green-400/10 px-2 py-1 rounded-full">
                    Authenticated via {session?.user?.image ? 'Google OAuth' : 'Credentials'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-400" />
              Developer API Keys
            </CardTitle>
            <CardDescription>Use these keys to authenticate your autonomous agents with the MESH API.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Production Secret Key</label>
              <div className="flex gap-2">
                <Input 
                  value="sk_live_51O..." 
                  type="password" 
                  readOnly 
                  className="bg-background/50 font-mono text-muted-foreground"
                />
                <Button variant="outline">Reveal</Button>
                <Button variant="outline">Copy</Button>
              </div>
            </div>
            <div className="pt-4 flex justify-between items-center border-t border-border/50">
              <span className="text-sm text-muted-foreground">Last rotated: 2 days ago</span>
              <Button variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
                Rotate Keys
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <ShieldAlert className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-red-400/70">Irreversible actions for your account.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <p className="text-sm text-red-400/90">Sign out of your active session.</p>
            <form action="/api/auth/signout" method="POST">
              <Button type="submit" variant="destructive" className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
