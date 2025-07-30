'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CreditCard,
  Download,
  Calendar,
  Check,
  Zap,
  Crown,
  Star,
  ArrowRight,
} from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '$9',
    period: '/month',
    description: 'Perfect for small websites',
    features: [
      '1 website',
      '100 chats/month',
      'Basic customization',
      'Email support',
      'Chat history (30 days)',
    ],
    current: false,
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'Best for growing businesses',
    features: [
      '5 websites',
      '1,000 chats/month',
      'Advanced customization',
      'Priority support',
      'Chat history (90 days)',
      'AI responses',
      'Translation (50 languages)',
      'Analytics dashboard',
    ],
    current: true,
    popular: true,
  },
  {
    name: 'Pro Max',
    price: '$99',
    period: '/month',
    description: 'For large enterprises',
    features: [
      'Unlimited websites',
      'Unlimited chats',
      'Full customization',
      '24/7 phone support',
      'Unlimited chat history',
      'Advanced AI responses',
      'Translation (100+ languages)',
      'Advanced analytics',
      'API access',
      'White-label solution',
    ],
    current: false,
    popular: false,
  },
]

const invoices = [
  {
    id: 'INV-001',
    date: '2024-01-15',
    amount: '$29.00',
    status: 'Paid',
    plan: 'Pro',
  },
  {
    id: 'INV-002',
    date: '2023-12-15',
    amount: '$29.00',
    status: 'Paid',
    plan: 'Pro',
  },
  {
    id: 'INV-003',
    date: '2023-11-15',
    amount: '$29.00',
    status: 'Paid',
    plan: 'Pro',
  },
]

export default function BillingPage() {
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')

  const currentPlan = plans.find(plan => plan.current)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Plan</span>
            {currentPlan && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {currentPlan.name}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Your current subscription details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentPlan && (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{currentPlan.name} Plan</h3>
                <p className="text-muted-foreground">{currentPlan.description}</p>
                <p className="text-2xl font-bold mt-2">
                  {currentPlan.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    {currentPlan.period}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Next billing date</p>
                <p className="font-semibold">February 15, 2024</p>
              </div>
            </div>
          )}
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Usage this month</h4>
              <p className="text-sm text-muted-foreground">Chats used: 342 / 1,000</p>
              <div className="w-64 bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '34.2%' }}></div>
              </div>
            </div>
            <Button variant="outline">View Usage Details</Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  {plan.name === 'Starter' && <Zap className="w-5 h-5 text-blue-500" />}
                  {plan.name === 'Pro' && <Crown className="w-5 h-5 text-purple-500" />}
                  {plan.name === 'Pro Max' && <Star className="w-5 h-5 text-yellow-500" />}
                  <span>{plan.name}</span>
                  {plan.current && (
                    <Badge variant="secondary" className="ml-2">Current</Badge>
                  )}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-3xl font-bold">
                  {plan.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.current ? (
                  <Button className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        variant={plan.popular ? 'default' : 'outline'}
                        onClick={() => setSelectedPlan(plan.name)}
                      >
                        {plan.name === 'Pro Max' ? 'Upgrade' : plan.name === 'Pro' ? 'Upgrade' : 'Downgrade'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Payment Method</span>
          </CardTitle>
          <CardDescription>
            Manage your payment information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Billing History</span>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
          </CardTitle>
          <CardDescription>
            Your past invoices and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString()} • {invoice.plan} Plan
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium">{invoice.amount}</p>
                    <Badge variant="secondary" className="text-xs">
                      {invoice.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade to {selectedPlan}</DialogTitle>
          <DialogDescription>
            Complete your subscription upgrade
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-number">Card Number</Label>
            <Input id="card-number" placeholder="1234 5678 9012 3456" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input id="expiry" placeholder="MM/YY" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input id="cvc" placeholder="123" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Cardholder Name</Label>
            <Input id="name" placeholder="John Doe" />
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-bold">
              {plans.find(p => p.name === selectedPlan)?.price}/month
            </span>
          </div>
          <Button className="w-full">
            Complete Upgrade
          </Button>
        </div>
      </DialogContent>
    </div>
  )
}